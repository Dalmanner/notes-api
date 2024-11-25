import AWS from 'aws-sdk';
import { validateNote } from '../utils/validate.js';
import middy from '@middy/core';
import auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getNotes = middy(async (event) => {
  if (!event.user || !event.user.id) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": event.user.id },
  };
  const result = await dynamoDb.scan(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items.filter((note)=>!note.deleted))};
}).use(auth);

const createNote = middy(async (event) => {
  if (!event.user || !event.user.id) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const data = JSON.parse(event.body);
  validateNote(data);

  const note = {
    id: uuidv4(),
    userId: event.user.id,
    title: data.title,
    text: data.text,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };

  await dynamoDb
    .put({ TableName: process.env.DYNAMODB_TABLE, Item: note })
    .promise();

  return { statusCode: 201, body: JSON.stringify(note) };
}).use(auth);

const updateNote = middy(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing note ID in path parameters." }),
    };
  }

  const data = JSON.parse(event.body);
  validateNote(data);

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { id: event.pathParameters.id },
    UpdateExpression: "SET #title = :title, #text = :text, modifiedAt = :modifiedAt",
    ExpressionAttributeNames: {
      "#title": "title",
      "#text": "text"
    },
    ExpressionAttributeValues: {
      ":title": data.title,
      ":text": data.text,
      ":modifiedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDb.update(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Attributes) };
}).use(auth);

const deleteNote = middy(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Note Id is missing" }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { id: event.pathParameters.id },
    UpdateExpression: "SET deleted = :deleted",
    ExpressionAttributeValues: { ":deleted": true },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDb.update(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Attributes) };
}).use(auth);


export { getNotes, createNote, updateNote, deleteNote };

import AWS from 'aws-sdk';
import middy from '@middy/core';
import auth from '../middleware/auth.js';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const restoreNote = middy(async (event) => {
  if (!event.user || !event.user.id) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  if (!event.pathParameters || !event.pathParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing note ID in path parameters." }),
    };
  }

  const noteId = event.pathParameters.id;

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { id: noteId },
    UpdateExpression: "SET deleted = :deleted",
    ExpressionAttributeValues: { ":deleted": false },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDb.update(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Attributes) };
}).use(auth);

const getDeletedNotes = middy(async (event) => {
  if (!event.user || !event.user.id) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    FilterExpression: "userId = :userId AND deleted = :deleted",
    ExpressionAttributeValues: { ":userId": event.user.id, ":deleted": true },
  };
  const result = await dynamoDb.scan(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items.map((note) => ({ id: note.id, title: note.title }))) };
}).use(auth);

export { restoreNote, getDeletedNotes };
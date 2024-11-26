import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.DYNAMODB_TABLE;

const signup = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Username and password are required." }),
      };
    }

    const params = {
      TableName: USERS_TABLE,
      Key: { id: username },
    };
    const existingUser = await dynamoDb.get(params).promise();

    if (existingUser.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User already exists." }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: username,
      password: hashedPassword,
    };

    await dynamoDb
      .put({
        TableName: USERS_TABLE,
        Item: user,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User created successfully." }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error." }),
    };
  }
};

const login = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Username and password are required." }),
      };
    }

    const params = {
      TableName: USERS_TABLE,
      Key: { id: username },
    };
    const user = await dynamoDb.get(params).promise();

    if (!user.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid username or password." }),
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.Item.password);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid username or password." }),
      };
    }

    const token = jwt.sign(
      { id: user.Item.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        token,
        message: "Login successful, your session will expire in 1 hour."
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error." }),
    };
  }
};

export { signup, login };

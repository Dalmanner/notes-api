import jwt from 'jsonwebtoken';

const auth = {
  before: async (handler) => {
    try {
      const headers = handler.event.headers;
      console.log("Headers:", headers);

      const authorizationHeader = headers.authorization || headers.Authorization;
      console.log("Authorization Header:", authorizationHeader);

      if (!authorizationHeader) {
        throw new Error("Missing Authorization Header");
      }

      let token = authorizationHeader.replace('Bearer ', '');
      // Remove extra single quotes and 'Bearer ' from token
      token = token.replace(/['"]+/g, '');

      console.log("Token:", token);

      if (!token) {
        throw new Error("Missing Token");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);

      handler.event.user = decoded;
      console.log("Event User:", handler.event.user);
    } catch (err) {
      handler.response = {
        statusCode: 401,
        body: JSON.stringify({ message: err.message }),
      };
      throw err;
    }
  },
};

export default auth;

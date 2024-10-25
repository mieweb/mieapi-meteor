import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import './methods.js';
import { check } from 'meteor/check';


// Middleware to parse both text and JSON bodies
WebApp.connectHandlers.use(bodyParser.text({ type: 'text/plain' }));
WebApp.connectHandlers.use(bodyParser.json());  // Add support for JSON payloads

// CORS middleware
WebApp.connectHandlers.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://anshulmie.webchartnow.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  next();
});

// Generate connect token
const generateConnectToken = () => crypto.randomBytes(32).toString('base64').replace(/[/+=]/g, '');

// Handling WebChart callback at '/auth'
WebApp.connectHandlers.use('/auth', async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 405, message: 'Method Not Allowed' }));
  }

  try {
    console.log("Received headers:", JSON.stringify(req.headers, null, 2));
    console.log("Received body:", req.body);

    let payload;
    try {
      payload = JSON.parse(req.body);  // Attempt to parse the body as JSON
    } catch (e) {
      console.error('Invalid JSON:', e);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 400, message: 'Invalid JSON in request body' }));
    }

    const { authToken, user } = payload;
    const practice = payload.app.handle;

    if (!authToken || !user) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 400, message: 'Invalid payload. authToken and user are required.' }));
    }
    console.log('before validating auth token');
    // Verify the JWT token
    const validateResult = await Meteor.call('validateJwtToken', authToken);
    if (!validateResult.success) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 401, message: validateResult.message }));
    }

    const connectToken = generateConnectToken();
    const successResponse = {
      status: 200,
      message: "Account linked successfully!",
      connectToken,
      authUrl: `https://334f-2601-806-4200-e250-29e0-df8f-8001-1796.ngrok-free.app/callback?practice=${encodeURIComponent(practice)}`
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(successResponse));

    try {
      const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.connection.remoteAddress;
      const username = user.username;
      const handle = payload.app.handle;
      const wcUsrId = user.user_id;
      const existingUser = await Meteor.users.findOneAsync({ username: handle });

      if (existingUser) {
        // Update the existing user with the webchart service information
        await Meteor.users.updateAsync(
          { _id: existingUser._id },
          {
            $set: {
              'services.webchart': {
                wcUsrId,
                handle,
                username,
                connectToken,
                ip,
                valid: true
              }
            }
          }
        );
        console.log(`Connect Token updated for user ${username}.`);
      } else {
        console.error(`User with username ${username} not found.`);
      }
    } catch (error) {
      console.error('Error during user update:', error);
    }

  } catch (error) {
    console.error('Error processing request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 500, message: 'Internal server error' }));
  }
});


Meteor.methods({
  async generateJwtToken(practiceName) {
    const secretKey = '123456789'; // This is my random secret for miemeteor app
    const token = jwt.sign({ practiceName, timestamp: Date.now() }, secretKey, { expiresIn: '1h' });
    return token;
  },

  async validateJwtToken(token) {
    const secretKey = '123456789'; // This should match the key used for signing
    try {
      // Verify the token and extract the payload
      const decoded = jwt.verify(token, secretKey);
      return { success: true, decoded }; // Token is valid, return decoded payload
    } catch (error) {
      return { success: false, message: 'Invalid token' }; // Token validation failed
    }
  },
  async findUserByHandle(practice) {
    check(practice, String);

    try {
      // Query the user collection to find the user with the matching handle
      const user = await Meteor.users.findOneAsync({ 'services.webchart.handle': practice });

      if (!user) {
        throw new Meteor.Error('user-not-found', 'User not found for the provided practice name');
      }

      // Check if services and webchart exist
      if (!user.services || !user.services.webchart) {
        throw new Meteor.Error('data-missing', 'Webchart service information not found for user');
      }

      // Return the user object if found and fields exist
      return {
        _id: user._id,
        services: {
          webchart: {
            wcUsrId: user.services.webchart.wcUsrId,
            connectToken: user.services.webchart.connectToken,
            ip: user.services.webchart.ip,
          },
        },
      };
    } catch (error) {
      throw new Meteor.Error('database-error', error.message);
    }
  }
});

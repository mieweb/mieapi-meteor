import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MIEApi from 'mieapi';
import bcrypt from 'bcrypt';

let mieApiInstance = {}; // Use `let` to allow reassignment

Meteor.methods({
  // User Validation and Login Method
  async 'user.validateOrLogin'({ practice, username, password }) {
    check(practice, String);
    check(username, String);
    check(password, String);

    // Create MIEApi instance for session and user validation
    mieApiInstance = new MIEApi({
      baseUrl: `https://${practice}.webchartnow.com/webchart.cgi/json`,
      username,
      password,
      practice,
    });

    try {
      let existingUser = await Meteor.users.findOneAsync({ username });

      // Handle New User: Initialize session and insert into users collection
      if (!existingUser) {
        await mieApiInstance.initSession();
        const hashedPassword = await bcrypt.hash(password, 10);
        const sessionToken = mieApiInstance.cookie;

        await Meteor.users.insertAsync({
          username,
          createdAt: new Date(),
          services: {
            webchart: {
              practice,
              username,
              password: hashedPassword,
              sessionToken,
              valid: true,
            },
          },
        });

        console.log(`New user ${username} created.`);
      } else {
        // Handle Existing User: Ensure session is valid or refresh it
        await mieApiInstance.ensureSession();
        const sessionToken = mieApiInstance.cookie;

        await Meteor.users.updateAsync(existingUser._id, {
          $set: {
            'services.webchart': {
              practice,
              username,
              password: await bcrypt.hash(password, 10), // Rehash password
              sessionToken,
              valid: true,
            },
          },
        });

        console.log(`Session updated for user ${username}.`);
      }
      return { success: true };
    } catch (error) {
      console.error(`Error during login/validation: ${error.message}`);

      if (this.userId) {
        // Mark the user session as invalid on failure
        await Meteor.users.updateAsync(this.userId, {
          $set: { 'services.webchart.valid': false },
        });
      }

      throw new Meteor.Error('login_failed', error.message);
    }
  },

  // Generic API Request Method (Handles GET, POST, PUT)
  async 'callApi'(apiMethod, endpoint, params, jsonBody = null) {
    check(apiMethod, String);
    check(endpoint, String);
    check(params, Object);

    // Ensure user is logged in and has a valid session
    const user = await Meteor.users.findOneAsync({ username: mieApiInstance.username });

    if (!user || !user.services || !user.services.webchart) {
      throw new Meteor.Error('not-authorized', 'User is not logged in');
    }

    try {
      let response;
      switch (apiMethod.toUpperCase()) {
        case 'GET':
          response = await mieApiInstance.get(endpoint, params.filter + params.limit);
          break;
        case 'POST':
          check(jsonBody, Object); 
          response = await mieApiInstance.post(endpoint, params.filter + params.limit, jsonBody);
          break;
        case 'PUT':
          check(jsonBody, Object); 
          response = await mieApiInstance.put(endpoint, params.filter + params.limit, jsonBody);
          break;
        default:
          throw new Meteor.Error('invalid-method', 'Invalid API method');
      }

      return response; // Return the API response to the client
    } catch (err) {
      throw new Meteor.Error('api-failure', err.message); // Handle errors
    }
  },
});

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MIEApi from '@mieweb/mieapi';

let mieApiInstance = {};

Meteor.methods({
  async 'callApi'(practice, connectToken, ip, userId, apiMethod, endpoint, params, jsonBody=null) {
    check(apiMethod, String);
    check(practice, String);
    check(endpoint, String);
    check(params, Object);

    console.log('Calling API with params:', {
      practice,
      userId,
      apiMethod,
      endpoint,
      params
    });

    try {
      mieApiInstance = new MIEApi({
        baseUrl: `https://${practice}.webchartnow.com/webchart.cgi`,
        connectToken,
        userId,
        ip
      });

      // Ensure user is logged in and has a valid session
      const user = await Meteor.users.findOneAsync({ 'services.webchart.handle': practice });
      if (!user || !user.services || !user.services.webchart) {
        throw new Meteor.Error('not-authorized', 'User is not logged in');
      }

      let response;
      const formattedParams = {
        ...(params.filter && { filter: params.filter }),
        ...(params.limit && { limit: params.limit })
      };

      switch (apiMethod.toUpperCase()) {
        case 'GET':
          response = await mieApiInstance.get(endpoint, formattedParams);
          break;
        case 'POST':
          check(jsonBody, Object);
          response = await mieApiInstance.post(endpoint, formattedParams, jsonBody);
          break;
        case 'PUT':
          // check(jsonBody, Object);
          response = await mieApiInstance.put(endpoint, formattedParams, jsonBody);
          break;
        default:
          throw new Meteor.Error('invalid-method', 'Invalid API method');
      }

      return response;
    } catch (err) {
      console.error('API Call Failed:', err);
      throw new Meteor.Error('api-failure', err.message || 'Unknown error occurred');
    }
  },
});
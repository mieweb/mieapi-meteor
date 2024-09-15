import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import axios from 'axios';
import { MIEApi } from './mieapi';

const systemCachedResponses = {};

Meteor.methods({
  'Apps.WebChart.fetchLayout': async function (params) {
    if (!this.userId) {
      throw new Meteor.Error('not_logged_in', 'You must be logged in to call this method.');
    }

    // Make sure the user has a webchart account
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.services.webchart || !user.services.webchart.connectToken) {
      throw new Meteor.Error('no_webchart_account', 'You must have a WebChart account to use this feature.');
    }

    // get the first ip in x-forwarded-for if cf-connecting-ip is not available
    const ip = this.connection.httpHeaders['cf-connecting-ip'] || this.connection.httpHeaders['x-forwarded-for'].split(',')[0].trim();

    const mieapi = new MIEApi({
      baseUrl: user.services.webchart.app.baseurl,
      connectToken: user.services.webchart.connectToken,
      userId: user.services.webchart.user.user_id,
      ip: ip,
    });

    try {
      const response = await mieapi.fetchLayout(params);

      if (!response) {
        throw new Meteor.Error('error', `Error calling mieapi fetchLayout.`);
      }

      return response;
    } catch (err) {
      console.error('Error calling fetchLayout', err);
      throw new Meteor.Error('error', `Error calling mieapi fetchLayout`);
    }
  },
  'Apps.WebChart.API': async function (method, endpoint, params) {
    check(method, String);
    check(endpoint, String);
    check(params, Object);

    this.unblock();
    // you must be logged in to call this method
    if (!this.userId) {
      throw new Meteor.Error('not_logged_in', 'You must be logged in to call this method.');
    }

    // Make sure the user has a webchart account
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.services.webchart || !user.services.webchart.connectToken) {
      throw new Meteor.Error('no_webchart_account', 'You must have a WebChart account to use this feature.');
    }

    // get the first ip in x-forwarded-for if cf-connecting-ip is not available
    const ip = this.connection.httpHeaders['cf-connecting-ip'] || this.connection.httpHeaders['x-forwarded-for'].split(',')[0].trim();

    const mieapi = new MIEApi({
      baseUrl: user.services.webchart.app.baseurl,
      connectToken: user.services.webchart.connectToken,
      userId: user.services.webchart.user.user_id,
      ip: ip,
    });

    try {
      //if method is "get" then call get method, if method is "post" then call post method, etc.
      // supports get, put, post, delete
      console.log('Calling mieapi', method, endpoint, params);

      const res = await mieapi[method.toLowerCase()](endpoint, params);

      if (!res || !res.meta || res.meta.status !== '200') {

        console.log('RES IS ', res);

        throw new Meteor.Error('error', `Error calling mieapi ${endpoint} ${JSON.stringify(res.meta)}`);
      }

      return res;
    } catch (err) {
      console.error('Error calling ', method, endpoint, err);
      throw new Meteor.Error('error', `Error calling mieapi ${endpoint}`);
    }
  },
  'Apps.WebChart.testConnection': async function () {
    // you must be logged in to call this method
    if (!this.userId) {
      throw new Meteor.Error('not_logged_in', 'You must be logged in to call this method.');
    }

    // Make sure the user has a webchart account
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.services.webchart || !user.services.webchart.connectToken) {
      throw new Meteor.Error('no_webchart_account', 'You must have a WebChart account to use this feature.');
    }

    // get the first ip in x-forwarded-for if cf-connecting-ip is not available
    const ip = this.connection.httpHeaders['cf-connecting-ip'] || this.connection.httpHeaders['x-forwarded-for'].split(',')[0].trim();

    const mieapi = new MIEApi({
      baseUrl: user.services.webchart.app.baseurl,
      connectToken: user.services.webchart.connectToken,
      userId: user.services.webchart.user.user_id,
      ip: ip,
    });

    try {
      const res = await mieapi.get('db/users', { user_id: user.services.webchart.user.user_id });

      if (!res || !res.meta || res.meta.status !== '200') {
        throw new Meteor.Error('error', 'Connection attempt failed. Error calling mieapi db/users');
      }

      return 'Connection test successful.';
    } catch (err) {
      console.error('Error calling db/users', err);
      throw new Meteor.Error('error', 'Connection attempt failed. Error calling mieapi');
    }
  },
  'Apps.WebChart.generateAuthToken': async function () {

    // you must be logged in to call this method
    if (!this.userId) {
      throw new Meteor.Error('not_logged_in', 'You must be logged in to call this method.');
    }

    // Generate a random auth token
    const authToken = Random.secret(200);

    Meteor.users.updateAsync(this.userId, {
      $set: {
        'services.webchart.authToken': authToken,
        'services.webchart.authTokenCreatedAt': new Date()
      }
    });

    return authToken;
  },
  'Apps.WebChart.getSystemInfo': async function (handle) {
    check(handle, String);
    // you must be logged in to call this method
    if (!this.userId) {
      throw new Meteor.Error('not_logged_in', 'You must be logged in to call this method.');
    }


    // Function to fetch system info for a single handle
    const fetchSystemInfoForHandle = async (handle) => {
      // Check cache for valid response
      if (systemCachedResponses[handle] && systemCachedResponses[handle].cachedAt > (new Date().getTime() - (2 * 60 * 1000))) {
        console.log('Returning cached response for handle:', handle);
        return systemCachedResponses[handle];
      }

      console.log('Fetching system info for handle:', handle);

      // First axios request to fetch initial response
      const response = await axios({
        method: 'get',
        url: `https://mie.webchartnow.com/webchart.cgi?f=layoutnouser&name=HandleLookup&raw&json&apikey=RKsVJOZZEgLIBuxZzxJjoW3nlMtIBirjdnId6YTvDRD&handle=${encodeURIComponent(handle)}`,
        responseType: 'json',
        headers: {
          'User-Agent': 'BlueHive AI (getSystemInfo)',
        }
      });

      if (!response) {
        throw new Error('Error fetching handle data.');
      }

      if (!response.data || response.data.status !== 200) {
        throw new Error(response.data.message || 'Error fetching handle data.');
      }
      try {
        // Second axios request to fetch the image
        const imageResponse = await axios({
          method: 'get',
          url: `${response.data.url}?f=fsstream&sysfile=System+Logo&rawdata`,
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'BlueHive AI (getSystemInfo)',
          }
        });

        const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');

        // Cache and return the response
        systemCachedResponses[handle] = {
          cachedAt: new Date(),
          clientLogo: `data:image/jpeg;base64,${base64Image}`,
          ...response.data
        };

        return {
          clientLogo: `data:image/jpeg;base64,${base64Image}`,
          ...response.data
        };
      } catch (ex) {
        // Cache and return the response
        systemCachedResponses[handle] = {
          cachedAt: new Date(),
          ...response.data
        };

        return response.data
      }

    };

    try {
      // Use Promise.all to fetch system info for all handles in parallel
      const results = await fetchSystemInfoForHandle(handle);
      return results;
    } catch (error) {
      console.error('Error fetching handle information (3)', error);
      throw new Meteor.Error('Oops!', error.message);
    }
  },

  'Apps.WebChart.systemExists': function (url) {
    check(url, String);
    // you must be logged in to call this method
    if (!this.userId) {
      throw new Meteor.Error('not_logged_in', 'You must be logged in to call this method.');
    }
    console.log('Fetching', `${url}?f=wcrelease&json`);

    const getWebChartReleaseJSON = function (url, callback) {
      https.get(`${url}?f=wcrelease&json`, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          callback(null, data);
        });
      }).on('error', (err) => {
        callback(err);
      });
    };

    const getJSONSync = Meteor.wrapAsync(getWebChartReleaseJSON);
    const res = getJSONSync(url);
    if (!res) {
      throw new Meteor.Error('sorry', 'Something is broken please try again later.');
    }

    const wcReleaseJson = JSON.parse(res);

    if (!wcReleaseJson || !wcReleaseJson.wcrelease) {
      throw new Meteor.Error('bad_url', 'not_a_valid_webchart_url');
    }
    if (!wcReleaseJson.wcrelease.rc) {
      throw new Meteor.Error('bad_response', 'unable_to_find_rc_in_response');
    }

    // TODO: Figure out what release supports AI!
    if (parseInt(wcReleaseJson.wcrelease.rc.replace('RC', ''), 10) < 201906) {
      throw new Meteor.Error('too_old', 'old_webchart_release_rc201906');
    }

    return 'success';
  }
});

'use strict';

const debug = require('debug')('google-play-scraper');
const { ofetch } = require('ofetch');
const throttled = require('./throttle.js');

const requestLib = ofetch;

function doRequest (opts, limit) {
  let req;
  if (limit) {
    req = throttled(
      requestLib, {
        interval: 1000,
        limit: limit
      }
    );
  } else {
    req = requestLib;
  }

  return new Promise((resolve, reject) => {
    req(opts.url, {
      method: opts.method || 'GET',
      headers: opts.headers,
      body: opts.body,
      redirect: 'follow',
      ...opts.requestOptions
    })
      .then((body) => resolve(body))
      .catch((error) => reject(error));
  });
}

function request (opts, limit) {
  debug('Making request: %j', opts);
  return doRequest(opts, limit)
    .then(function (response) {
      debug('Request finished', { response });
      return response;
    })
    .catch(function (reason) {
      debug('Request error:', reason.message,
        reason.response && reason.response.status);

      let message = 'Error requesting Google Play:' + reason.message;
      if (reason.response && reason.response.status === 404) {
        message = 'App not found (404)';
      }
      const err = Error(message);
      err.status = reason.response && reason.response.status;
      throw err;
    });
}

module.exports = request;

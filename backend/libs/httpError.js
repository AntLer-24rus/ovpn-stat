const util = require('util');
const http = require('http');

function HttpEror(status, message) {
  // eslint-disable-next-line prefer-rest-params
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpEror);
  this.status = status;
  this.message = message || http.STATUS_CODES[status] || 'Error';
}
util.inherits(HttpEror, Error);
HttpEror.prototype.name = 'HttpError';

module.exports = HttpEror;

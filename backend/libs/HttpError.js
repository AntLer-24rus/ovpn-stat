var http = require('http');

function HttpError(status, message, data=null) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpError);

  this.status   = status;
  this.message  = message || http.STATUS_CODES[status] || 'Error';
  this.data     = data;
}

HttpError.prototype.name = 'HttpError';
module.exports.HttpError = HttpError;
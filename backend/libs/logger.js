const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');

const ENV = process.env.NODE_ENV.trim();

module.exports.logger = function getLogger(filename) {
  const pathToModule = filename
    .split(path.sep)
    .slice(-2)
    .join(path.sep);
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: ENV === 'development' ? 'debug' : 'error',
        label: pathToModule
      })
    ]
  });
};

module.exports.middlewareLogger = function middlewareLogger(labelName) {
  return expressWinston.logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: ENV === 'development' ? 'debug' : 'error',
        label: labelName
      })
    ],
    meta: false,
    msg: '{{req.method}} {{res.statusCode}} {{req.url}} {{req.body}} {{res.responseTime}} ms',
    colorize: true
  });
};

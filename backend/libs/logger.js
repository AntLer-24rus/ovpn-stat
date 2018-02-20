const winston = require('winston');
const path = require('path');

const ENV = process.env.NODE_ENV;

function getLogger(module) {
  const pathToModule = module.filename
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
}

module.exports = getLogger;

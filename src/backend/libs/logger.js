const winston = require("winston");
const path = require("path");

const ENV = process.env.NODE_ENV;

function getLogger(filename) {
  const pathToModule = filename
    .split(path.sep)
    .slice(-2)
    .join(path.sep);

  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: ENV === "development" ? "debug" : "error",
        label: pathToModule
      })
    ]
  });
}
// exports.getLogger = getLogger;
module.exports = getLogger;

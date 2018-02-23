/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

//  'use strickt';

const express = __webpack_require__(2);
const config = __webpack_require__(3);
const log = __webpack_require__(5)(__filename);
const patch = __webpack_require__(0);
const morgan = __webpack_require__(7);
const serveStatic = __webpack_require__(8);
const path = __webpack_require__(0);
const fs = __webpack_require__(9);
const moment = __webpack_require__(10);

const app = express();

function ReadStat(callback) {
  fs.readFile(config.get("OpenVPN-StatPath"), "utf8", (err, contents) => {
    const regexp1 = /^([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),(\d*),(\d*),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    const regexp2 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}),([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    const regexp3 = /^Updated,((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    let result = regexp1.exec(contents);
    const ClientList = [];
    while (result) {
      ClientList.push({
        CommonName: result[1],
        RealAddress: result[2],
        RealPort: result[3],
        BytesReceived: result[4],
        BytesSent: result[5],
        ConnectedSince: moment(result[6], "ddd MMM DD HH:mm:ss YYYY").format(
          "DD.MM.YYYY HH:mm:ss Z"
        )
      });
      result = regexp1.exec(contents);
    }
    result = regexp2.exec(contents);
    const RoutingTable = [];
    while (result) {
      RoutingTable.push({
        VirtualAddress: result[1],
        CommonName: result[2],
        RealAddress: result[3],
        RealPort: result[4],
        LastRef: moment(result[5], "ddd MMM DD HH:mm:ss YYYY").format("DD.MM.YYYY HH:mm:ss Z")
      });
      result = regexp2.exec(contents);
    }
    result = regexp3.exec(contents);
    let Update;
    if (result != null) {
      Update = moment(result[1], "ddd MMM DD HH:mm:ss YYYY").format("DD.MM.YYYY HH:mm:ss Z");
    } else {
      Update = null;
    }

    callback({
      Update,
      ClientList,
      RoutingTable
    });
  });
}

app.set("views", patch.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(morgan("dev"));
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));

// Описание использования body-parser https://github.com/expressjs/body-parser

app.get("/", (req, res) => {
  ReadStat(content => {
    res.render("partial/page-stat", content);
  });
});

app.get("/test", (req, res) => {
  res.end("hello world");
});

app.get("/status", (req, res) => {
  ReadStat(content => {
    res.send(JSON.stringify(content));
  });
});

app.get("/error", (req, res) => {
  antler(); /* eslint-disable-line */
  res.end();
});

/* eslint-disable next-line no-unused-vars */
app.use((req, res, next) => {
  res.end();
});

// Для включения jQuery необходимо использоавть webpack

// Отдача статики
app.use(serveStatic(path.join(__dirname, "public")));

// Обработчик ошибок
app.use((err, req, res) => {
  res.status(err.status || 500).render("error", {
    title: "Ошибка",
    message: err.message
  });
});

// app.listen(config.get("port"), config.get("hostname"), () => {
app.listen(80, "localhost", () => {
  log.info(`App listening "${config.get("hostname")}" on port ${config.get("port")}`);
});


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const nconf = __webpack_require__(4);
const path = __webpack_require__(0);

nconf
  .argv()
  .env()
  .file({ file: path.join(__dirname, "config.json") });

module.exports = nconf;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("nconf");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const winston = __webpack_require__(6);
const path = __webpack_require__(0);

const ENV = "development";

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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("serve-static");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ })
/******/ ]);
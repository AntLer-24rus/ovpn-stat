var app =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = _interopRequireDefault(__webpack_require__(3));

var _morgan = _interopRequireDefault(__webpack_require__(4));

var _serveStatic = _interopRequireDefault(__webpack_require__(5));

var _path = _interopRequireDefault(__webpack_require__(0));

var _fs = _interopRequireDefault(__webpack_require__(1));

var _moment = _interopRequireDefault(__webpack_require__(6));

var _config = _interopRequireDefault(__webpack_require__(7));

var _logger = _interopRequireDefault(__webpack_require__(9));

var _pageStat = _interopRequireDefault(__webpack_require__(11));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable-line */
var log = (0, _logger.default)(__filename);
var app = (0, _express.default)();

function ReadStat(callback) {
  _fs.default.readFile(_config.default.get('OpenVPN-StatPath'), 'utf8', function (err, contents) {
    var regexp1 = /^([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),(\d*),(\d*),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    var regexp2 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}),([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    var regexp3 = /^Updated,((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    var result = regexp1.exec(contents);
    var ClientList = [];

    while (result) {
      ClientList.push({
        CommonName: result[1],
        RealAddress: result[2],
        RealPort: result[3],
        BytesReceived: result[4],
        BytesSent: result[5],
        ConnectedSince: (0, _moment.default)(result[6], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss Z')
      });
      result = regexp1.exec(contents);
    }

    result = regexp2.exec(contents);
    var RoutingTable = [];

    while (result) {
      RoutingTable.push({
        VirtualAddress: result[1],
        CommonName: result[2],
        RealAddress: result[3],
        RealPort: result[4],
        LastRef: (0, _moment.default)(result[5], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss Z')
      });
      result = regexp2.exec(contents);
    }

    result = regexp3.exec(contents);
    var Update;

    if (result != null) {
      Update = (0, _moment.default)(result[1], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss Z');
    } else {
      Update = null;
    }

    callback({
      Update: Update,
      ClientList: ClientList,
      RoutingTable: RoutingTable
    });
  });
}

app.set('views', _path.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use((0, _morgan.default)('dev'));
log.debug("Publuc path ".concat(_path.default.join(__dirname, '../public')));
app.use('/public', _express.default.static(_path.default.join(__dirname, '../public'))); // Описание использования body-parser https://github.com/expressjs/body-parser

app.get('/', function (req, res) {
  ReadStat(function (content) {
    // res.render('partial/page-stat', content);
    content.title = 'test';
    /* eslint-disable-line */

    res.send((0, _pageStat.default)(content));
    res.end();
  });
});
app.get('/test', function (req, res) {
  res.end('hello world');
});
app.get('/status', function (req, res) {
  ReadStat(function (content) {
    res.send(JSON.stringify(content));
  });
});
app.get('/error', function (req, res) {
  antler();
  /* eslint-disable-line */

  res.end();
});
/* eslint-disable-next-line no-unused-vars */

app.use(function (req, res, next) {
  log.debug("Last midleware");
  next(new Error('tets'));
}); // Для включения jQuery необходимо использоавть webpack
// Отдача статики
// app.use(serveStatic(path.join(__dirname, 'public')));
// Обработчик ошибок

app.use(function (err, req, res) {
  log.debug("ErrorHandler");
  res.status(err.status || 500).render('error', {
    title: 'Ошибка',
    message: err.message
  });
});
app.listen(_config.default.get('port'), _config.default.get('hostname'), function () {
  log.info("App listening '".concat(_config.default.get('hostname'), "' on port ").concat(_config.default.get('port')));
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("serve-static");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var nconf = __webpack_require__(8);

var path = __webpack_require__(0);

nconf.argv().env().file({
  file: path.join(__dirname, "config.json")
});
module.exports = nconf;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("nconf");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var winston = __webpack_require__(10);

var path = __webpack_require__(0);

var ENV = "development";

function getLogger(filename) {
  var pathToModule = filename.split(path.sep).slice(-2).join(path.sep);
  return new winston.Logger({
    transports: [new winston.transports.Console({
      colorize: true,
      level: ENV === "development" ? "debug" : "error",
      label: pathToModule
    })]
  });
} // exports.getLogger = getLogger;


module.exports = getLogger;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var pug = __webpack_require__(12);

function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (ClientList, RoutingTable, Update, title) {pug_html = pug_html + "\u003C!DOCTYPE html\u003E\u003Chtml\u003E\u003Chead\u003E\u003Ctitle\u003E" + (pug.escape(null == (pug_interp = title) ? "" : pug_interp)) + "\u003C\u002Ftitle\u003E\u003Cscript src=\"public\u002Ftest.js\"\u003E\u003C\u002Fscript\u003E\u003C\u002Fhead\u003E\u003Cbody\u003E\u003Ch2\u003EПоследнее обновление в: " + (pug.escape(null == (pug_interp = Update) ? "" : pug_interp)) + "\u003C\u002Fh2\u003E\u003Ch3\u003EСписок клиентов\u003C\u002Fh3\u003E\u003Ctable id=\"client\"\u003E\u003Cthead\u003E\u003Ctr\u003E\u003Cth\u003ECommon Name\u003C\u002Fth\u003E\u003Cth\u003EReal Address\u003C\u002Fth\u003E\u003Cth\u003EBytes Received\u003C\u002Fth\u003E\u003Cth\u003EBytes Sent\u003C\u002Fth\u003E\u003Cth\u003EConnected Since\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003C\u002Fthead\u003E\u003Ctbody\u003E";
// iterate ClientList
;(function(){
  var $$obj = ClientList;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var row = $$obj[pug_index0];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.CommonName) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.RealAddress) ? "" : pug_interp)) + ":" + (pug.escape(null == (pug_interp = row.RealPort) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.BytesReceived) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.BytesSent) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.ConnectedSince) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var row = $$obj[pug_index0];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.CommonName) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.RealAddress) ? "" : pug_interp)) + ":" + (pug.escape(null == (pug_interp = row.RealPort) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.BytesReceived) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.BytesSent) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.ConnectedSince) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftbody\u003E\u003C\u002Ftable\u003E\u003Ch3\u003EТаблица маршрутов\u003C\u002Fh3\u003E\u003Ctable id=\"routing\"\u003E\u003Cthead\u003E\u003Ctr\u003E\u003Cth\u003EVirtual Address\u003C\u002Fth\u003E\u003Cth\u003ECommon Name\u003C\u002Fth\u003E\u003Cth\u003EReal Address\u003C\u002Fth\u003E\u003Cth\u003ELast Ref\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003C\u002Fthead\u003E\u003Ctbody\u003E";
// iterate RoutingTable
;(function(){
  var $$obj = RoutingTable;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var row = $$obj[pug_index1];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.VirtualAddress) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.CommonName) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.RealAddress) ? "" : pug_interp)) + ":" + (pug.escape(null == (pug_interp = row.RealPort) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.LastRef) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var row = $$obj[pug_index1];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.VirtualAddress) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.CommonName) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.RealAddress) ? "" : pug_interp)) + ":" + (pug.escape(null == (pug_interp = row.RealPort) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E" + (pug.escape(null == (pug_interp = row.LastRef) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftbody\u003E\u003C\u002Ftable\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";}.call(this,"ClientList" in locals_for_with?locals_for_with.ClientList:typeof ClientList!=="undefined"?ClientList:undefined,"RoutingTable" in locals_for_with?locals_for_with.RoutingTable:typeof RoutingTable!=="undefined"?RoutingTable:undefined,"Update" in locals_for_with?locals_for_with.Update:typeof Update!=="undefined"?Update:undefined,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return pug_html;};
module.exports = template;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var pug_has_own_property = Object.prototype.hasOwnProperty;

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = pug_merge;
function pug_merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = pug_merge(attrs, a[i]);
    }
    return attrs;
  }

  for (var key in b) {
    if (key === 'class') {
      var valA = a[key] || [];
      a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
    } else if (key === 'style') {
      var valA = pug_style(a[key]);
      var valB = pug_style(b[key]);
      a[key] = valA + valB;
    } else {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(Array.<string>|Object.<string, boolean>|string)} val
 * @param {?Array.<string>} escaping
 * @return {String}
 */
exports.classes = pug_classes;
function pug_classes_array(val, escaping) {
  var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);
  for (var i = 0; i < val.length; i++) {
    className = pug_classes(val[i]);
    if (!className) continue;
    escapeEnabled && escaping[i] && (className = pug_escape(className));
    classString = classString + padding + className;
    padding = ' ';
  }
  return classString;
}
function pug_classes_object(val) {
  var classString = '', padding = '';
  for (var key in val) {
    if (key && val[key] && pug_has_own_property.call(val, key)) {
      classString = classString + padding + key;
      padding = ' ';
    }
  }
  return classString;
}
function pug_classes(val, escaping) {
  if (Array.isArray(val)) {
    return pug_classes_array(val, escaping);
  } else if (val && typeof val === 'object') {
    return pug_classes_object(val);
  } else {
    return val || '';
  }
}

/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Object.<string, string>|string)} val
 * @return {String}
 */

exports.style = pug_style;
function pug_style(val) {
  if (!val) return '';
  if (typeof val === 'object') {
    var out = '';
    for (var style in val) {
      /* istanbul ignore else */
      if (pug_has_own_property.call(val, style)) {
        out = out + style + ':' + val[style] + ';';
      }
    }
    return out;
  } else {
    val += '';
    if (val[val.length - 1] !== ';') 
      return val + ';';
    return val;
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = pug_attr;
function pug_attr(key, val, escaped, terse) {
  if (val === false || val == null || !val && (key === 'class' || key === 'style')) {
    return '';
  }
  if (val === true) {
    return ' ' + (terse ? key : key + '="' + key + '"');
  }
  if (typeof val.toJSON === 'function') {
    val = val.toJSON();
  }
  if (typeof val !== 'string') {
    val = JSON.stringify(val);
    if (!escaped && val.indexOf('"') !== -1) {
      return ' ' + key + '=\'' + val.replace(/'/g, '&#39;') + '\'';
    }
  }
  if (escaped) val = pug_escape(val);
  return ' ' + key + '="' + val + '"';
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */
exports.attrs = pug_attrs;
function pug_attrs(obj, terse){
  var attrs = '';

  for (var key in obj) {
    if (pug_has_own_property.call(obj, key)) {
      var val = obj[key];

      if ('class' === key) {
        val = pug_classes(val);
        attrs = pug_attr(key, val, false, terse) + attrs;
        continue;
      }
      if ('style' === key) {
        val = pug_style(val);
      }
      attrs += pug_attr(key, val, false, terse);
    }
  }

  return attrs;
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var pug_match_html = /["&<>]/;
exports.escape = pug_escape;
function pug_escape(_html){
  var html = '' + _html;
  var regexResult = pug_match_html.exec(html);
  if (!regexResult) return _html;

  var result = '';
  var i, lastIndex, escape;
  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
    switch (html.charCodeAt(i)) {
      case 34: escape = '&quot;'; break;
      case 38: escape = '&amp;'; break;
      case 60: escape = '&lt;'; break;
      case 62: escape = '&gt;'; break;
      default: continue;
    }
    if (lastIndex !== i) result += html.substring(lastIndex, i);
    lastIndex = i + 1;
    result += escape;
  }
  if (lastIndex !== i) return result + html.substring(lastIndex, i);
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the pug in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @param {String} str original source
 * @api private
 */

exports.rethrow = pug_rethrow;
function pug_rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || __webpack_require__(1).readFileSync(filename, 'utf8')
  } catch (ex) {
    pug_rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Pug') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};


/***/ })
/******/ ]);
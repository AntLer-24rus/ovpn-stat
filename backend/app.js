'use strickt';

const express = require('express');
const config = require('./libs/config');
const log = require('./libs/logger')(__filename);
const patch = require('path');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const util = require('util');

const app = express();

function HttpEror(status, message) {
  this.status = status;
  this.message = message;
  // Error.captureStackTrace(this, HttpEror);
}
util.inherits(HttpEror, Error);
HttpEror.prototype.name = 'HttpError';

function ReadStat(callback) {
  fs.readFile(config.get('OpenVPN-StatPath'), 'utf8', (err, contents) => {
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
        ConnectedSince: moment(result[6], 'ddd MMM DD HH:mm:ss YYYY').format(
          'DD.MM.YYYY HH:mm:ss Z'
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
        LastRef: moment(result[5], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss Z')
      });
      result = regexp2.exec(contents);
    }
    result = regexp3.exec(contents);
    let Update;
    if (result != null) {
      Update = moment(result[1], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss Z');
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
// Шаблонизатор
app.set('views', patch.join(__dirname, 'views/partial'));
app.set('view engine', 'pug');
// Логирование
app.use(morgan('dev'));
// Отдача статики
app.use('/public', express.static(path.join(__dirname, '../public')));

// Описание использования body-parser https://github.com/expressjs/body-parser

app.get('/', (req, res) => {
  res.append('Cache-Control', 'no-cache');
  ReadStat(content => {
    res.render('page-stat', content);
  });
});

app.get('/status', (req, res) => {
  ReadStat(content => {
    res.send(JSON.stringify(content));
  });
});

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(200);
});
// app.get('/error', (req, res) => {
//   antler(); /* eslint-disable-line */
//   res.end();
// });

// app.use('/forbidden', (req, res, next) => {
//   next(new HttpEror(403, 'Достап запрещен!!!'));
// });

app.use((req, res, next) => {
  next(new HttpEror(404, `Упс!! Страница ${req.originalUrl} не найдена...`));
});

// Для включения jQuery необходимо использоавть webpack

// Обработчик ошибок
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  log.debug(
    `Ошибка [${err.name}] сообщение: [${err.message}]${err.stack ? `\n    ${err.stack}` : ``}`
  );
  switch (err.constructor) {
    case HttpEror:
      res.status(err.status).render('httperror', {
        title: 'Страница не найдена',
        status: err.status,
        message: err.message
      });
      break;
    default:
      if (app.get('env') === 'development') {
        res.status(500).render('error', {
          title: 'Ошибка',
          message: err.message,
          stack: err.stack
        });
      } else {
        res.sendStatus(500);
      }
  }
});

app.listen(config.get('port'), config.get('hostname'), () => {
  log.info(`App listening [http://${config.get('hostname')}:${config.get('port')}]`);
});

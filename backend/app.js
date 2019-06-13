'use strickt';

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'prodaction';

const express = require('express');
const config = require('./libs/config');
const logger = require('./libs/logger');
const patch = require('path');
// const morgan = require('morgan');
// const serveStatic = require('serve-static');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const util = require('util');
const chokidar = require('chokidar');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const log = logger.logger(__filename);
const mwLog = logger.middlewareLogger(`http://${config.get('hostname')}:${config.get('port')}`);

function HttpEror(status, message) {
  this.status = status;
  this.message = message;
  // Error.captureStackTrace(this, HttpEror);
}
util.inherits(HttpEror, Error);
HttpEror.prototype.name = 'HttpError';

function ReadStat(callback) {
  fs.readFile(config.get('OpenVPN-StatPath'), 'utf8', (err, contents) => {
    if (err) {
      log.error(err);
    }

    const regexp1 = /^([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),(\d*),(\d*),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    const regexp2 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}),([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    const regexp3 = /^Updated,((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    let result = regexp1.exec(contents);
    const ClientList = [];
    while (result) {
      ClientList.push({
        CommonName: result[1],
        RealAddress: result[2],
        RealPort: result[3],
        BytesReceived: (Number(result[4]) / 1024 / 1024).toFixed(2),
        BytesSent: (Number(result[5]) / 1024 / 1024).toFixed(2),
        ConnectedSince: moment(result[6], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss')
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
        LastRef: moment(result[5], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss')
      });
      result = regexp2.exec(contents);
    }
    result = regexp3.exec(contents);
    const Update = {};
    if (result != null) {
      Update.date = moment(result[1], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY');
      Update.time = moment(result[1], 'ddd MMM DD HH:mm:ss YYYY').format('HH:mm:ss');
    } else {
      Update.date = null;
      Update.time = null;
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

// app.use(morgan('dev'));
app.use(mwLog);

// fs.watchFile(config.get('OpenVPN-StatPath'), () => {
//   log.debug('Файл изменился');
// });

io.on('connection', socket => {
  const watcher = chokidar
    .watch(config.get('OpenVPN-StatPath'))
    .on('change', () => {
      log.debug('Файл обновился, читаю изменения...');
      ReadStat(data => {
        log.debug('Отправка изменений клиенту');
        socket.emit('stat-change', data);
      });
    })
    .on('ready', () => {
      log.debug('Началось отслеживание файла');
    });

  socket.on('disconnect', () => {
    watcher.unwatch();
    log.debug('Закончилось отслеживание файла');
  });
});

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

server.listen(config.get('port'), config.get('hostname'), () => {
  let msg;
  if (process.env.NODE_ENV.trim() === 'development') {
    msg = '\x1b[31mПриложение запущено в режиме разработки\x1b[0m и слушает:';
  } else {
    msg = 'Приложение слушает:';
  }
  log.info(`${msg} \x1b[36m[http://${config.get('hostname')}:${config.get('port')}]\x1b[0m`);
});

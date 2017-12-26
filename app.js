'use strickt';

const express = require('express');
const config = require('./libs/config');
const log = require('./libs/logger')(module);
const patch = require('path');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();

app.set('views', patch.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(morgan('dev'));

// Описание использования body-parser https://github.com/expressjs/body-parser

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/error', (req, res) => {
  antler();
});

app.use((req, res, next) => {
  next();
});

// Для включения jQuery необходимо использоавть webpack

// Отдача статики
app.use(serveStatic(path.join(__dirname, 'public')));

// Обработчик ошибок
app.use((err, req, res, next) => {
  res.status(err.status || 500).render('error', {
    title: 'Ошибка',
    message: err.message,
  });
});

app.listen(config.get('port'), () => {
  log.info('Example app listening on port 3000');
});

"use strickt";

process.env.NODE_ENV = process.env.NODE_ENV
  ? process.env.NODE_ENV
  : "prodaction";

const express = require("express");
const session = require("express-session");
const config = require("./libs/config");
const logger = require("./libs/logger");
const HttpEror = require("./libs/httpError");

const path = require("path");

const app = express();
const server = require("http").Server(app);
require("./socket")(server);
const router = require("./routes");

const log = logger.logger(__filename);
const mwLog = logger.middlewareLogger(
  `http://${config.get("hostname")}:${config.get("port")}`
);

// Шаблонизатор
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// Логирование
app.use(mwLog);

app.use(express.json()); //TODO: Body-parcer?? // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(
  session({
    name: "sessionID",
    secret: "sdi",
    httpOnly: true
  })
);

// Отдача статики
app.use("/public", express.static(path.join(__dirname, "../public")));

app.use("/auth", router.auth);
app.use("/status", router.status);

app.get("/", (req, res) => {
  res.locals.path = "/";
  res.render("main");
});

app.get("/favicon.ico", (req, res) => {
  res.sendStatus(200);
});

app.get("/error", (req, res) => {
  antler(); /* eslint-disable-line */
  res.end();
});

app.use((req, res, next) => {
  next(new HttpEror(404, `Упс!! Страница ${req.originalUrl} не найдена...`));
});

// Обработчик ошибок
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  log.error(
    `Ошибка [${err.name}] сообщение: [${err.message}] ${
      err.stack ? `\n    ${err.stack}` : ``
    }`
  );
  switch (err.constructor) {
    case HttpEror:
      if (res.req.xhr) {
        res.status(err.status).json({ error: true, errorDescr: err.message });
      } else {
        res.status(err.status).render("httperror", {
          title: "Страница не найдена",
          status: err.status,
          message: err.message
        });
      }

      break;
    default:
      if (app.get("env") === "development") {
        if (res.req.xhr) {
          res.status(500).json({ error: true, errorDescr: err.message });
        } else {
          res.status(500).render("error", {
            title: "Ошибка",
            message: err.message,
            stack: err.stack
          });
        }
      } else {
        res.sendStatus(500);
      }
  }
});

server.listen(config.get("port"), config.get("hostname"), () => {
  let msg;
  if (process.env.NODE_ENV.trim() === "development") {
    msg = "\x1b[31mПриложение запущено в режиме разработки\x1b[0m и слушает:";
  } else {
    msg = "Приложение слушает:";
  }
  log.info(
    `${msg} \x1b[36m[http://${config.get("hostname")}:${config.get(
      "port"
    )}]\x1b[0m`
  );
});

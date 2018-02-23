//  'use strickt';

const express = require("express");
const config = require("./libs/config");
const log = require("./libs/logger")(__filename);
const patch = require("path");
const morgan = require("morgan");
const serveStatic = require("serve-static");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

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

/* eslint-disable-next-line no-unused-vars */
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

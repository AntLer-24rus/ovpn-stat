const express = require("express");
// const fs = require("fs");
// const moment = require("moment");

// const logger = require("../libs/logger");
// const HttpEror = require('../libs/httpError');
// const config = require("../libs/config");

const readStat = require("../ovpn-parser");

// const log = logger.logger(__filename);
const router = express.Router();

// function ReadStat(callback) {
// fs.readFile(config.get('OpenVPN-StatPath'), 'utf8', (err, contents) => {
//   if (err) {
//     log.error(err);
//   }

//   const regexp1 = /^([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),(\d*),(\d*),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
//   const regexp2 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}),([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
//   const regexp3 = /^Updated,((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
//   let result = regexp1.exec(contents);
//   const ClientList = [];
//   while (result) {
//     ClientList.push({
//       CommonName: result[1],
//       RealAddress: result[2],
//       RealPort: result[3],
//       BytesReceived: (Number(result[4]) / 1024 / 1024).toFixed(2),
//       BytesSent: (Number(result[5]) / 1024 / 1024).toFixed(2),
//       ConnectedSince: moment(result[6], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss')
//     });
//     result = regexp1.exec(contents);
//   }
//   result = regexp2.exec(contents);
//   const RoutingTable = [];
//   while (result) {
//     RoutingTable.push({
//       VirtualAddress: result[1],
//       CommonName: result[2],
//       RealAddress: result[3],
//       RealPort: result[4],
//       LastRef: moment(result[5], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY HH:mm:ss')
//     });
//     result = regexp2.exec(contents);
//   }
//   result = regexp3.exec(contents);
//   const Update = {};
//   if (result != null) {
//     Update.date = moment(result[1], 'ddd MMM DD HH:mm:ss YYYY').format('DD.MM.YYYY');
//     Update.time = moment(result[1], 'ddd MMM DD HH:mm:ss YYYY').format('HH:mm:ss');
//   } else {
//     Update.date = null;
//     Update.time = null;
//   }

//   callback({ Update, ClientList, RoutingTable });
// });
// }

router.get("/", (req, res) => {
  res.locals.path = "/status";
  res.append("Cache-Control", "no-cache");
  readStat(content => {
    res.render("page-status20", content);
  });
});

module.exports = router;

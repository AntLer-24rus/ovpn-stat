const config = require("../libs/config");
const logger = require("../libs/logger");
const fs = require("fs");
const moment = require("moment");

const log = logger.logger(__filename);

function triads(dig, sep = String.fromCharCode(160), dot = ",", frac = 2) {
  // sep = sep || ;
  // dot = dot || ",";
  // if (typeof frac === "undefined") frac = 2;

  let num = parseInt(dig, 10).toString();

  const reg = /(-?\d+)(\d{3})/;

  while (reg.test(num)) num = num.replace(reg, `$1${sep}$2`);

  if (!frac) return num;

  let a = dig.toString();
  if (a.indexOf(".") >= 0) {
    a = a.toString().substr(a.indexOf(".") + 1, frac);
    a += new Array(frac - a.length + 1).join("0");
  } else a = new Array(frac + 1).join("0");

  return num + dot + a;
}

module.exports = callback => {
  fs.readFile(config.get("OpenVPN-StatPath"), "utf8", (err, contents) => {
    if (err) {
      log.error(err);
    }

    const regexp1 = /^([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),(\d*),(\d*),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    const regexp2 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}.*),([a-zA-Z0-9_-]*),(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{2,5}),((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    const regexp3 = /^Updated,((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\s\d{4})/gm;
    let result = regexp1.exec(contents);
    const ClientList = [];
    while (result) {
      ClientList.push({
        CommonName: result[1],
        RealAddress: result[2],
        VirtualAddresses: [],
        RealPort: result[3],
        BytesReceived: triads(Number(result[4]) / 1024),
        BytesSent: triads(Number(result[5]) / 1024),
        ConnectedSince: moment(result[6], "ddd MMM DD HH:mm:ss YYYY").format(
          "DD.MM.YYYY HH:mm:ss"
        )
      });
      result = regexp1.exec(contents);
    }
    ClientList.sort((a, b) => {
      if (a.CommonName > b.CommonName) {
        return 1;
      }
      if (a.CommonName < b.CommonName) {
        return -1;
      }
      return 0;
    });
    result = regexp2.exec(contents);
    const RoutingTable = [];
    while (result) {
      const client = ClientList.find(i => i.CommonName === result[2]);
      if (client) {
        client.VirtualAddresses.push({
          ip: result[1],
          LastRef: moment(result[5], "ddd MMM DD HH:mm:ss YYYY").format(
            "DD.MM.YYYY HH:mm:ss"
          )
        });
        client.VirtualAddresses.sort((a, b) => {
          if (a.ip > b.ip) {
            return 1;
          }
          if (a.ip < b.ip) {
            return -1;
          }
          return 0;
        });
      }

      RoutingTable.push({
        VirtualAddress: result[1],
        CommonName: result[2],
        RealAddress: result[3],
        RealPort: result[4],
        LastRef: moment(result[5], "ddd MMM DD HH:mm:ss YYYY").format(
          "DD.MM.YYYY HH:mm:ss"
        )
      });
      result = regexp2.exec(contents);
    }
    RoutingTable.sort((a, b) => {
      if (a.CommonName > b.CommonName) {
        return 1;
      }
      if (a.CommonName < b.CommonName) {
        return -1;
      }
      return 0;
    });
    result = regexp3.exec(contents);
    const Update = {};
    if (result != null) {
      Update.date = moment(result[1], "ddd MMM DD HH:mm:ss YYYY").format(
        "DD.MM.YYYY"
      );
      Update.time = moment(result[1], "ddd MMM DD HH:mm:ss YYYY").format(
        "HH:mm:ss"
      );
    } else {
      Update.date = null;
      Update.time = null;
    }

    callback({ Update, ClientList, RoutingTable });
  });
};

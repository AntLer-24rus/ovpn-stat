const config = require("../libs/config");
const logger = require("../libs/logger");
const readStat = require("../ovpn-parser");

const SocketIO = require("socket.io");
const chokidar = require("chokidar");

const log = logger.logger(__filename);

let clientCount = 0;

module.exports = server => {
  const io = SocketIO(server);

  io.on("connection", socket => {
    log.debug(`Подключился клиент ${socket.client.id} (${++clientCount})`);
    const watcher = chokidar
      .watch(config.get("OpenVPN-StatPath"))
      .on("change", () => {
        log.debug("Файл обновился, читаю изменения...");
        readStat(data => {
          log.debug("Отправка изменений клиенту");
          socket.emit("stat-change", data);
        });
      })
      .on("ready", () => {
        log.debug("Началось отслеживание файла");
      });

    socket.on("disconnect", () => {
      log.debug(`Клиент ${socket.client.id} отключился (${--clientCount})`);
      watcher.unwatch();
      log.debug("Закончилось отслеживание файла");
    });
  });
};

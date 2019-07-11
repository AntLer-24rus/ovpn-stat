const config = require("../libs/config");
const logger = require("../libs/logger");
const readStat = require("../ovpn-parser");

const SocketIO = require("socket.io");
const chokidar = require("chokidar");

const log = logger.logger(__filename);

module.exports = server => {
  const io = SocketIO(server);

  io.on("connection", socket => {
    log.debug(`Подключился клиент ${socket}`);
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
      watcher.unwatch();
      log.debug("Закончилось отслеживание файла");
    });
  });
};

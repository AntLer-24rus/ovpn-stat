import $ from "jquery";
import io from "socket.io-client";

const socket = io("http://localhost");

socket.emit("msg", { data: "запрос на сервер" });
socket.on("msg", data => {
  console.log(data);
});
socket.on("msg3", data => {
  console.log(data);
  socket.emit("msg3", "ответ получен");
});
socket.on("stat-change", data => {
  console.log("Принял изменения, обновляю талицы....");
  $("#client > tbody > tr").remove();
  $("#routing > tbody > tr").remove();
  $("#udate")
    .empty()
    .append(data.Update.date);
  $("#utime")
    .empty()
    .append(data.Update.time);
  data.ClientList.forEach(client => {
    const row = $("<tr>")
      .append(`<td>${client.CommonName}</td>`)
      .append(`<td>${client.RealAddress}:${client.RealPort}</td>`)
      .append(`<td>${client.BytesReceived}</td>`)
      .append(`<td>${client.BytesSent}</td>`)
      .append(`<td>${client.ConnectedSince}</td>`);
    $("#client > tbody:last-child").append(row);
  });
  data.RoutingTable.forEach(rout => {
    const row = $("<tr>")
      .append(`<td>${rout.VirtualAddress}</td>`)
      .append(`<td>${rout.CommonName}</td>`)
      .append(`<td>${rout.RealAddress}:${rout.RealPort}</td>`)
      .append(`<td>${rout.LastRef}</td>`);
    $("#routing > tbody:last-child").append(row);
  });
});

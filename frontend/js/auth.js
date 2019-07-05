import $ from 'jquery';
import CryptoJS from 'crypto-js';

$('#authForm').on('submit', (event) => {

  //var hash = CryptoJS.SHA256($('#inputEmail').val() + ':' + $('#inputPassword').val());
  var hash = CryptoJS.SHA256('test@main.ru:123456');
  console.log(`passHash = ${hash.toString(CryptoJS.enc.Hex)}`);
  event.preventDefault();  // Отменить действи по умолчанию
  $.ajax({
    type: "POST",
    url: "/login/1",
    data: {
      arg: $('#inputEmail').val()
    },
    dataType: "json",
    success: (data) => {

      var fromBase64 = Uint8Array.from(atob(data.ans), c => c.charCodeAt(0));

      console.log(`d = ${fromBase64.lenght}`);

      var iv = CryptoJS.lib.WordArray.create(fromBase64.slice(fromBase64.length - 16, fromBase64.length));
      var encryptedData = CryptoJS.lib.WordArray.create(fromBase64.slice(0, fromBase64.length - 16)).toString(CryptoJS.enc.Base64);


      console.log(`iv = ${iv.toString(CryptoJS.enc.Hex)}`);
      console.log(`encryptedData = ${encryptedData}`);

      var rnd_key = CryptoJS.AES.decrypt(encryptedData, hash, {iv: iv, mode: CryptoJS.mode.CBC}).toString(CryptoJS.enc.Utf8);
      console.log(`rnd_key = ${rnd_key}`);
    }
  });
});

import $ from "jquery";
import CryptoJS from "crypto-js";

$("#authForm").on("submit", event => {
  const hash = CryptoJS.SHA256(
    `${$("#inputEmail").val()}:${$("#inputPassword").val()}`
  ); // WordArray
  event.preventDefault(); // Cancel default action
  $.ajax({
    type: "POST",
    url: "/login/1",
    data: {
      arg: $("#inputEmail").val()
    },
    dataType: "json",
    success: data => {
      if ("ans" in data) {
        // Convert input data from StringBase64 to Uint8Array
        // eslint-disable-next-line no-undef
        const arrayData = Uint8Array.from(atob(data.ans), c => c.charCodeAt(0));

        // Extract iv from Uint8Array and convert to WordArray
        let iv = CryptoJS.lib.WordArray.create(
          arrayData.slice(arrayData.length - 16, arrayData.length)
        );
        // Extract encryptedData from Uint8Array and convert to Base64String
        const encryptedData = CryptoJS.lib.WordArray.create(
          arrayData.slice(0, arrayData.length - 16)
        ).toString(CryptoJS.enc.Base64);

        // console.log(`iv = ${iv.toString(CryptoJS.enc.Hex)}`);
        // console.log(`encryptedData = ${encryptedData}`);

        const rndKey = CryptoJS.AES.decrypt(encryptedData, hash, {
          iv
        }); // .toString(CryptoJS.enc.Utf8);
        console.log(`rnd_key = ${rndKey.toString(CryptoJS.enc.Utf8)}`);
        // CryptoJS.AES.encrypt($('#pass').val(), CryptoJS.enc.Hex.parse(rnd_key), {iv: CryptoJS.lib.WordArray.random(128 / 8)});

        iv = CryptoJS.lib.WordArray.random(16);

        console.log(`iv = ${iv.toString(CryptoJS.enc.Hex)}`);

        let encryptedAns = CryptoJS.AES.encrypt(
          hash.toString(CryptoJS.enc.Hex),
          rndKey,
          {
            iv
          }
        );
        console.log(
          `encryptedAns = ${encryptedAns.ciphertext.toString(CryptoJS.enc.Hex)}`
        );

        console.log(
          `test = ${CryptoJS.AES.decrypt(
            encryptedAns.ciphertext.toString(CryptoJS.enc.Base64),
            rndKey,
            {
              iv
            }
          ).toString(CryptoJS.enc.Utf8)}\nhash = ${hash.toString(
            CryptoJS.enc.Hex
          )}`
        );

        encryptedAns = encryptedAns.ciphertext
          .concat(iv)
          .toString(CryptoJS.enc.Base64);
        $.ajax({
          type: "POST",
          url: "/login/2",
          data: {
            arg: encryptedAns
          },
          dataType: "json"
        });
      } else {
        // TODO: Обработчик ошибки ответа
      }
    }
  });
});

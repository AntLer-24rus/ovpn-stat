import $ from 'jquery';
import CryptoJS from 'crypto-js';

function authError(req, textStatus, errorThrow) {
  console.log(req);
  console.log(textStatus);
  console.log(errorThrow);

  switch (textStatus) {
    case 'error':
      {
        const response = JSON.parse(req.responseText);
        switch (req.status) {
          case 400:
          case 401:
            $('#errorMsg')
              .text(response.errorDescr)
              .show();
            break;
          default:
            break;
        }
      }
      break;

    default:
      console.log('Неизвестная ошибка...'); // TODO Поправить
      break;
  }
}

function authFirst(data) {
  const hash = CryptoJS.SHA256(`${$('#inputEmail').val()}:${$('#inputPassword').val()}`); // WordArray
  if ('ans' in data) {
    // Convert input data from StringBase64 to Uint8Array
    // eslint-disable-next-line no-undef
    const arrayData = Uint8Array.from(atob(data.ans), c => c.charCodeAt(0));
    // Extract iv from Uint8Array and convert to WordArray
    const iv = CryptoJS.lib.WordArray.create(
      arrayData.slice(arrayData.length - 16, arrayData.length)
    );
    // Extract encryptedData from Uint8Array and convert to Base64String
    const encryptedData = CryptoJS.lib.WordArray.create(
      arrayData.slice(0, arrayData.length - 16)
    ).toString(CryptoJS.enc.Base64);

    const rndKey = CryptoJS.AES.decrypt(encryptedData, hash, {
      iv
    }).toString(CryptoJS.enc.Utf8);

    const encryptedAns = CryptoJS.AES.encrypt(
      hash.toString(CryptoJS.enc.Hex),
      CryptoJS.enc.Hex.parse(rndKey),
      {
        iv: CryptoJS.lib.WordArray.random(16),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      }
    );

    encryptedAns.ciphertext.concat(encryptedAns.iv);

    $.ajax({
      type: 'POST',
      url: 'auth/login/2',
      data: JSON.stringify({
        arg: encryptedAns.toString()
      }),
      contentType: 'application/json',
      dataType: 'json',
      success: data2 => {
        // eslint-disable-next-line no-undef
        // window.location = '/';
        $('#errorMsg')
          .text(JSON.stringify(data2))
          .show();
      },
      error: authError
    });
  } else {
    // TODO: Обработчик ошибки ответа
  }
}

$('#authForm').on('submit', event => {
  event.preventDefault(); // Cancel default action
  $('#errorMsg').hide();

  $.ajax({
    type: 'POST',
    url: 'auth/login/1',
    data: JSON.stringify({
      arg: $('#inputEmail').val()
    }),
    contentType: 'application/json',
    dataType: 'json',
    success: authFirst,
    error: authError
  });
});

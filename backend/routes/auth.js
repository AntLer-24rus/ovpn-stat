const express = require('express');
const crypto = require('crypto');
const logger = require('../libs/logger');
const HttpEror = require('../libs/httpError');

const log = logger.logger(__filename);
const router = express.Router();

router.get('/', (req, res) => {
  res.render('auth-form');
});

router.post('/login/:numStep', (req, res, next) => {
  const pass = crypto
    .createHash('sha256')
    .update('test@main.ru:123456')
    .digest();
  log.debug(`pass = ${pass.toString('hex')}`);

  log.debug(`${req.get('Content-Type')}`);
  const rnd = 'a982fd24469e9d4c1a8dfe18f7394a9a6c66cfdf4e2b5e49603ef4e7986a2876';

  switch (req.params.numStep) {
    case '1':
      {
        log.debug(`Step one`);
        // if ('arg' in req.body) {
        // let rnd = crypto.randomBytes(32).toString("hex");
        const iv = crypto.randomBytes(16);

        log.debug(
          `RND = ${rnd} length = ${Buffer.from(rnd, 'hex').length}\n\t\t\tiv  = ${iv.toString(
            'hex'
          )} length = ${iv.length}`
        );
        const cipher = crypto.createCipheriv('aes-256-cbc', pass, iv);
        const encryptedData = Buffer.concat([cipher.update(rnd), cipher.final()]);

        log.debug(
          `encryptedData = ${encryptedData.toString('base64')} length: ${encryptedData.length}`
        );

        const out = Buffer.concat([encryptedData, iv]);
        res.json({ error: false, ans: out.toString('base64') });
        // }
      }

      break;
    case '2':
      {
        log.debug(`Step tow`);
        log.debug(`req.body.arg = ${req.body.arg}`);
        const buf = Buffer.from(req.body.arg, 'base64');

        const iv = buf.slice(buf.length - 16, buf.length);
        const encryptrdData2 = buf.slice(0, buf.length - 16);

        log.debug(`iv = ${iv.toString('hex')}`);
        log.debug(`encryptrdData2 = ${encryptrdData2.toString('base64')}`);
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(rnd, 'hex'), iv);
        let decrypted;
        try {
          decrypted = decipher.update(encryptrdData2, 'utf8');
          decrypted += decipher.final('utf8');
        } catch (err) {
          throw new HttpEror(401, 'Неверный логин или пароль');
        }

        const msg = decrypted;
        log.debug(`msg = ${msg} length - ${decrypted.length}`);

        if (msg === pass.toString('hex')) {
          res.json({ error: false });
        } else {
          next(new HttpEror(401, 'Неверный логин или пароль'));
        }
      }
      break;

    default:
      next(new HttpEror(403, 'Достап запрещен!!!')); // Неверный номер шага
      break;
  }
});

module.exports = router;

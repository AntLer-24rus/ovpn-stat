**ovpn-stat** — это проект написанный на node.js для отображения текущего состояния сети *OpenVPN*
Приложение читает указанный файл логов "*openvpn-status.log*" и выводит его в виде удобной для просмотра таблице. По мере изменений в файле страница автоматически обновляется.
## Установка
Для установки можно использовать стандартный NPM или [Yarn](https://yarnpkg.com/ru/)

Необходимые зависимости:

* [Node.js](https://nodejs.org/en/)

Зависимости для разработки:

* [Gulp](https://gulpjs.com/)
* [Webpack](https://webpack.js.org/)


```bash
$ git clone https://github.com/AntLer-24rus/ovpn-stat.git
$ cd ovpn-stat
$ yarn install
$ vi backend/config.json
```
Содержание файла config.json:
```json
{
  "port": 80,
  "hostname": "localhost",
  "OpenVPN-StatPath": "{путьКФайлуЛогов}/openvpn-status.log"
}
```
Для запуска достаточно набрать:
```bash
$ yarn start
```
## Внешний вид 
![Пример экрана](images/ScreenExample.PNG)

## Лицензия
MIT License

**Copyright (c) [2017] [AntLer]**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
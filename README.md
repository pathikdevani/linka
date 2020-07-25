# linka [![codecov](https://codecov.io/gh/pathikdevani/linka/branch/master/graph/badge.svg)](https://codecov.io/gh/pathikdevani/linka) [![GitHub license](https://img.shields.io/github/license/range-of-motion/budget.svg)](https://github.com/range-of-motion/budget/blob/master/LICENSE) ![build](https://github.com/pathikdevani/linka/workflows/CI/badge.svg)

> A tiny promise based low-level communication for two way stream

Linka is low level communication module. It allows promise based communication on both ends. Using linka you can write wrapper in your application for specific socket, WebSocket, iframe stream.

:boom: It's works on both Node and Browser.
:muscle: Zero dependency


This module exposes three module definitions:

* **CommonJS**: `dist/linka.js`
* **ESModule**: `dist/linka.mjs`
* **UMD**: `dist/linka.min.js`


## Install

```javascript
$ npm install --save linka
```


## Example Linka Implementation for WebWorker
UI side where we create worker instance
```javascript
import { Linka } from 'linka';

const worker = new Worker('worker.js');
const linka = new Linka(
  (callback) => { worker.addEventListener('message', (e) => { callback(e.data); }); },
  (data) => { worker.postMessage(data); },
  { timeout: 1000 * 10 },
);

// call worker to get some data
linka
  .request('name', { fname: 'foo', lname: 'bar' })
  .then((data) => { console.log(data); }); // foo bar

```

worker.js
```javascript
import { Linka } from 'linka';

const self = {};
const linka = new Linka(
  (callback) => { self.addEventListener('message', (e) => { callback(e.data); }); },
  (data) => { self.postMessage(data); },
  { timeout: 1000 * 10 },
);

// bind event
self.bind('name', async (e) => `${e.fname}-${e.lname}`);

```


## License

MIT © [Pathik Devani](https://github.com/pathikdevani)

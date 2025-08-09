const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// 判断是否是开发环境
const dev = process.env.NODE_ENV !== 'production';

// process.pkg 是 pkg 打包后会存在的一个特殊对象
// 我们用它来判断当前是否在 pkg 打包后的环境中运行
// 如果是，则需要修正 __dirname 的指向
const dir = process.pkg ? path.dirname(process.execPath) : __dirname;
const app = next({ dev, dir });

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
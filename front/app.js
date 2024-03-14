const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const ejs = require('ejs');

const server = http.createServer((req, res) => {
  if (req.url == '/submit' && req.method.toLowerCase() == 'post') {
    // フォームのデータを処理
    const form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/uploads'; // アップロードされたファイルの保存先ディレクトリを指定
    form.keepExtensions = true; // アップロードされたファイルの拡張子を保持
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error(err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
        return;
      }

      // テキストボックスの入力を保存
      const textData = fields.text;
      fs.writeFile('prompts/input.txt', textData, (err) => {
        if (err) {
          console.error(err);
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Internal Server Error');
          return;
        }
      });

      // アップロードされた画像を保存
      // アップロードされたファイルは files.image（配列）に保存されている
      const images = files.image;
      images.forEach((image) => {
        fs.rename(image.path, 'images/' + image.name, (err) => {
          if (err) {
            console.error(err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
          }
        });
      });

      // 成功を通知
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('<html><body><h1>Form submitted successfully!</h1></body></html>');
    });
  } else {
    // フォームページを提供
    fs.readFile('templates/form.ejs', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
        return;
      }
      // EJSテンプレートをレンダリングしてクライアントに返す
      const renderedHTML = ejs.render(data);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(renderedHTML);
    });
  }
});

// サーバーをポート 3000 でリッスン
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

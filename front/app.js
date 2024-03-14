const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { getLocalIP } = require("./utils/ipaddr");
const { validateExtension } = require("./utils/validateExtension");

const app = express();
app.set("view engine", "ejs"); // テンプレートエンジンを設定
app.set("views", path.join(__dirname, "views")); // テンプレートファイルのディレクトリを設定
app.use(express.static(path.join(__dirname, "public"))); // 静的ファイルの提供

// フォームのPOSTリクエストを処理
app.post("/submit", (req, res) => {
  console.log("post arrived");

  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // アップロードされた画像の拡張子を確認
    const images = Array.isArray(files.images) ? files.images : [files.images];
    images.forEach((image) => {
      if (!validateExtension(image.name, [".png", ".jpg", ".jpeg"])) {
        res.status(400).send("Invalid image file format");
        return;
      }
      images.forEach((image) => {
        fs.renameSync(image.path, path.join(__dirname, "uploads", image.name));
      });
      console.log(`${image.name} uploaded`);
    });

    // アップロードされたPythonファイルの拡張子を確認
    const pythonFile = files.pythonFile;
    console.log("pythonFile", pythonFile);
    if (!validateExtension(pythonFile.name, [".py"])) {
      res.status(400).send("Invalid Python file format");
      return;
    }

    // Pythonファイルを保存
    fs.renameSync(
      pythonFile.path,
      path.join(__dirname, "uploads", pythonFile.name)
    );
    console.log("Python file uploaded");

    // 成功を通知
    res
      .status(200)
      .send("<html><body><h1>Form submitted successfully!</h1></body></html>");
  });
});

// フォームページを提供
app.get("/submit", (req, res) => {
  res.render("form");
});

// 定義されてないパスへのリクエストに対するエラーハンドリング
app.use((req, res) => {
  res.status(404).send("<html><body><h1>Page Not Found</h1></body></html>");
});

// サーバーを起動
const PORT = 3000;
const HOST = getLocalIP();
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

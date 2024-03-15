const express = require("express");
const formidable = require("formidable");
const path = require("path");
const { getLocalIP } = require("./utils/ipaddr");
const { validateExtension } = require("./utils/validateExtension");
const { backend_request } = require("./utils/backend");
const fs = require("fs");

const app = express();
app.set("view engine", "ejs"); // テンプレートエンジンを設定
app.set("views", path.join(__dirname, "views")); // テンプレートファイルのディレクトリを設定
app.use(express.static(path.join(__dirname, "public"))); // 静的ファイルの提供

// ルートページを提供
app.get("/", (req, res) => {
  const endpoints = app._router.stack
    .filter((r) => r.route && r.route.methods.get) // GETメソッドのみをフィルタリング
    .map((r) => r.route.path);
  res.render("index", { endpoints });
});

// フォームのPOSTリクエストを処理
app.post("/submit", async (req, res) => {
  const form = new formidable.IncomingForm();
  const saveDirName = "../backend/Input";
  let backend_post_data = {};

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.render("error", {
        errorNumber: 500,
        errorMessage: "Internal Server Error",
        endpoint: "/submit",
      });
      return;
    }

    // アップロードされた画像の拡張子を確認
    // const images = Array.isArray(files.images) ? files.images : [files.images];
    // images.forEach((image) => {
    //   if (
    //     !validateExtension(image.originalFilename, [".png", ".jpg", ".jpeg"])
    //   ) {
    //     res.render("error", {
    //       errorNumber: 400,
    //       errorMessage: "Invalid image format",
    //       endpoint: "/submit",
    //     });
    //     return;
    //   }
    //   fs.renameSync(
    //     image.filepath,
    //     path.join(__dirname, saveDirName, image.originalFilename)
    //   );
    //   console.log(`${image.originalFilename} uploaded`);
    // });

    const image = files.images[0];
    if (!validateExtension(image.originalFilename, [".png", ".jpg", ".jpeg"])) {
      res.render("error", {
        errorNumber: 400,
        errorMessage: "Invalid Image file format",
        endpoint: "/submit",
      });
      return;
    }
    backend_post_data["image_name"] = image.originalFilename;
    await fs.renameSync(
      image.filepath,
      path.join(__dirname, saveDirName, image.originalFilename)
    ); // Imageファイルを保存

    // アップロードされたPythonファイルの拡張子を確認
    const pythonFile = files.pythonFile[0];
    if (!validateExtension(pythonFile.originalFilename, [".py"])) {
      res.render("error", {
        errorNumber: 400,
        errorMessage: "Invalid Python file format",
        endpoint: "/submit",
      });
      return;
    }
    backend_post_data["code_name"] = pythonFile.originalFilename;
    await fs.renameSync(
      pythonFile.filepath,
      path.join(__dirname, saveDirName, pythonFile.originalFilename)
    ); // Pythonファイルを保存
    console.log("Python file uploaded");

    // 進捗状況を示すオブジェクト（仮のデータ）
    const progress = {
      step1: 1,
      step2: 1,
      step3: 0,
      step4: 0,
    };

    // rendering.ejsテンプレートをレンダリングしてクライアントに送信
    res.render("generating", { progress: progress });

    // バックエンドにPOSTリクエストを送信
    backend_request(backend_post_data);
  });
});

// フォームページを提供
app.get("/submit", (req, res) => {
  res.render("form");
});

// 定義されてないパスへのリクエストに対するエラーハンドリング
app.use((req, res) => {
  res.status(404).render("error", {
    errorNumber: 404,
    errorMessage: "Not Found",
    endpoint: req.originalUrl,
  });
});

// サーバーを起動
const PORT = 3000;
const HOST = getLocalIP();
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

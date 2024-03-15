const express = require("express");
const formidable = require("formidable");
const path = require("path");
const { getLocalIP } = require("./utils/ipaddr");
const { validateExtension } = require("./utils/validateExtension");
const { backend_request } = require("./utils/backend");
const fs = require("fs");
const uuid = require("uuid");

const app = express();
app.set("view engine", "ejs"); // テンプレートエンジンを設定
app.set("views", path.join(__dirname, "views")); // テンプレートファイルのディレクトリを設定
app.use(express.static(path.join(__dirname, "public"))); // 静的ファイルの提供
// 静的ファイルの提供を設定し、任意の場所に静的ファイルを配置
const customStaticPath = path.join(__dirname, "public");
app.use(express.static(customStaticPath));

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
  const saveDirName = "uploads"; // アップロードされたファイルを保存するディレクトリ
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

    const image = files.image[0];
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

    // アップロードされたTeXファイルの拡張子を確認。ただしrequiredではない
    if (files.texFile && files.texFile[0]) {
      texFile = files.texFile[0];
      if (!validateExtension(texFile.originalFilename, [".tex"])) {
        res.render("error", {
          errorNumber: 400,
          errorMessage: "Invalid TeX file format",
          endpoint: "/submit",
        });
        return;
      }
      backend_post_data["tex_name"] = texFile.originalFilename;
      await fs.renameSync(
        texFile.filepath,
        path.join(__dirname, saveDirName, texFile.originalFilename)
      ); // TeXファイルを保存
      console.log("TeX file uploaded");
    } else {
      backend_post_data["tex_name"] = "";
    }

    //今回のリクエストのuuidを生成
    const requestId = uuid.v4();
    // 進捗状況を示すオブジェクト（仮のデータ）
    res.render("generating", { output_name: requestId });
    backend_post_data["output_name"] = requestId;

    // バックエンドにPOSTリクエストを送信
    const result = await backend_request(backend_post_data);
    console.log("result", result);
  });
});

// フォームページを提供
app.get("/submit", (req, res) => {
  res.render("form");
});

app.get("/get_python", (req, res) => {
  const code_name = req.query.code_name;
  if (code_name === undefined) {
    res.status(400).render("error", {
      errorNumber: 400,
      errorMessage: "Bad Request",
      endpoint: req.originalUrl,
    });
    return;
  }
  const code_path = path.join(__dirname, "../backend/Output", code_name);
  // console.log("get_python", code_path);
  if (!fs.existsSync(code_path)) {
    res.status(404).render("error", {
      errorNumber: 404,
      errorMessage: "Not Found",
      endpoint: req.originalUrl,
    });
    return;
  }
  res.download(code_path);
});

app.get("/get_video", (req, res) => {
  //video_nameを取得
  const video_name = req.query.video_name;
  if (video_name === undefined) {
    res.status(400).render("error", {
      errorNumber: 400,
      errorMessage: "Bad Request",
      endpoint: req.originalUrl,
    });
    return;
  }
  //video_nameから.mp4を取り除く
  const folder_name = video_name.split(".")[0];
  //video_nameを元にvideoを取得
  const video_path = path.join(
    __dirname,
    "../backend/media/videos/",
    folder_name,
    "480p15",
    video_name
  );
  // console.log("get_video : ", video_path);
  //pathにfileがなかったらエラーを返す
  if (!fs.existsSync(video_path)) {
    res.status(404).render("error", {
      errorNumber: 404,
      errorMessage: "Not Found",
      endpoint: req.originalUrl,
    });
    return;
  }
  res.download(video_path);
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

const { backend_request } = require("./utils/backend.js");

// フォームのPOSTリクエストを処理
const backend_post_data = {
  image_name: "",
  code_name: "",
};
backend_request(backend_post_data);

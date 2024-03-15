const http = require("http");

function backend_request(backend_post_data) {
  return new Promise((resolve, reject) => {
    // JSON形式に変換してPOSTリクエストを送信
    const postData = JSON.stringify(backend_post_data);
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/submit",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const backendReq = http.request(options, (backendRes) => {
      let responseData = "";

      backendRes.on("data", (chunk) => {
        responseData += chunk;
      });

      backendRes.on("end", () => {
        resolve(responseData); // レスポンスデータを解決して返す
      });
    });

    backendReq.on("error", (error) => {
      reject(error); // エラーが発生した場合はrejectする
    });

    backendReq.write(postData);
    backendReq.end();
  });
}

module.exports = { backend_request };

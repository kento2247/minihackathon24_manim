const http = require("http");

function backend_request(backend_post_data) {
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
    console.log(`statusCode: ${backendRes.statusCode}`);
    backendRes.on("data", (data) => {
      console.log(data.toString());
    });
  });

  backendReq.on("error", (error) => {
    console.error(error);
  });

  backendReq.write(postData);
  backendReq.end();
}

module.exports = { backend_request };

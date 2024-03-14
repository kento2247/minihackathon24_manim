const path = require("path");

function validateExtension(fileName, allowedExtensions) {
  const ext = path.extname(fileName).toLowerCase();
  return allowedExtensions.includes(ext);
}

module.exports = { validateExtension };

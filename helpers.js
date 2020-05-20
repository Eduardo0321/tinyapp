function generateRandomString() {
  let url = "";
const length = 6;
let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
for (let i = 0; i < length; i++) {
  url += chars.charAt(Math.floor(Math.random() * chars.length));
}
return url
};

module.exports = { generateRandomString };

function generateRandomString() {
  let url = "";
  const length = 6;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
  url += chars.charAt(Math.floor(Math.random() * chars.length));
}
return url
};

function getUrlByUser(ID, urlDatabase) {
  let urlCopy = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === ID) {
      urlCopy[url] = {longURL: urlDatabase[url].longURL, userID: ID};
    }
  }
  return urlCopy;
}

module.exports = { generateRandomString, getUrlByUser };


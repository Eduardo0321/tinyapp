const getUserByEmail = function(email, users) {
  for (let userID in users) {
    // console.log(userID);
    // console.log(email);
    // console.log(users[userID].email);
    // console.log("---")
    if (users[userID].email === email) {
      console.log(users[userID]);
      return users[userID];
    } else {
      return undefined;
    }
  }
};

function generateRandomString() {
  let url = "";
const length = 6;
let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
for (let i = 0; i < length; i++)
  url += chars.charAt(Math.floor(Math.random() * chars.length));
return url
};



module.exports = { getUserByEmail };
module.exports = { generateRandomString };
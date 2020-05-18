const getUserByEmail = function(email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    } else {
      return undefined;
    }
  }
};


module.exports = { getUserByEmail };
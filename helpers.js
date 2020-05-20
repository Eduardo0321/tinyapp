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



module.exports = { getUserByEmail };
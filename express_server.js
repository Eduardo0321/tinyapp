const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { getUserByEmail } = require("./helpers.js");
const { generateRandomString } = require("./helpers.js");

const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["random"],
}));

const urlDatabase = {};

const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   },
//   "user3RandomID": {
//     id: "user3RandomID",
//     email: "e.aizprua@hotmail.ca",
//     password: "12345"
//   }
};

// THIS PATH(/) IS THE DEFAULT HOMEPAGE.
app.get("/", (req, res) => {
  let userID = users[req.session.user_id];
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// THIS PATH(/urls.json) SHOWS THE urlDatabase in the browser with the help of JSON.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//THIS PATH(/hello) PRINTS THIS HTML TEXT ON THE BROWSER(HELLO WORLD).
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//---------LOG OUT-----------//

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//--------INDEX PAGE--------//

//ROUTE PASSES THE URL DATA TO INDEX TEMPLATE
app.get("/urls", (req, res) => {
  let userID = users[req.session.user_id];
  if (userID) {
    let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("Please <a href='/login'>Log in.</a>");
  }
});

//ROUTE DELETES URL//
app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (userID === undefined) {
    res.status(403).send("Please <a href='/login'>Log in.</a>");
  } else if (userID !== urlDatabase[req.params.shortURL].userID) {
    res
      .status(403).send("This URL belongs to a different user.");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  // if user logged out, redirect to login page. If short url does not belong to user show 403 status
  let userID = req.session.user_id;
  if (!userID) {
    res.status(403).send("Please <a href='/login'>Log in.</a>");
  }
  if (userID !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("This URL belongs to a different user.");
  }

  let longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].long = longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//--------REGISTER PAGE---------//

app.get("/register", (req, res) => {
  res.render("urls_register", { user: users[req.session.user_id] });
});

app.post("/register", (req, res) => {
  for (let ID in users) {
    if (req.body.email === users[ID].email) {
      res.status(400).send("Sorry, the email you entered is already in use. Try to <a href='/register'>register</a> again.");
    }
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or Password cannot be blank. \nPlease try to <a href='/register'>register</a> again with an Email address and a Password.");
  } else {
    let userID = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = { id: userID,
      email: req.body.email,
      password: hashedPassword,
      database: {} };
    req.session.user_id = userID;
    // console.log(userID);
    res.redirect("/urls");
  }
});

//--------LOGIN PAGE----------//

app.post("/login", (req, res) => {

  if (req.body.email && req.body.password) {

    let matchingEmailPassword = false;
    let tempUserId;
    for (let key in users) {
      if (users[key].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, users[key].password)) {
          matchingEmailPassword = true;
          tempUserId = key;
          break;
        }
      }
    }

    if (matchingEmailPassword) {
      req.session.user_id =  tempUserId;
      res.redirect('/');
    } else {
      res.status(400).send("Email or Password doesn't match. Please <a href='/login'>Log in</a> with an existing account or <a href='/register'>Register</a> with a new account.");
    }

  } else {
    res.status(400).send("Email and Password Cannot be Empty. Please <a href='/login'>Log in</a>");
  }
  
});


app.get("/login", (req, res) => {
  let user = req.session.user_id;
  if (!user) {
    // user is not logged in
    res.render("urls_login", {user});
  } else {
    res.redirect("/urls");
  }
});

//--------NEW PAGE----------//

//ROUTE SENDS USER TO THE URL CREATION PAGE
app.get("/urls/new", (req, res) => {
  let userID = users[req.session.user_id];
  // console.log(userID);
  let templateVars = {
    user: req.session.user_id,
    urls: urlDatabase,
    user_id: users[userID]
  };
  
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.status(403).send("Please <a href='/login'>Log in.</a>");
  }
});

//ROUTE CREATES NEW URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let templateVars = {longURL: req.body.longURL, user: req.session.user_id, shortURL: shortURL };
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id, shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

//--------SHOW PAGE---------

//ROUTE SENDS USER TO THE /SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!req.session.user_id) {
    res.status(404).send("Please <a href='/login'>Log in.</a>");
  }
  if (url) {
    let templateVars = {
      shortURL: req.params.shortURL, longURL: url, user: req.session.user_id
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("This URL is non-existent");
  }
});

//ROUTE SENDS USER TO longURL webpage
app.get("/u/:shortURL", (req, res) => {
  let user = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];
  if (user) {
    let longURL = url.longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("URL does not exist");
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.id,
      user: users[req.session["user_id"]]
    };
    res.redirect("urls_new", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
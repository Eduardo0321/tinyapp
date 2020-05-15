const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
    let url = "";
  const length = 6;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
    url += chars.charAt(Math.floor(Math.random() * chars.length));
  return url
};

function findUserByEmail(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "e.aizprua@hotmail.ca", 
    password: "12345"
  }

};

// THIS PATH(/) IS THE DEFAULT HOMEPAGE.
app.get("/", (req, res) => {
  res.send("Hello!");
});

// THIS PATH(/urls.json) SHOWS THE urlDatabase in the browser with the help of JSON.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//THIS PATH(/hello) PRINTS THIS HTML TEXT ON THE BROWSER(HELLO WORLD).
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.post("/login", (req, res) => {
//   let templateVars = { user: users[req.cookies.user_id], urls: urlDatabase }
//   res.cookie('username', req.body.username);
//   res.redirect("/urls");
// });

//---------LOG OUT-----------
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body.user_id)
  res.redirect("/urls");
});

//--------INDEX PAGE--------

//ROUTE PASSES THE URL DATA TO INDEX TEMPLATE
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//ROUTE DELETES URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//ROUTE SENDS USER TO EDIT URL PAGE
app.post("/urls/:shortURL/edit", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//--------REGISTER PAGE---------

app.get("/register", (req, res) => {
  res.render("urls_register", { user: users[req.cookies.user_id] });
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and Password cannot be blank.");
    return;
  };

  if (findUserByEmail(req.body.email)) {
    res.status(400).send("Email already exists.");
    return;
  };

  let user_id = generateRandomString();
  users[user_id] = {
    id: user_id, 
    email: req.body.email, 
    password: req.body.password
  };
  res.cookie('user_id', user_id);
  res.redirect("/urls");

});

//--------LOGIN PAGE----------
app.post("/login", (req, res) => {
  let loginUser = findUserByEmail(req.body.email);
  if (!loginUser) {
    res.status(403).send("email doesn't match");
    return;
  } else {
    if (loginUser.password !== req.body.password) {
      res.status(403).send("invalid password");
      return;
    } else {
      res.cookie('user_id', loginUser.id);
      res.redirect("/urls");
    }
    }
});

app.get("/login", (req, res) => {
  res.render("urls_login", { user: users[req.cookies.user_id] });
});


//--------NEW PAGE----------

//ROUTE SENDS USER TO THE URL CREATION PAGE
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies.user_id] });
});

//ROUTE CREATES NEW URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//--------SHOW PAGE---------

//ROUTE SENDS USER TO THE /SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//ROUTE SENDS USER TO longURL webpage
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
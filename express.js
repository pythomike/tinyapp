// REQUIREMENTS
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', "ejs");
  
app.use(cookieSession({
  name: 'session',
  keys: ["darmok and jalad at tanagra"]
}));

// MIDDLEWARE
app.use((req, res, next) => {
  res.locals.user = getById(req.session.user_id, users);
  next();
});

app.use('/urls/', (req, res, next) => {
  authorizor(req, res, next);
});

// DATA
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "bob"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "moike"
  },
  "6arg83": {
    url: "http://www.cbc.ca",
    userID: "moike"
  },
  "adfgae": {
    url: "http://www.reddit.com",
    userID: "moike"
  }
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
  "moike": {
    id: "moike",
    email: "m@m",
    password: "$2a$10$qDmzX7GkZW/TLvw.gYM3E./zGmpm/04U2isxO.EV8YtPmaUWHdXqa"
  }
};

// FUNCYTOWN
function randomString() {
  let shortURL = Math.random().toString(36).substring(2, 8);
  return shortURL;
}

function authenticator(email, password, users) {
  for (user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      return users[user];
    }
  }
  return undefined;
}
function authorizor (req, res, next) {
  if (res.locals.user === undefined){
    res.status(403);
    res.send("You are not a registered user, <a href=/login>login</a> or <a href=/register>register</a>");
  } else {
    next();
  }
}

function getById(id) {
  for (user in users) {
    if (users[user].id === id) {
      return users[user];
    }
  }
  return undefined;
}

function urlsForUser(id) {
  var output = {};
  for (url in urlDatabase){
    if (urlDatabase[url].userID === id.id){
      output[url] = urlDatabase[url];
    }
  }
  return output;
}
// ENDPOINTS
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(res.locals.user),
    name: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = randomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {"url": longURL, "userID": res.locals.user.id};
  res.redirect("/urls/" + shortURL);
  console.log(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    name: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    data: {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      creator: urlDatabase[req.params.id].userID},
    name: users[req.session.user_id]
  };

  if (req.session.user_id === urlDatabase[req.params.id].userID){
    res.render("urls_show", templateVars);
  } else {
    res.status(403);
    res.send("That is not yours.");
  }
});

app.post("/logout", (req, res) => {
  // res.clearCookie("user_id")
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL; // &&&&& FIX HERE
  res.redirect("/urls/");
  console.log(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID){
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("That is not yours.");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {name: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPass = req.body.password;
  
  if (!userEmail || !userPass) {
    res.status(400);
    res.send("Login Error: Please fill in both fields. <a href=/login>Retry</a>");
  }
  let checkr = authenticator(userEmail, userPass, users);
  if (checkr){
    req.session.user_id = checkr.id;
    res.redirect("urls");
  } else {
    res.status(400);
    res.send("Login Error. <a href=/login>Retry</a>");
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    name: users[req.session.user_id],
    user: users.name
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userName = req.body.email;
  let userPass = req.body.password;
  let hashedPassword = bcrypt.hashSync(userPass, 10);
  let userID = randomString();

  if (!userName || !userPass) {
    res.status(400);
    res.send("Registration Error: Please fill in both fields. <a href=/register>Retry</a>");
  }
  for (var check in users){
    if (users[check].email === req.body.email){
      res.status(400);
      res.send("Registration error: Please use a different email. <a href=/register>Retry</a>");
    }
  }
  var newUser = {
    id: userID,
    email: userName,
    password: hashedPassword
  };
  users[userID] = newUser;
  console.log(users);
  req.session.user_id = userID;
  console.log(users);
  // res.cookie("user_id", userID)
  res.redirect("urls");
});

// SERVER JAZZ  
app.listen(PORT, () => {
  console.log(`TinyApp™ listening on port ${PORT}!`);
});

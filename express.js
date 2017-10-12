// REQUIREMENTS
  const express = require("express");
  const app = express();
  const bodyParser = require("body-parser");
  const PORT = process.env.PORT || 8080; // default port 8080
  const cookieParser = require('cookie-parser')
  app.use(bodyParser.urlencoded({extended: true}));
  app.set('view engine', "ejs")
  app.use(cookieParser())

// DATA
  var urlDatabase = {
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
    "moike": {
      id: "mike", 
      email: "m@m", 
      password: "m"
    }
  }

// FUNCYTOWN
  function randomString() {
    let shortURL = Math.random().toString(36).substring(2, 8)
    return shortURL
  }

// ENDPOINTS
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls : urlDatabase,
    name: users[req.cookies["user_id"]],
  }
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  let shortURL = randomString()   
  urlDatabase[shortURL] = req.body.longURL
  console.log("Adding:", shortURL, "-", req.body.longURL) // REMOVE BEFORE SUBMISSION
  res.redirect("/urls/" + shortURL);  
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    name: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    data: {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]},
    name: users[req.cookies["user_id"]]
    }
  res.render("urls_show", templateVars);
  let user = (req.cookies.user_id)
  console.log(user)
  //console.log(users)
  console.log(users[user])
  
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  console.log("New value for", req.params.id, "is", req.body.longURL) // REMOVE BEFORE SUBMISSION
  res.redirect("/urls/")
})

app.get("/u/:id", (req, res) => {
  let templateVars = {
  name: users[req.cookies["user_id"]]
  }
  res.redirect(urlDatabase[req.params.id], templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("Deleting:", req.params.id, "-", urlDatabase[req.params.id]) // REMOVE BEFORE SUBMISSION
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
let templateVars = {name: users[req.cookies["user_id"]],}
res.render("login", templateVars)
})


app.post("/login", (req, res) => {
  console.log("Logged in as", req.body.username)
  res.cookie("name", req.body.username)
  res.redirect("urls")
})

app.get("/register", (req, res) => {
  let templateVars = {
    name: users[req.cookies["user_id"]],
    user: users.name
  }
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  let userName = req.body.email
  let userPass = req.body.password
  let userID = randomString()

  if (!userName || !userPass) {
    res.status(400)
    res.send("Registration Error: Please fill in both fields. <a href=/register>Retry</a>")
  }
  for (var check in users){
    if (users[check].email === req.body.email){
      res.status(400)
      res.send("Registration error: Please use a different email. <a href=/register>Retry</a>")
    }
  }  
  var newUser = {
    id: userID,
    email: userName,
    password: userPass
  }
  users[userID] = newUser
  res.cookie("user_id", userID)
  res.redirect("urls")
})

// SERVER JAZZ  
app.listen(PORT, () => {
  console.log(`TinyApp™ listening on port ${PORT}!`);
});

// Fun for dealing with sessions - middleware for WebAuthentication, next is optional?
// app.use((req, res, next) => {
// const {userId} = req/session;
// res.locals.user = userService.getById(userID)
//   next()
// })

// function forbiddenIfNotLoggedIn (req, res, next) {
//   if (res.locals.user === undefined){
//     res.sendStatus(403)
//   } else {
//     next()
//   }
// }

// app.use("/api", forbiddenIfNotLoggedIn);

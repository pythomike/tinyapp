// REQUIREMENTS
  const express = require("express");
  const app = express();
  const bodyParser = require("body-parser");
  const PORT = process.env.PORT || 8080; // default port 8080
  const cookieParser = require('cookie-parser')
  app.use(bodyParser.urlencoded({extended: true}));
  app.set('view engine', "ejs")
  app.use(cookieParser())

// MIDDLEWARE
  app.use((req, res, next) => {
    res.locals.user = getById(req.cookies.user_id, users);
    next();
  });

  app.use('/urls/new', (req, res, next) => {
    authorizor(req, res, next);
  });

// DATA
  var urlDatabase = {
    "b2xVn2": {
      url: "http://www.lighthouselabs.ca",
      userID: "moike"
    },
    "9sm5xK": {
      url: "http://www.google.com",
      userID: "moike"
    }
  };
  //
  // Need to add a value for createdBy. Each link needs to be associated with a userID
  // 
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
      password: "m"
    }
  }

// FUNCYTOWN
  function randomString() {
    let shortURL = Math.random().toString(36).substring(2, 8)
    return shortURL
  }

  function authenticator(email, password, users) {
    for (user in users) {
      if (users[user].email === email && users[user].password === password) {
        return users[user];
      }
    }
    return undefined;
  }
  function authorizor (req, res, next) {
    if (res.locals.user === undefined){
      res.sendStatus(403)
    } else {
      next()
    }
  }
  function isThisYourLink(req, res, next){
   

  }

  function getById(id) {
    for (user in users) {
      if (users[user].id === id) {
        return users[user];
      }
    }
    return undefined;
  }

  function createUser(email, name, password) {
    const newUser = {
      email,
      name,
      password: bcrypt.hashSync(password, 10),
      id: rando(),
    };
    users.push(newUser);
    return newUser;
  }
  function createURL(url, user){
    let shortURL = randomString()

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
  let longURL = req.body.longURL
  urlDatabase[shortURL] = {"url": longURL , "userID": res.locals.user.id}
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
    longURL: urlDatabase[req.params.id].url,
    creator: urlDatabase[req.params.id].userID},
    name: users[req.cookies["user_id"]]
    }

  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID){
    res.render("urls_show", templateVars);
  } else {
    res.status(403)
    res.send("That is not yours.")
  }
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
  
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID){
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  } else {
    res.status(403)
    res.send("That is not yours.")
  }
})

app.get("/login", (req, res) => {
  let templateVars = {name: users[req.cookies["user_id"]],}
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  let userEmail = req.body.email
  let userPass = req.body.password                                       
  
  if (!userEmail || !userPass) {
    res.status(400)
    res.send("Login Error: Please fill in both fields. <a href=/login>Retry</a>")
  }
  
  let checkr = authenticator(userEmail, userPass, users)
  
  if (checkr){
    res.cookie("user_id", checkr.id)
    res.redirect("urls")
  } else {
    res.status(400)
    res.send("Login Error. <a href=/login>Retry</a>")
  }
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

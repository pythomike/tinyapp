const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = process.env.PORT || 8080; // default port 8080
app.set('view engine', "ejs")



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function randomString () {
  let shortURL = Math.random().toString(36).substring(2, 8)
  return shortURL // RENAME THIS
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls : urlDatabase}
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  console.log(req.body); 
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
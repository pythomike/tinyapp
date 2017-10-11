const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = process.env.PORT || 8080; // default port 8080
app.set('view engine', "ejs")


// DATA
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = {urls : urlDatabase}
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  let shortURL = randomString() 
  urlDatabase[shortURL] = req.body.longURL
  console.log("Adding:", shortURL, "-", req.body.longURL) // REMOVE BEFORE SUBMISSION
  res.redirect("/urls/" + shortURL);  
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    data: {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]} };
  res.render("urls_show", templateVars);
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  console.log("New value for", req.params.id, "is", req.body.longURL) // REMOVE BEFORE SUBMISSION
  res.redirect("/urls/")
})

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("Deleting:", req.params.id, "-", urlDatabase[req.params.id]) // REMOVE BEFORE SUBMISSION
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
})



// SERVER JAZZ  
app.listen(PORT, () => {
  console.log(`TinyApp™ listening on port ${PORT}!`);
});
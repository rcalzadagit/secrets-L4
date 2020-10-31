//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//Should be in this order


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

////////////////Data/////////////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
//User Schema with mongoose-encryption (npm)
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



//To setup user Model
const User = new mongoose.model("User", userSchema);
///////////////////////////////////////////////////////////////////

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

//////////////////////////////////////////////////////////////
// To get new user registration from the form
app.post("/register", function(req, res){

bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  const newUser = new User({
    email: req.body.username,
    password: hash
  });
newUser.save(function(err){
  if (err) {
    console.log(err);
  } else {
    res.render("secrets");
  }
  });
});
});
/////////////////////////////////////////////////////////////
// To get Login data from Login Form page.
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result){
          if (result === true) {
          res.render("secrets");
          }
        });
      }
    }
  });
});









//Server connection
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully.");
});

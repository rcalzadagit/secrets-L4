//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//Should be in this order


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// Required by express session package
app.use(session({
  secret: "Anylong string goeshere.",
  resave: false,
  saveUninitialized: false
}));
//See passportjs
app.use(passport.initialize());
app.use(passport.session());


////////////////Data/////////////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
//User Schema with mongoose-encryption (npm)
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//To setup user Model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
//Cookie creation
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


///////////////////////////////////////////////////////////////////
// Viewwing pages
app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
 });

//Route called from the Logout button on the secrets page.
 app.get("/logout", function(req, res){
   //Passport Logout function
   req.logout();
   res.redirect("/");
 });

//////////////////////////////////////////////////////////////
// To get new user registration from the form
app.post("/register", function(req, res){

User.register({username: req.body.username}, req.body.password, function(err, user) {
  if (err) {
    console.log(err);
    res.redirect("/register");
} else {
  passport.authenticate("local") (req, res, function(){
    res.redirect("/secrets");
      });
    }
  });
});
/////////////////////////////////////////////////////////////
// To get Login data from Login Form page.
app.post("/login", function(req, res){

const user = new User({
  username: req.body.username,
  password: req.body.password
});
//Passport login module and Authenticate - Passport module.
req.login(user, function(err){
  if (err) {
    console.log(err);
  } else {
    passport.authenticate("local") (req, res, function(){
      res.redirect("secrets");
    });
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

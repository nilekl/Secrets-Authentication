//jshint esversion:6
require('dotenv').config() /*As early as possible in your application so that it is accessible, import and configure dotenv:*/
//console.log(process.env) // remove this after you've confirmed it working
const handler = require('./handlers.js');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');/*https://www.npmjs.com/package/mongoose-encryption*/

const app = express();
console.log(process.env.SECRET);
app.use(express.static("public")); /*To serve static files such as images, CSS files, and JavaScript files, */
app.set('view engine', 'ejs');     /* Swt .ejs as defoult when res.render(view... */
app.use(bodyParser.urlencoded({extended: true})); /*use body-parsing middleware to populate req.body.*/

mongoose.connect("mongodb://localhost:27017/userDB", function(err){
  handler.error(err, "mongoose.connect")}
);

/*Mongoose schema  maps to a MongoDB document     collection */
//const userSchema = { email: String, password: String};/*Schema */
const userSchema = new mongoose.Schema({         /*Schema object from mongoose object */
  email:    String,
  password: String                           /* Encrypting only pw*/
});
/**************************************************************************************************************************************
mongoose-encryption: During save, documents are encrypted and then signed. During find, documents are authenticated and then decrypted
***************************************************************************************************************************************/
/* First this to encrypt userSchema*/
const secret=process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password']}); //Encrypt Only Certain Fields in (https://www.npmjs.com/package/mongoose-encryption )
/*Then this to create an encrypted userSchema*/
const User = new mongoose.model("User", userSchema);

/***** GET *********************************/
app.get("/", function(req,res){
  res.render("home")
});

app.get("/login", function(req,res){
  res.render("login")
});

app.get("/register", function(req,res){/* See home.ejs 10, href="/register" role="button">Register */
  res.render("register")
});
/****** POST **********************************/
app.post("/register", function(req,res){/* See register.ejs 12, <form action="/register" method="POST" */
  const newUser=new User({
    email:    req.body.username,//  <input type="email" class="form-control"    name="username">
    password: req.body.password//   <input type="password" class="form-control" name="password">
  });
  newUser.save(function(err){ /*** Here mongoose will encrypt ***/
    if(err){
      console.log(err);
    }else{
      res.render("secrets");/*secrets.ejs only reachable from /register and /login routes */
    }
  });
});

app.post("/login", function(req,res){/* See login.ejs 12, <form action="/login" method="POST" */
    console.log(req.body.username);
    const username = req.body.username;//  <input type="email" class="form-control"    name="username">
    const password = req.body.password;//   <input type="password" class="form-control" name="password">
    User.findOne({email:username},function(err, foundUser){   /*** Here mongoose will decrypt ***/
      if(err){
          console.log(err);
      }else if(foundUser){
        if(foundUser.password === password){
          console.log(foundUser.email+" "+password+" "+foundUser.password);
          res.render("secrets");/*secrets.ejs only reachable from /register and /login routes */
        }else{
          console.log("Error: Wrong PW: ");
        }
      }else{
          console.log("Could not find user: "+ username);
      }
    });
});
/*****  *************************************************/
//http://localhost:3000/


app.listen(3000, function() {
  console.log("Server started listen on port 3000");
});

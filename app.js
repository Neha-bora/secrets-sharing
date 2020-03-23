//jshint esversion:6
require('dotenv').config(); 
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



 const app = express();
const mongoose = require("mongoose");
 app.use(bodyParser.urlencoded({extended:true}));
 app.use(express.static("public"));
 app.set('view engine' , 'ejs');


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true ,useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
app.use(session({
	secret:"Our little secret.",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
	email:String,
	password:String,
	secret:String
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get( "/", function(req ,res){
   res.render("home");
});


app.get( "/login", function(req ,res){

   res.render("login");
});

app.get("/register" , function( req , res){
  res.render("register");

});
app.get("/logout" , function(req , res){
 req.logout();
 res.redirect("/");

});

app.get("/secrets" , function(req , res){
 User.find({"secret" : {$ne: null}} , function(err , foundUsers){
 if(err){
 	console.log(err);
 }else{
 	if(foundUsers){
 		res.render("secrets" , { usersWithSecrets : foundUsers});
 	}
 }
 });

});

app.post("/submit" , function(req , res){
 const submitSecret = req.body.secret;
 console.log(req.user.id);
 User.findById(req.user.id , function( err , foundUser){
  if (err){
  	console.log(err);
  }else{
  	if(foundUser){
  		foundUser.secret= submitSecret;
  		foundUser.save( function(){
          res.redirect("/secrets");
  		});

  	}
  }
 });

});

app.get("/submit" , function(req , res){
 if( req.isAuthenticated()){
 	res.render("submit");
 }else{
 	res.redirect("/login");
 }


});

app.post("/register", function(req ,res){
User.register({ username:req.body.username} , req.body.password , function(err , user){
 if(err){
 	console.log(err);
 	res.redirect("/register");
 }else{
 	passport.authenticate("local")(req , res , function(){
 		res.redirect("/secrets");
 	});
 }
});

});

app.post("/login" , function(req , res){

	const user = new User({
	 username :req.body.username,
	 password : req.body.password	
	});
	
	req.login(user , function(err){
		if(err){
			console.log(err);
		}else{
			passport.authenticate("local")(req , res , function(){
				res.redirect("/secrets");
			});
		}
	});
 


});
app.listen(3000 , function( req , res){
	console.log("server runing on port 3000");
});
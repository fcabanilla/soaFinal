var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user');
var database= 'mongodb://localhost:27017/users';

/* GET users listing. */
router.post('/', function(req, res, next) {
	
	mongoose.connect(database).then(
	  ()=>{console.log("connected")},
	  err =>{console.log("err",err);}
	)

	// create a new user called chris
	var chris = new User({
	  name: 'Chris',
	  username: 'sevilayha',
	  password: 'password' 
	});


	// call the built-in save method to save to the database
	chris.save(function(err) {
	  if (err) throw err;

	  console.log('User saved successfully!');
	});

	res.send('respond with a resource');
});

router.get('/', function(req, res, next) {
	mongoose.connect(database).then(
	  ()=>{console.log("connected")},
	  err =>{console.log("err",err);}
	)

	User.find({}, function(err, users) {
	if (err) throw err;

	  // object of all the users
	  console.log(users);
	res.send(users);
	});
});

router.put('/:nam', function(req, res, next) {
	mongoose.connect(database).then(
	  ()=>{console.log("connected")},
	  err =>{console.log("err",err);}
	)
	User.findOneAndUpdate({ username: req.params.nam}, { username: 'FABIOLA' }, function(err, user) {
		  if (err) throw err;

		  // we have the updated user returned to us
		  console.log(user);
		res.send(user);
	});
});


function find(){
	User.find({})
	 .then((data)=>{
	    console.log(data);
	  })
	 .catch((err)=>{
	   console.log(err);
	 })

	// you can pass query parameter to get particular record

	User.find({name:"YOUR_NAME"})
	 .then((doc)=>{
	    console.log(doc);
	 })
	.catch((err)=>{
	    console.log(err);
	});
}


module.exports = router;


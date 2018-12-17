const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClientSchema = Schema({

	user: String,
	password: String
});

module.exports = mongoose.model('Client', ClientSchema)

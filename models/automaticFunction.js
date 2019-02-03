var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var automaticFunctionSchema = Schema({
	state: String,
    automaticFunction: String
});

module.exports = mongoose.model('AutomaticFunction', automaticFunctionSchema)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stateHistorySchema = Schema({
	state: Boolean,
	timestamp: {type: Date, default: Date.now} //para este campo, dejo que Mongoose cargue, por default, el Date de ahora (o sea es el timestamp de ahora(
});

module.exports = mongoose.model('stateHistory', stateHistorySchema)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StateHistorySchema = Schema({
	// device: String,
	timeStamp: Date,
	typeOfData: String,
	state: String,
	device: { type: Schema.ObjectId, ref: 'Device'}
});

module.exports = mongoose.model('StateHistory', StateHistorySchema)

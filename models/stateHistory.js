var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StateHistorySchema = Schema({
	// device: String,
	timeStamp: {type: Date, default: Date.now},
	typeOfData: String,
	state: String,
	device: { type: Schema.ObjectId, ref: 'Device'}
});

module.exports = mongoose.model('StateHistory', StateHistorySchema)

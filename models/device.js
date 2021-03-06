var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = Schema({
	device: String,
	description: String,
	typeOfData: String,
	lastState: String,
	editable: Boolean,
	area: { type: Schema.ObjectId, ref: 'Area'}
});

module.exports = mongoose.model('Device', DeviceSchema)

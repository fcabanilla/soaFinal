var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = Schema({
	device: String,
	description: String,
	typeOfData: String,
	actualState: String,
	area: { type: Schema.ObjectId, ref: 'Area'}
});

module.exports = mongoose.model('Decive', DeviceSchema)

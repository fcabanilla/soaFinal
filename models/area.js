const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AreaSchema = Schema({
	area: String,
	description: String,
	place: { type: Schema.ObjectId, ref: 'Place'}
});

module.exports = mongoose.model('Area', AreaSchema)

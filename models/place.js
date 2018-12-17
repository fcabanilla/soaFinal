var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
	place: String,
	description: String,
	client: { type: Schema.ObjectId, ref: 'Client'}
});

module.exports = mongoose.model('Place', PlaceSchema)

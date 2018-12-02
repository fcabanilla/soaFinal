var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Area=require('./area');

var lugarSchema = new Schema({
	idlugar: { type: Number, required: true, unique: true },
	lugar: String,
	areas: {
		type: Array,
		ref: 'Area'
	}
});

var Lugar = mongoose.model('Lugar', lugarSchema, 'lugar');

module.exports = Lugar;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Dispositivo = require('./dispositivo');

var areaSchema = new Schema({
	"idarea": { type: Number, required: true, unique: true },
	"area": String,
	"dispositivos": {
		type: Array,
		ref:'Dispositivo'
	}
});

var Area = mongoose.model('Area', areaSchema, 'area');

module.exports = Area;

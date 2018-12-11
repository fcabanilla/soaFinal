var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var historialEstadosSchema = new Schema({
	iddispositivo: {type:Number},
	estado: {type:Number},
	timestamp_estado: {type: String}
});

var HistorialEstados = mongoose.model('HistorialEstados', historialEstadosSchema, 'historialestados');

module.exports = HistorialEstados;

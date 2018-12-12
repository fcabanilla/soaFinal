var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var historialEstadosSchema = new Schema({
	iddispositivo: {type:Number},
	estado: {type:Number},
	timestamp_estado: {type: Date, default: Date.now} //para este campo, dejo que Mongoose cargue, por default, el Date de ahora (o sea es el timestamp de ahora(
});

var HistorialEstados = mongoose.model('HistorialEstados', historialEstadosSchema, 'historialestados');

module.exports = HistorialEstados;

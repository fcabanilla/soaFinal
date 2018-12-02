var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dispositivoSchema = new Schema({
	iddispositivo: { type: Number, required: true, unique: true },
	descripcion: String,
	estado_actual: Number
});

var Dispositivo = mongoose.model('Dispositivo', dispositivoSchema, 'dispositivo');

module.exports = Dispositivo;

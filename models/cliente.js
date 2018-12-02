var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Lugar=require('./lugar');

var clienteSchema = new Schema({
	idcliente: { type: Number, required: true, unique: true },
	cliente: String,
	lugares: { 
		type: Array,
		ref: 'Lugar'
	}
});

var Cliente = mongoose.model('Cliente', clienteSchema, 'cliente');

module.exports = Cliente;

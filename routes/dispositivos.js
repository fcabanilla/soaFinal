var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Dispositivo = require('../models/dispositivo');
var database= 'mongodb://localhost:27017/bdmia';

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)


router.post('/', function(req, res, next) {
	var nuevodisp = new Dispositivo({
		iddispositivo: req.body.iddispositivo,
		descripcion: req.body.descripcion,
		estado_actual: req.body.estado_actual
	});

	nuevodisp.save(function(err) {
		if (err) throw err;
		console.log('GUARDASTE EL NUEVO DISPOSITIVO!!!!!!! :D');
		res.send(nuevodisp);
	});

});

router.get('/', function(req, res, next) {
	Dispositivo.find({}, function(err, dispositivos) {
		if (err) throw err;
		console.log(dispositivos);
		res.send(dispositivos);
	});
});

router.get('/:id', function(req,res){
	var idparam=req.params.id;
	Dispositivo.find({iddispositivo:idparam}, function(err,dispabuscar){
		if (err) throw err;
		console.log(dispabuscar);
		res.send(dispabuscar);
	})
})

router.put('/:id', function(req, res, next) {
	var idparam=req.params.id;
	Dispositivo.findOneAndUpdate({iddispositivo: req.query.id}, {$set: {descripcion: req.body.descripcion, estado_actual: req.body.estado_actual}}, function(err, dispmodificado) {
		if (err) throw err;
		console.log('UPDETEASTE el nuevo dispositivo!! :D');
		res.send(dispmodificado);
	});
});

router.delete('/:id', function(req,res){
	var param=req.params.id;
	Dispositivo.findOneAndRemove({iddispositivo:param}, function(err, dispabuscar) {
		if (err) throw err;
		res.send(dispabuscar);
	});
});

module.exports = router;

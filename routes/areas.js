var express = require('express');
var router = express.Router();
const mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var Area = require('../models/area');
var database= 'mongodb://localhost:27017/bdmia';
var Dispositivo = require('../models/dispositivo');

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)


router.post('/', function(req, res, next) {
	var nuevaarea = new Area({
		idarea: req.body.idarea,
		area: req.body.area,
		dispositivos:req.body.dispositivos
	});
	nuevaarea.save(function(err) {
		if (err) throw err;
		res.send(nuevaarea);
	});

	var i;
	for (i=0;i<req.body.dispositivos.length;i++){
		var nuevodisp = new Dispositivo({
			iddispositivo: req.body.dispositivos[i].iddispositivo,
			descripcion: req.body.dispositivos[i].descripcion,
			estado_actual: req.body.dispositivos[i].estado_actual
		});	
		
		nuevodisp.save(function(err) {
			if (err) throw err;
		});
	}
});

router.get('/', function(req, res, next) {
	Area.find({},function(err, areas) {
		if (err) throw err;
		console.log(areas);
		res.send(areas);
	});
});

router.get('/:id', function(req,res){
	var idparam=req.params.id;
	Area.find({idarea: idparam}, function(err,areaabuscar){
		if (err) throw err;
		res.send(areaabuscar);
	})
})

router.put('/:id', function(req, res, next) {
	var pid=req.params.id;
	var i;

	Area.findOneAndUpdate({idarea: pid}, {area: req.body.area, dispositivos: req.body.dispositivos}, function(err, areamodificada) {
		if (err) throw err;
		for (i=0;i<req.body.dispositivos.length;i++){
			Dispositivo.findOneAndUpdate({iddispositivo:req.body.dispositivos[i].iddispositivo}, {descripcion: req.body.dispositivos[i].descripcion, estado_actual: req.body.dispositivos[i].estado_actual},function(err, dispositivoabuscar) {
				if (err) throw err;
			});
		}
		res.send(areamodificada);
	});
});

router.delete('/:id', function(req,res){
	var pid=req.params.id;
	Area.findOneAndRemove({idarea:pid}, function(err, areaabuscar) {
		if (err) throw err;
		var i;
		for (i=0;i<areaabuscar.dispositivos.length;i++){		
			Dispositivo.findOneAndRemove({iddispositivo:areaabuscar.dispositivos[i].iddispositivo}, function(err, dispositivoabuscar) {
				if (err) throw err;
			});
		}
		res.send(areaabuscar);
	});
});

module.exports = router;

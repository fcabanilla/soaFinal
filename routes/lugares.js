var express = require('express');
var router = express.Router();
const mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var Area = require('../models/area');
var Cliente = require('../models/cliente');
var database= 'mongodb://localhost:27017/bdmia';
var Dispositivo = require('../models/dispositivo');
var Lugar = require('../models/lugar');

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)


router.post('/:idclient', function(req, res, next) {
	var idcli=req.params.idclient;

	var nuevolugar = new Lugar({
		idlugar: req.body.idlugar,
		lugar: req.body.lugar,
		areas: req.body.areas
	});
	nuevolugar.save(function(err) {
		if (err) throw err;
		res.send(nuevolugar);
	});

	Cliente.findOne({idcliente: idcli}, function(err,clienteabuscar){
		clienteabuscar.lugares.push(nuevolugar);
		clienteabuscar.markModified("lugares");
		clienteabuscar.save();	
		if (err) throw err;
	})
	
	var i;
	for (i=0;i<nuevolugar.areas.length;i++){
		var nuevaarea = new Area({
			idarea: req.body.areas[i].idarea,
			area: req.body.areas[i].area,
			dispositivos: req.body.areas[i].dispositivos
		});	
		nuevaarea.save(function(err) {
			if (err) throw err;
		});

		var nuevodisp = new Dispositivo({
			iddispositivo: nuevaarea.dispositivos[i].iddispositivo,
			descripcion: nuevaarea.dispositivos[i].descripcion,
			estado_actual: nuevaarea.dispositivos[i].estado_actual
		});	

		nuevodisp.save(function(err) {
			if (err) throw err;
		});
	}


});

router.get('/', function(req, res, next) {
	Lugar.find({},function(err, lugares) {
		if (err) throw err;
		res.send(lugares);
	});
});

router.get('/:id', function(req,res){
	var idparam=req.params.id;
	Lugar.find({idlugar: idparam}, function(err,lugarabuscar){
		if (err) throw err;
		res.send(lugarabuscar);
	})
})

router.put('/:id', function(req, res, next) {
	var pid=parseInt(req.params.id);
	var i=0,j=0;

	for (i=0;i<req.body.areas.length;i++){
		for (j=0;j<req.body.areas[i].dispositivos.length;j++){	
			Dispositivo.findOneAndUpdate({iddispositivo: req.body.areas[i].dispositivos[j].iddispositivo}, {descripcion: req.body.areas[i].dispositivos[j].descripcion, estado_actual: req.body.areas[i].dispositivos[j].estado_actual}, function(err, dispabuscar) {
				if (err) throw err;
			});
		}
	}

	for (i=0;i<req.body.areas.length;i++){
			Area.findOneAndUpdate({idarea: req.body.areas[i].idarea}, {area: req.body.areas[i].area, dispositivos: req.body.areas[i].dispositivos}, function(err, areaamodificar) {
				if (err) throw err;
			});
	}

	Lugar.findOneAndUpdate({idlugar: pid}, {lugar: req.body.lugar, areas: req.body.areas}, function(err, lugaramodificar) {
		if (err) throw err;
		res.send(lugaramodificar);
	});

	Cliente.findOne({'lugares.idlugar': pid}, function(err,clienteabuscar){
		for(var i=0;i<clienteabuscar.lugares.length;i++){
			if(clienteabuscar.lugares[i].idlugar===pid){
				clienteabuscar.lugares.splice(i,1, nuevolugar);
				break;
			}
		}
		clienteabuscar.markModified("lugares");
		clienteabuscar.save();	
		if (err) throw err;
	})

});


router.delete('/:id', function(req,res){
	var pid=parseInt(req.params.id);
	Cliente.findOne({'lugares.idlugar': pid}, function(err,clienteabuscar){
		for(var i=0;i<clienteabuscar.lugares.length;i++){
			if(clienteabuscar.lugares[i].idlugar===pid){
				clienteabuscar.lugares.splice(i,1);		
				break;
			}
		}

		clienteabuscar.markModified("lugares");
		clienteabuscar.save();	
		if (err) throw err;
	})
	
	Lugar.findOneAndRemove({idlugar: pid}, {}, function(err, lugar) {		
		var j;
		for(j=0;j<lugar.areas.length;j++){
			Area.findOneAndRemove({idarea: lugar.areas[j].idarea}, {area: lugar.areas[j].area, dispositivos: lugar.areas[j].dispositivos}, function(err, area) {
			var k;
			for(k=0;k<area.dispositivos.length;k++){
				Dispositivo.findOneAndRemove({iddispositivo:area.dispositivos[k].iddispositivo}, {descripcion: area.dispositivos[k].descripcion, estado_actual: area.dispositivos[k].estado_actual}, function(err, dispositivo) {
					if (err) throw err;
				});
			}
			if (err) throw err;
			});
		}
		if (err) throw err;
		res.send(lugar);
	});
});

module.exports = router;

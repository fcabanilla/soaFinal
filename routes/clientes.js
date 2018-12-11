var express = require('express');
var router = express.Router();
const mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var Cliente = require('../models/cliente');
var database= 'mongodb://localhost:27017/bdmia';
var Lugar = require('../models/lugar');
var Area = require('../models/area');
var Dispositivo = require('../models/dispositivo');

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)

router.post('/', function(req, res, next) {
	var nuevocliente = new Cliente({
		idcliente: req.body.idcliente,
		cliente: req.body.cliente,
		lugares: req.body.lugares
	});
	nuevocliente.save(function(err) {
		if (err) throw err;
		res.send(nuevocliente);
	});

	var i,j,k;
	for (i=0;i<req.body.lugares.length;i++){
		var nuevolugar = new Lugar({
			idlugar: req.body.lugares[i].idlugar,
			lugar: req.body.lugares[i].lugar,
			areas: req.body.lugares[i].areas
		});

			nuevolugar.save(function(err) {
			if (err) throw err;
		});
	}

	for(i=0;i<req.body.lugares.length;i++){
		for(j=0;j<req.body.lugares[i].areas.length;j++){
			var nuevaarea = new Area({
				idarea: req.body.lugares[i].areas[j].idarea,
				area: req.body.lugares[i].areas[j].area,
				dispositivos: req.body.lugares[i].areas[j].dispositivos
			});

			nuevaarea.save(function(err) {
				if (err) throw err;
			});	
		}
	}

	for(i=0;i<req.body.lugares.length;i++){
		for(j=0;j<req.body.lugares[i].areas.length;j++){	
			for(k=0;k<req.body.lugares[i].areas[j].dispositivos.length;k++){
				var nuevodisp = new Dispositivo({
					iddispositivo: req.body.lugares[i].areas[j].dispositivos[k].iddispositivo,
					descripcion: req.body.lugares[i].areas[j].dispositivos[k].descripcion,
					estado_actual: req.body.lugares[i].areas[j].dispositivos[k].estado_actual
				});
				nuevodisp.save(function(err) {
					if (err) throw err;
				});	
			}
		}	
	}
});


router.get('/', function(req, res, next) {
	Cliente.find({},function(err, clientes) {
		if (err) throw err;
		console.log(clientes);
		res.send(clientes);
	});
});


router.get('/:id', function(req,res){
	var idparam=req.params.id;
	Cliente.find({idcliente: idparam}, function(err,clienteabuscar){
		if (err) throw err;
		res.send(clienteabuscar);
	})
})


router.put('/:id', function(req, res) {
	var pid=req.params.id;
	var i=0,j=0,k=0;

	Cliente.findOneAndUpdate({idcliente: pid}, {cliente: req.body.cliente, lugares: req.body.lugares}, function(err, clientemodificado) {
		if (err) throw err;
		res.send(clientemodificado);
	});


	for (i=0;i<req.body.lugares.length;i++){
		Lugar.findOneAndUpdate({idlugar: req.body.lugares[i].idlugar}, {lugar: req.body.lugares[i].lugar, areas: req.body.lugares[i].areas}, function(err, lugaramodificar) {
			if (err) throw err;
		});
	}

	for (i=0;i<req.body.lugares.length;i++){
		for (j=0;j<req.body.lugares[i].areas.length;j++){	
			Area.findOneAndUpdate({idarea: req.body.lugares[i].areas[j].idarea}, {area: req.body.lugares[i].areas[j].area, dispositivos: req.body.lugares[i].areas[j].dispositivos}, function(err, areaamodificar) {
				if (err) throw err;
			});
		}
	}

	for (i=0;i<req.body.lugares.length;i++){
		for (j=0;j<req.body.lugares[i].areas.length;j++){	
			for(k=0;k<req.body.lugares[i].areas[j].dispositivos.length;k++){
				Dispositivo.findOneAndUpdate({iddispositivo: req.body.lugares[i].areas[j].dispositivos[k].iddispositivo}, {descripcion: req.body.lugares[i].areas[j].dispositivos[k].descripcion, estado_actual: req.body.lugares[i].areas[j].dispositivos[k].estado_actual}, function(err, dispabuscar) {
					if (err) throw err;
				});
			}
		}
	}
});


router.delete('/:id', function(req,res){
	var pid=req.params.id;

	Cliente.findOneAndRemove({idcliente: pid}, {cliente: req.body.cliente, lugares: req.body.lugares}, function(err, clientebd) {
			console.log(clientebd);
			var i;
			for (i=0;i<clientebd.lugares.length;i++){
				Lugar.findOneAndRemove({idlugar: clientebd.lugares[i].idlugar}, {lugar: clientebd.lugares[i].lugar, areas: clientebd.lugares[i].areas}, function(err, lugar) {		
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
				});
			}
			if (err) throw err;
			res.send(clientebd);	
	});
});

module.exports = router;


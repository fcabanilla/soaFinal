var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Dispositivo = require('../models/dispositivo');
var database= 'mongodb://localhost:27017/bdmia';
var Lugar = require('../models/lugar');
var Area = require('../models/area');
var Cliente = require('../models/cliente');

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)


router.post('/', function(req, res, next) {
	var idc=parseInt(req.body.numcliente);
	var idl=parseInt(req.body.numlugar);
	var ida=parseInt(req.body.numarea);

	var nuevodisp = new Dispositivo({
		iddispositivo: req.body.iddispositivo,
		descripcion: req.body.descripcion,
		estado_actual: req.body.estado_actual
	});

	nuevodisp.save(function(err) {
		if (err) throw err;
		res.send(nuevodisp);
	});

	Area.findOne({idarea: ida},function(err,areabuscada){
		if (err) throw err;
		areabuscada.dispositivos.push(nuevodisp);
		areabuscada.markModified("dispositivos");
		areabuscada.save();
	})
	
	Lugar.findOne({idlugar: idl},function(err,lugarbd){
		for(var i=0;i<lugarbd.areas.length;i++){	
			if(lugarbd.areas[i].idarea===ida){	
				lugarbd.areas[i].dispositivos.push(nuevodisp);
				break;
			}
		}
		lugarbd.markModified("areas");
		lugarbd.save();
		if (err) throw err;		
	})

	Cliente.findOne({idcliente: idc},function(err,clientebd){
		for(var i=0;i<clientebd.lugares.length;i++){
			for(var j=0;j<clientebd.lugares[i].areas.length;j++){	
				if(clientebd.lugares[i].areas[j].idarea===ida){	
					clientebd.lugares[i].areas[j].dispositivos.push(nuevodisp);
					break;
				}
			}
		}
		clientebd.markModified("lugares");
		clientebd.save();
		if (err) throw err;		
	})
	
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
	var idparam=parseInt(req.params.id); //IDLUGAR que quiero modificar
	var idc=parseInt(req.body.numcliente);
	var idl=parseInt(req.body.numlugar);
	var ida=parseInt(req.body.numarea);

	var dispmodif = new Dispositivo({
		iddispositivo: req.body.iddispositivo,
		descripcion: req.body.descripcion,
		estado_actual: req.body.estado_actual
	});

	Dispositivo.findOneAndUpdate({iddispositivo: idparam}, {$set: {descripcion: req.body.descripcion, estado_actual: req.body.estado_actual}}, function(err, dispmodificado) {
		if (err) throw err;
		res.send(dispmodificado);
	});

 	Area.findOne({idarea: ida}, function(err, areaabuscar){
		for(var i=0;i<areaabuscar.dispositivos.length;i++){
			if(areaabuscar.dispositivos[i].iddispositivo===idparam){
				areaabuscar.dispositivos.splice(i,1, dispmodif);
				break;
			}
		}
		areaabuscar.markModified("dispositivos");
		areaabuscar.save();	
		if (err) throw err;
	})

	Lugar.findOne({idlugar: idl}, function(err, lugarabuscar) {
		for(var i=0;i<lugarabuscar.areas.length;i++){
			for(var j=0;j<lugarabuscar.areas[i].dispositivos.length;j++){
				if(lugarabuscar.areas[i].dispositivos[j].iddispositivo===idparam){
					lugarabuscar.areas[i].dispositivos.splice(j,1, dispmodif);
					break;
				}
			}
		}
		lugarabuscar.markModified("areas");
		lugarabuscar.save();	
		if (err) throw err;
	});

	Cliente.findOne({idcliente: idc}, function(err,clienteabuscar){
		for(var i=0;i<clienteabuscar.lugares.length;i++){
			for(var j=0;j<clienteabuscar.lugares[i].areas.length;j++){
				for(var k=0;k<clienteabuscar.lugares[i].areas[j].dispositivos.length;k++){
					if(clienteabuscar.lugares[i].areas[j].dispositivos[k].iddispositivo===idparam){
						clienteabuscar.lugares[i].areas[j].dispositivos.splice(k,1, dispmodif);
						break;
					}
				}
			}
		}
		clienteabuscar.markModified("lugares");
		clienteabuscar.save();	
		if (err) throw err;
	})
});

router.delete('/:id', function(req,res){
	var param=parseInt(req.params.id);
	
	Dispositivo.findOneAndRemove({iddispositivo:param}, function(err, dispabuscar) {
		if (err) throw err;
		res.send(dispabuscar);
	});

	Cliente.find({}, function(err,clienteabuscar){
		var l=0
		var clientemodificado;
		while(l<clienteabuscar.length){
			for(var i=0;i<clienteabuscar[l].lugares.length;i++){
				for(var j=0;j<clienteabuscar[l].lugares[i].areas.length;j++){
					for(var k=0;k<clienteabuscar[l].lugares[i].areas[j].dispositivos.length;k++){
						if(clienteabuscar[l].lugares[i].areas[j].dispositivos[k].iddispositivo===param){
							clienteabuscar[l].lugares[i].areas[j].dispositivos.splice(k,1);
							clientemodificado=clienteabuscar[l];
							break;
						}
					}
				}
			}
			l++;
		}
		Cliente.findOneAndUpdate({idcliente: clientemodificado.idcliente}, {cliente: clientemodificado.cliente, lugares: clientemodificado.lugares}, function(err,clienteyamodificado){
			if (err) throw err;		
		})
		if (err) throw err;
	})
	
	Lugar.find({}, function(err, lugaresbd) {
		var lugarmodificado;
		for(var i=0;i<lugaresbd.length;i++){
			for(var j=0;j<lugaresbd[i].areas.length;j++){
				for(var k=0;k<lugaresbd[i].areas[j].dispositivos.length;k++){
					if(lugaresbd[i].areas[j].dispositivos[k].iddispositivo===param){
						lugaresbd[i].areas[j].dispositivos.splice(k,1);
						lugarmodificado=lugaresbd[i];
						break;
					}			
				}
			}
		}
		Lugar.findOneAndUpdate({idlugar: lugarmodificado.idlugar}, {lugar: lugarmodificado.lugar, areas: lugarmodificado.areas}, function(err, clientebuscado){
			if (err) throw err;
		})
		if (err) throw err;
	});

 	Area.find({}, function(err, areasbd){
		var areamodificada;
		for(var i=0;i<areasbd.length;i++){
			for(var j=0;j<areasbd[i].dispositivos.length;j++){
				if(areasbd[i].dispositivos[j].iddispositivo===param){
					areasbd[i].dispositivos.splice(j,1);
					areamodificada=areasbd[i];
					break;
				}
			}	
		}
		areamodificada.markModified("dispositivos");
		areamodificada.save();
		if (err) throw err;
	})
});

module.exports = router;

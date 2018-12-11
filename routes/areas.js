var express = require('express');
var router = express.Router();
const mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var Area = require('../models/area');
var database= 'mongodb://localhost:27017/bdmia';
var Dispositivo = require('../models/dispositivo');
var Lugar = require('../models/lugar');
var Cliente = require('../models/cliente');

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)


router.post('/:idcl/:idlug', function(req, res, next) {
	var idlugamod=parseInt(req.params.idlug)
	var idclamod=parseInt(req.params.idcl)
	//console.log('IDLUGARMOD: '+idlugamod+', idclamod: '+idclamod);

	var nuevaarea = new Area({
		idarea: req.body.idarea,
		area: req.body.area,
		dispositivos:req.body.dispositivos
	});

	nuevaarea.save(function(err) {
		if (err) throw err;
		res.send(nuevaarea);
	});

	Cliente.findOne({idcliente: idclamod}, function(err,clienteabuscar){
		for(var i=0;i<clienteabuscar.lugares.length;i++){
			if(clienteabuscar.lugares[i].idlugar===idlugamod){
				clienteabuscar.lugares[i].areas.push(nuevaarea);
				break;						
			}
		}
		clienteabuscar.markModified("lugares");
		clienteabuscar.save();	
		if (err) throw err;
	})

	Lugar.findOne({idlugar: idlugamod}, function(err,lugarabuscar){
		lugarabuscar.areas.push(nuevaarea);
		lugarabuscar.markModified("areas");
		lugarabuscar.save();	
		if (err) throw err;
	})

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
	var pid=parseInt(req.params.id);
	var i=0,j=0;

	var nuevaarea = new Area({
		idarea: req.body.idarea,
		area: req.body.area,
		dispositivos:req.body.dispositivos
	});

	Lugar.find({}, {}, function(err, lugarabuscar) {
		var lugarmodificado;
		for(var i=0;i<lugarabuscar.length;i++){
			for(var j=0;j<lugarabuscar[i].areas.length;j++){
				if(lugarabuscar[i].areas[j].idarea===pid){
					lugarabuscar[i].areas.splice(j,1, nuevaarea);
					lugarmodificado=lugarabuscar[i];
					lugarmodificado.markModified("areas");
					break;
				}			
			}
		}
		Lugar.findOneAndUpdate({idlugar: lugarmodificado.idlugar}, {lugar: lugarmodificado.lugar, areas: lugarmodificado.areas}, function(err, clientebuscado){
			if (err) throw err;
		})
		if (err) throw err;
	});

	Cliente.find({}, function(err,clienteabuscar){
		var clientemodificado;
		for(var i=0;i<clienteabuscar.length;i++){
			for(var j=0;j<clienteabuscar[i].lugares.length;j++){
				for(var k=0;k<clienteabuscar[i].lugares[j].areas.length;k++){
					if(clienteabuscar[i].lugares[j].areas[k].idarea===pid){
						clienteabuscar[i].lugares[j].areas.splice(k,1,nuevaarea);
						clientemodificado=clienteabuscar[i];
						clientemodificado.markModified("areas");
						break;		
					}				
				}
			}
		}
		
		Cliente.findOneAndUpdate({idcliente: clientemodificado.idcliente}, {cliente: clientemodificado.cliente, lugares: clientemodificado.lugares}, function(err, clientebuscado){
			console.log('CLIENTEMODIFICATED: '+clientemodificado);
			if (err) throw err;
		})
		if (err) throw err;
	})


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
	var pid=parseInt(req.params.id);
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

	Cliente.find({}, {}, function(err,clienteabuscar){
		var clientemodificado;
		for(var i=0;i<clienteabuscar.length;i++){
			for(var j=0;j<clienteabuscar[i].lugares.length;j++){
				for(var k=0;k<clienteabuscar[i].lugares[j].areas.length;k++){
					if(clienteabuscar[i].lugares[j].areas[k].idarea===pid){
						clienteabuscar[i].lugares[j].areas.splice(k,1);
						clientemodificado=clienteabuscar[i];
						break;		
					}				
				}
			}
		}

		Cliente.findOneAndUpdate({idcliente: clientemodificado.idcliente}, {cliente: clientemodificado.cliente, lugares: clientemodificado.lugares}, function(err, clientebuscado){
			if (err) throw err;
		})
		if (err) throw err;
	})
	
	Lugar.find({}, {}, function(err, lugarabuscar) {
		var lugarmodificado;
		for(var i=0;i<lugarabuscar.length;i++){
			for(var j=0;j<lugarabuscar[i].areas.length;j++){
				if(lugarabuscar[i].areas[j].idarea===pid){
					lugarabuscar[i].areas.splice(j,1);
					lugarmodificado=lugarabuscar[i];
					break;
				}			
			}
		}
		Lugar.findOneAndUpdate({idlugar: lugarmodificado.idlugar}, {lugar: lugarmodificado.lugar, areas: lugarmodificado.areas}, function(err, clientebuscado){
			if (err) throw err;
		})
		if (err) throw err;
	});
});

module.exports = router;

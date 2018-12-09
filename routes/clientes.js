var express = require('express');
var router = express.Router();
const mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var Cliente = require('../models/cliente');
var database= 'mongodb://localhost:27017/bdmia';
var Lugar = require('../models/lugar');
var Area = require('../models/area');
var Dispositivo = require('../models/dispositivo');
const isNumber = require('is-number');
const mqtt = require('mqtt');
var ultimo_estado=0;

mongoose.connect(database).then(
	()=>{console.log("connected")},
		err =>{console.log("err",err);}
)

var Broker_URL = 'mqtt://localhost';
var options = {
	clientId: 'MyMQTT',
	port: 1883,
	keepalive : 60
};

var topicogral='xx';
var client;
function mqtt_connect() {
	client.subscribe(topicogral, mqtt_subscribe);
};
function mqtt_subscribe(err, granted) {
    console.log("Subscribed to " + topicogral);
    if (err) {console.log(err);}
};
var Broker_URL = 'mqtt://localhost';
var options = {
	clientId: 'MyMQTT',
	port: 1883,
	keepalive : 60
};
function receiveMessage(topic,message,packet){
	if(topicogral==='pepe/casa1/living/light1111'){
		console.log('ULTIMO STATE BEFORE: '+ultimo_estado);
		if(ultimo_estado!=message.toString()){
			ultimo_estado=parseInt(message.toString());
			console.log('ULTIMO STATE AFTER: '+ultimo_estado);
		}	
	}
}
router.post('/posttopico', function(req, res, next) {
	topicogral=req.body.topico;
	client = mqtt.connect(Broker_URL, options);
	client.on('connect', mqtt_connect);
	client.on('message', receiveMessage);
	res.send('TOPICO SUSCRIPTO AHORA: '+topicogral);
});


// de alguna forma, el sistema debe saber que dispositivo, de qué area, y de que lugar se modificó
router.put('/getultimoestado/:disp', function(req, res){
	console.log('ultimoestado para bd: '+ultimo_estado);
	var dispamod=req.params.disp.toString();
	var idcl = dispamod.substring(0, 1);
	
	var idlu = dispamod.substring(1, 2);
	var idar = dispamod.substring(2, 3);
	var iddis = dispamod.substring(3, 4);
	for(var i=0;i<dispamod.length;i++){
		if(isNumber(dispamod[i])){
			idcl=parseInt(dispamod.substring(i,i+1));
			idlu=parseInt(dispamod.substring(i+1,i+2));
			idar=parseInt(dispamod.substring(i+2,i+3));
			iddis=parseInt(dispamod.substring(i+3,i+4));
			break;
		}
	}
	
	Cliente.findOne({idcliente: idcl}, function(err,clienteabuscar){
		cl=clienteabuscar;
		cl.lugares[idlu-1].areas[idar-1].dispositivos[iddis-1].estado_actual=ultimo_estado;
		cl.markModified("lugares");
		cl.save();	
		if (err) throw err;
		console.log('cliente ok');
	})
	Lugar.findOne({idlugar: idlu, "areas.dispositivos.iddispositivo": iddis},function(err, lugarmodificado) {
		lugarmodificado.areas[idar-1].dispositivos[iddis-1].estado_actual=ultimo_estado;
		lugarmodificado.markModified("areas");		
		lugarmodificado.save();		
		if (err) throw err;
		console.log('lugar ok');
	});

	Area.findOneAndUpdate({idarea: idar, "dispositivos.iddispositivo": iddis}, {'$set':  {"dispositivos.$.estado_actual": ultimo_estado}}, function(err, areamodificada) {
		if (err) throw err;
		console.log('area ok');
	});

	Dispositivo.findOneAndUpdate({iddispositivo: iddis}, {estado_actual: ultimo_estado}, function(err, dispositivoabuscar) {
		if (err) throw err;
		console.log('disp ok');
	});
	res.send('Ok!! :)');
});


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
			area: req.body.lugares[i].lugar,
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
		for (i=0;i<clientemodificado.lugares.length;i++){
			var pepe=req.body.lugares[i]
			Lugar.findOneAndUpdate({idlugar: req.body.lugares[i].idlugar}, {lugar: req.body.lugares[i].lugar, areas: req.body.lugares[i].areas}, function(err, lugarmodificado) {
				for(j=0;j<pepe.areas.length;j++){
					console.log(pepe)	
					var pepe2=pepe.areas[j]
					Area.findOneAndUpdate({idarea: pepe2.idarea}, {area: pepe2.area, dispositivos: pepe2.dispositivos}, function(err, areamodificada) {
						for(k=0;k<pepe2.dispositivos.length;k++){
							Dispositivo.findOneAndUpdate({iddispositivo: pepe2.dispositivos[k].iddispositivo}, {descripcion: pepe2.dispositivos[k].descripcion, estado_actual: pepe2.dispositivos[k].estado_actual}, function(err, dispositivoabuscar) {
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
		res.send(clientemodificado);
	});
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


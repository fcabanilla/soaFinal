var express = require('express');
var router = express.Router();
const mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var Cliente = require('../models/cliente');
var database= 'mongodb://localhost:27017/bdmia';
var Lugar = require('../models/lugar');
var Area = require('../models/area');
var Dispositivo = require('../models/dispositivo');
var HistorialEstados = require('../models/historialestados');
const isNumber = require('is-number');
const mqtt = require('mqtt');
var ultimo_estado=0303456;

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
	var dispamod=topic.toString();
	var idcl = "xx"
	var idlu = "xx"
	var idar = "xx"
	var iddis = "xx"
	var barrascontadas=0
	var pedazosstring=""
	var llavescontadas=0;

	for(var i=0;i<dispamod.length;i++){
		if(dispamod[i]==="/"){
			barrascontadas++;	
		}
		if(barrascontadas==3 && dispamod[i]=="{"){		
			for(var j=i+1; j<dispamod.length;j++){
				if(dispamod[j]=="{"){
					continue;				
				}
				if(dispamod[j]!="}"){
					pedazosstring=pedazosstring+dispamod[j];
				}
				else{
					llavescontadas++;
					if(llavescontadas==1){
						idcl=parseInt(pedazosstring);		
					}
					if(llavescontadas==2){
						idlu=parseInt(pedazosstring);				
					}
					if(llavescontadas==3){
						idar=parseInt(pedazosstring);				
					}
					if(llavescontadas==4){
						iddis=parseInt(pedazosstring);				
					}								
					pedazosstring=""
				}
			}
			break;
		}
	}

	if(ultimo_estado!=message.toString()){
		ultimo_estado=parseInt(message.toString());
		Cliente.findOne({idcliente: idcl}, function(err,clienteabuscar){
			cl=clienteabuscar;
			for(var i=0;i<cl.lugares[idlu-1].areas[idar-1].dispositivos.length;i++){
				if(cl.lugares[idlu-1].areas[idar-1].dispositivos[i].iddispositivo==iddis){
					cl.lugares[idlu-1].areas[idar-1].dispositivos[i].estado_actual=ultimo_estado;
					break;
				}
			}

			cl.markModified("lugares");
			cl.save();	
			if (err) throw err;
			console.log('cliente ok');
		})
		Lugar.findOne({idlugar: idlu, "areas.dispositivos.iddispositivo": iddis},function(err, lugarmodificado) {
			for(var i=0;i<lugarmodificado.areas[idar-1].dispositivos.length;i++){
				if(lugarmodificado.areas[idar-1].dispositivos[i].iddispositivo==iddis){
					lugarmodificado.areas[idar-1].dispositivos[i].estado_actual=ultimo_estado;
					break;
				}
			}
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

		var nuevoestado = new HistorialEstados({
			iddispositivo: iddis,
			estado: ultimo_estado,
			timestamp_estado: new Date().toString()
		});
		nuevoestado.save(function(err) {
			if (err) throw err;
			console.log('Nuevo estado guardado en el historial de estados, OK!!! :)');
		});
		
	}
}


router.post('/posttopico', function(req, res, next) {
	topicogral=req.body.topico;
	client = mqtt.connect(Broker_URL, options);
	client.on('connect', mqtt_connect);
	client.on('message', receiveMessage);
	res.send('TOPICO SUSCRIPTO AHORA: '+topicogral);
});

router.get('/getultimoestado/:disp', function(req, res){
	var dispamod=req.params.disp.toString();
	var iddis = dispamod.substring(3, 4);
	for(var i=0;i<dispamod.length;i++){
		if(isNumber(dispamod[i])){
			iddis=parseInt(dispamod.substring(i+3,i+4));
			break;
		}
	}
	Dispositivo.findOne({iddispositivo: iddis}, function(err, dispositivoabuscar) {
		if (err) throw err;
		res.send('Ultimo estado del dispositivo '+dispositivoabuscar.descripcion+': '+dispositivoabuscar.estado_actual);
	});	
});

router.get('/historialestados/:iddisp', function(req,res){
	var iddisp=req.params.iddisp;

	HistorialEstados.find({iddispositivo: iddisp}, function(err, estadosdispositivo) {
		if (err) throw err;
		res.send(estadosdispositivo);
	});
})

router.get('/historialestados', function(req,res){
	HistorialEstados.find(function(err, estadosdispositivos) {
		if (err) throw err;
		res.send(estadosdispositivos);
	});
})
module.exports = router;

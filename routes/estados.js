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
			for(var i=0;i<clienteabuscar.lugares.length;i++){
				for(var j=0;j<clienteabuscar.lugares[i].areas.length;j++){
					for(var k=0;k<clienteabuscar.lugares[i].areas[j].dispositivos.length;k++){
						if(clienteabuscar.lugares[i].areas[j].dispositivos[k].iddispositivo===iddis){
							clienteabuscar.lugares[i].areas[j].dispositivos[k].estado_actual=ultimo_estado;
							break;	
						}
					}	
				}
			}
			clienteabuscar.markModified("lugares");
			clienteabuscar.save();	
			if (err) throw err;
			console.log('cliente ok');
		})
		Lugar.findOne({idlugar: idlu},function(err, lugarabuscar) {
			for(var i=0;i<lugarabuscar.areas.length;i++){
				for(var j=0;j<lugarabuscar.areas[i].dispositivos.length;j++){
					if(lugarabuscar.areas[i].dispositivos[j].iddispositivo===iddis){
						lugarabuscar.areas[i].dispositivos[j].estado_actual=ultimo_estado;
						break;	
					}
				}	
			}

			lugarabuscar.markModified("areas");		
			lugarabuscar.save();		
			if (err) throw err;
			console.log('lugar ok');
		});

		Area.findOneAndUpdate({idarea: idar, "dispositivos.iddispositivo": iddis}, {'$set':  {"dispositivos.$.estado_actual": ultimo_estado}}, function(err, areamodificada) {
			if (err) throw err;
			console.log('area ok');
		});
		
		Dispositivo.findOneAndUpdate({iddispositivo: iddis}, {estado_actual: ultimo_estado}, function(err, dispositivoabuscar) {
			if (err) throw err;
			var nuevoestado = new HistorialEstados({
				iddispositivo: iddis,
				estado: ultimo_estado,
				timestamp_estado: dispositivoabuscar._id.getTimestamp().toString() //EL _id que genera mongo por defecto, que es único, y que es para cada documento (se puede cambiar, obviamente), parte de los bits de este _id, pertenecen al timestamp de creación del mismo; lo puedo obtener a través del método getTimestamp(), ya que _id es de tipo ObjectId
			});
			nuevoestado.save(function(err) {
				if (err) throw err;
				console.log('Nuevo estado guardado en el historial de estados, OK!!! :)');
			});
			console.log('disp ok');
		});
	}
}

function crearClienteMqtt(req){
	topicogral=req.body.topico;
	client = mqtt.connect(Broker_URL, options);
	client.on('connect', mqtt_connect);
	client.on('message', receiveMessage);
}

router.post('/posttopico', function(req, res, next) {
	crearClienteMqtt(req);
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

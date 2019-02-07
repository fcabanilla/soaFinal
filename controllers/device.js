'use strict'

const path = require('path');
const fs = require('fs');
const mongoosePaginate = require('mongoose-pagination');
var Device = require('../models/device');
var StateHistory = require('../models/stateHistory');

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://hive');
client.on('connect', function(){
	console.log("La conexion fue exitosa");

	Device.find({}).populate({
		path: 'area',
		populate: {
			path: 'place',
			populate: {
				path: 'client',
				model: 'Client'
			}
		}
	}).exec(function(err, docs){
		if(err) return console.log(err)
		generarListener(docs)
	})
});

function getTopicString(device){

	return device.area.place.client.user + ' > '	+ device.area.place.place + ' > '	+ device.area.area + ' > ' + device.device
}

function generarListener(devices){
	var topics = []
	var ids = []
	for(var i = 0; i < devices.length; i++){
		var topic = getTopicString(devices[i]) + " > out"
		topics.push(topic)
		ids.push({
			device: devices[i],
			topic: topic
		})
	}

	client.subscribe(topics, function(){
		client.on("message", function(topic, message, packet){
			for(var i = 0; i < ids.length; i++){
				if(ids[i].topic == topic){
					ids[i].device.lastState = message
					ids[i].device.save()
					StateHistory({
						typeOfData: ids[i].device.typeOfData,
						state: message,
						device: ids[i].device._id
					}).save()
				}
			}
		})
	})

}

function testMqtt( req, res) {
	var client  = mqtt.connect('mqtt://localhost');
	client.on('connect', function () {
		client.subscribe('Topic07');
		console.log('client has subscribed successfully');
	});

	client.on('connect', function(){
	  client.publish('Topic07','cricket');
	})

	client.on('message', function (topic, message){
		console.log(message.toString()); //if toString is not given, the message comes as buffer
	});
}

function saveDevice(req, res){
	var device = new Device();

	var params = req.body;

	device.device = params.device;
	device.description = params.description;
	device.typeOfData = params.typeOfData;
	device.lastState = params.lastState;
	device.area = params.area;
	device.editable = params.editable;

	device.save((err, deviceStored) => {
		if(err){
			res.status(500).send({message: 'Error en el servidor'});
		}else{
			if(!deviceStored){
				res.status(404).send({message: 'No se ha guardado el dispositivo'});
			}else{
				/*
				StateHistory({
					typeOfData: device.typeOfData,
					state: device.lastState,
					device: .device._id
				}).save((err, stateHistoryStored) => {
					if (err) {
						res.status(500).send({message:'Error en el servidor'})
					} else {
						if (!stateHistoryStored) {
							res.status(404).send({message: 'No se ha podido guardar el Estado Historico del dispositivo. '})
						} else {
							res.status(200). send({device: deviceStored, stateHistory: stateHistoryStored});
						}
					}
				})*/
				res.status(200).send({device: deviceStored});
			}
		}
	});
}

function getDevice(req, res){
	var deviceId = req.params.id;

	Device.findById(deviceId).populate({path: 'area', populate: {path: 'place', populate: {path: 'client'}}}).exec((err, device)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición get device'});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{
				res.status(200).send({device});
			}
		}
	});
}

function updateDevice(req, res){
	var deviceId = req.params.id;
	var update = req.body;

	// if(deviceId != req.client.sub){
	//   return res.status(500).send({message: 'No tienes permiso para actualizar este dispositivo'});
	// }

	Device.findByIdAndUpdate(deviceId, update, (err, deviceUpdated) => {
		if(err){
			res.status(500).send({message: 'Error en el servidor'});
		}else{
			if(!deviceUpdated){
				res.status(404).send({message: 'No se ha guardado el dispositivo'});
			}else{
				StateHistory({
					typeOfData: update.typeOfData,
					state: update.lastState,
					device: deviceId
				}).save((err, stateHistoryStored) => {
					if (err) {
						res.status(500).send({message:'Error en el servidor'})
					} else {
						if (!stateHistoryStored) {
							res.status(404).send({message: 'No se ha podido guardar el Estado Historico del dispositivo. '})
						} else {
							res.status(200). send({device: deviceUpdated, stateHistory: stateHistoryStored});
						}
					}
				})
				// res.status(200).send({device: deviceStored});
			}
		}
	});
}

function getDevices(req, res){
	var areaId = req.params.area;

	if(!areaId){
		var find = Device.find({}).sort('device');
	}else{
		var find = Device.find({area: areaId}).sort('device');
	}

	find.populate({
		path: 'area',
		populate: {
			path: 'place',
			populate: {
				path: 'client',
				model: 'Client'
			}
		}
	}).exec(function(err, devices){
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!devices){
				res.status(404).send({message: 'No hay dispositivos !!'});
			}else{
				res.status(200).send({devices});
			}
		}
	});
}

function changeState(req, res){
	var deviceId = req.params.id;
	var updateDevice = req.body;
	// var updateDevice.actualState = req.body.newState;

	// Device.findById(deviceId).populate({path: 'area'}).exec((err, device)=>{
	Device.findById(deviceId).populate({path: 'area', populate: { path: 'place', populate: { path: 'client', model: 'Client'}}}).exec((err, device)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición get device'});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{

				//CREACION DEL TOPICO
				var topicName = device.area.place.client.user + ' > '	+ device.area.place.place + ' > '	+ device.area.area + ' > ' + device.device;
				var topicId = device.area.place.client._id + '>'	+ device.area.place._id + '>' + device.area._id + '>' + device._id;
				console.log({topicId: topicId});
				console.log({topicName: topicName});

				//ESCRIBIR EN COLA MQTT

				// var client = mqtt.connect('mqtt://hive', options);

				console.log('publicando en el topico: ' + topicName);
				// client.on('connect', function(){
				//
				// 	console.log('HOLAAAA');
				// 	console.log(updateDevice.lastState);
				// })
				client.publish(topicName, updateDevice.lastState);

				//PUT DEVICE
				Device.findByIdAndUpdate(deviceId, updateDevice, (err, deviceUpdated) => {
					if(err){
						res.status(500).send({message: 'Error al actualizar el usuario'});
					}else{
						if(!deviceUpdated){
							res.status(404).send({message: 'No se ha podido actualizar el usuario'});
						}else{
							//POST HISTORY
							StateHistory({
								typeOfData: updateDevice.typeOfData,
								state: updateDevice.lastState,
								device: deviceId
							}).save((err, stateHistoryStored) => {
								if (err) {
									res.status(500).send({message:'Error en el servidor'})
								} else {
									if (!stateHistoryStored) {
										res.status(404).send({message: 'No se ha podido guardar el Estado Historico del dispositivo. '})
									} else {
										res.status(200). send({device: deviceUpdated, stateHistory: stateHistoryStored});
									}
								}
							})
							// res.status(200).send({device: deviceUpdated});
						}
					}
				});
			}
		}
	});
}

function getActualState(req, res){
	var deviceId = req.params.id;

	Device.findById(deviceId).populate({path: 'area'}).exec((err, device)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{
				res.status(200).send({
					device:{
						typeOfData: device.typeOfData,
						actualState: device.lastState
					}
				});
			}
		}
	});
}

function getTopic(req, res){
	var deviceId = req.params.id;
	var updateDevice = req.body;
	// var updateDevice.actualState = req.body.newState;

	// Device.findById(deviceId).populate({path: 'area'}).exec((err, device)=>{
	Device.findById(deviceId).populate({path: 'area', populate: { path: 'place', populate: { path: 'client', model: 'Client'}}}).exec((err, device)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición get device aca', err: err});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{

				//CREACION DEL TOPICO
				var topicName = device.area.place.client.user + ' > '	+ device.area.place.place + ' > '	+ device.area.area + ' > ' + device.device;
				var topicId = device.area.place.client._id + '>'	+ device.area.place._id + '>' + device.area._id + '>' + device._id;
				res.status(200).send({
					topicId: topicId,
					topicName: topicName
				});
				// console.log({device: device});
				// console.log({topicId: topicId});
				// console.log({topicName: topicName});

			}
		}
	});
}

module.exports = {
	saveDevice,
    getDevice,
    getDevices,
	changeState,
	getActualState,
	updateDevice,
	getTopic,
	testMqtt
};

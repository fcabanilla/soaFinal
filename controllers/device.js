'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Device = require('../models/device');

function saveDevice(req, res){
	var device = new Device();

	var params = req.body;

	device.device = params.device;
	device.description = params.description;
	device.typeOfData = params.typeOfData;
	device.actualState = params.actualState;
	device.area = params.area;

	device.save((err, deviceStored) => {
		if(err){
			res.status(500).send({message: 'Error en el servidor'});
		}else{
			if(!deviceStored){
				res.status(404).send({message: 'No se ha guardado el dispositivo'});
			}else{
				res.status(200).send({place: deviceStored});
			}
		}
	});
}

function getDevice(req, res){
	var deviceId = req.params.id;

	Device.findById(deviceId).populate({path: 'area'}).exec((err, device)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{
				res.status(200).send({device});
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
	var update = req.body;

	Device.findById(deviceId).populate({path: 'area', populate: { path: 'place', populate: { path: 'client', model: 'Client'}}}).exec((err, device)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{
				res.status(200).send({
					topicName: device.area.place.client.user + ' > '	+ device.area.place.place + ' > '	+ device.area.area + ' > ' + device.device,
					topicId: device.area.place.client._id + '>'	+ device.area.place._id + '>' + device.area._id + '>' + device._id
				});
			}
		}
	});


/*
	Device.findByIdAndUpdate(deviceId, update, (err, deviceUpdated) => {
		if(err){
			res.status(500).send({message: 'Error al guardar el dispositivo'});
		}else{
			if(!deviceUpdated){
				res.status(404).send({message: 'El dispositivo no pudo cambiar de estado'});
			}else{
				res.status(200).send({device: deviceUpdated});
			}
		}
	});
*/
}
module.exports = {
	saveDevice,
    getDevice,
    getDevices,
	changeState
};

'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var StateHistory = require('../models/stateHistory');
var Device = require('../models/device');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
const mongoose = require('mongoose');


function saveStateHistory(req, res){
	var stateHistory = new StateHistory();

	var params = req.body;

	var deviceId = params.device;
	stateHistory.typeOfData = params.typeOfData;
	stateHistory.state = params.state;
	stateHistory.timeStamp = Date.now();
	// console.log({ahora: Date.now()});
	// console.log({stateHistory: stateHistory});

	Device.find({device: deviceId}).exec((err, device)=>{
		if(err){
			// console.log({error: err});
			res.status(500).send({message: 'Error en la petición get device'});
		}else{
			if(!device){
				res.status(404).send({message: 'El dispositivo no existe.'});
			}else{
				// res.status(200).send({device});
				stateHistory.device = device[0]._id;
				stateHistory.save((err, stateHistoryStored) => {
					if(err){

						res.status(500).send({message: 'Error en el servidor'});
					}else{
						if(!stateHistoryStored){

							res.status(404).send({message: 'No se ha guardado el Historial'});
						}else{

							res.status(200).send({stateHistory: stateHistoryStored});
						}
					}
				});
			}
		}
	});

}


function getHistory(req, res){

	var deviceId = req.params.id;
	// var deviceId = mongoose.Types.ObjectId(deviceId);

	if(!deviceId){
		var find = StateHistory.find({}).sort('device');
	}else{
		var find = StateHistory.find({device: deviceId});
	}


	find.populate({
		path:'device',
		populate:{
			path: 'area',
			populate: {
				path: 'place'
			}
		}
	}).exec((err, stateHistory)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición', err, err});
		}else{
			if(!stateHistory){
				res.status(404).send({message: 'El Historial de este dispositivo no existe.'});
			}else{
				res.status(200).send({stateHistory});
			}
		}
	});

}

module.exports = {
	saveStateHistory,
	getHistory
};

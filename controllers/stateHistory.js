'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var StateHistory = require('../models/stateHistory');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
const mongoose = require('mongoose');


function saveStateHistory(req, res){
	var stateHistory = new StateHistory();

	var params = req.body;

	stateHistory.device = params.device;
	stateHistory.typeOfData = params.typeOfData;
	stateHistory.state = params.state;
	stateHistory.timeStamp = Date.now();
	// console.log({ahora: Date.now()});
	// console.log({stateHistory: stateHistory});

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


function getHistory(req, res){
	var device = req.params.id;
	var deviceId = mongoose.Types.ObjectId(deviceId);

	StateHistory.findById({"device" : deviceId}).exec((err, stateHistory)=>{
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

// function getAllHistory(req, res){
//
// 	var find = StateHistory.find({}).sort('timeStamp');
//
// 	find.populate({path: 'device'}).exec((err, stateHistory) => {
// 		if(err){
// 			res.status(500).send({message: 'Error en la petición', err, err});
// 		}else{
// 			if(!stateHistory){
// 				res.status(404).send({message: 'No hay historial'});
// 			}else{
// 				res.status(200).send({stateHistory});
// 			}
// 		}
// 	});
// }

module.exports = {
	saveStateHistory,
	getHistory
	// getAllHistory
	// getStatesHistory
};

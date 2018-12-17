'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Place = require('../models/place');

function savePlace(req, res){
	var place = new Place();

	var params = req.body;

    place.place = params.place;
	place.description = params.description;
	place.client = params.client;

	place.save((err, placeStored) => {
		if(err){
			res.status(500).send({message: 'Error en el servidor'});
		}else{
			if(!placeStored){
				res.status(404).send({message: 'No se ha guardado el lugar'});
			}else{
				res.status(200).send({place: placeStored});
			}
		}
	});
}

function getPlace(req, res){
	var placeId = req.params.id;

	Place.findById(placeId).populate({path: 'client'}).exec((err, place)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!place){
				res.status(404).send({message: 'El lugar no existe.'});
			}else{
				res.status(200).send({place});
			}
		}
	});
}

function getPlaces(req, res){
	var clientId = req.params.client;

	if(!clientId){
		// Sacar todos los lugars de la bbdd
		var find = Place.find({}).sort('place');
	}else{
		// Sacar los lugares de un cliente concreto de la bbdd
		var find = Place.find({client: clientId}).sort('place');
	}

	find.populate({path: 'client'}).exec((err, places) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!places){
				res.status(404).send({message: 'No hay lugares'});
			}else{
				res.status(200).send({places});
			}
		}
	});
}

module.exports = {
	savePlace,
    getPlace,
    getPlaces
};

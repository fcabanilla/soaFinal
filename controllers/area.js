'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Area = require('../models/area');

function saveArea(req, res){
	var area = new Area();

	var params = req.body;

	area.area = params.area;
	area.description = params.description;
	area.place = params.place;
	// console.log(params);

	area.save((err, areaStored) => {
		if(err){
			res.status(500).send({message: 'Error en el servidor'});
		}else{
			if(!areaStored){
				res.status(404).send({message: 'No se ha guardado el area'});
			}else{
				res.status(200).send({area: areaStored});
			}
		}
	});
}

function getArea(req, res){
	var areaId = req.params.id;

	Area.findById(areaId).populate({path: 'place'}).exec((err, area)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición get Area '});
		}else{
			if(!area){
				res.status(404).send({message: 'El area no existe.'});
			}else{
				res.status(200).send({area});
			}
		}
	});
}

function getAreas(req, res){
	var placeId = req.params.place;

	if(!placeId){
		// Sacar todos los lugars de la bbdd
		var find = Area.find({}).sort('area');
	}else{
		// Sacar los lugares de un cliente concreto de la bbdd
		var find = Area.find({place: placeId}).sort('area');
	}

	find.populate({path: 'place'}).exec((err, areas) => {
		if(err){
			res.status(500).send({message: 'Error en la petición get Areas'});
		}else{
			if(!areas){
				res.status(404).send({message: 'No hay lugares'});
			}else{
				res.status(200).send({areas});
			}
		}
	});
}

module.exports = {
	saveArea,
    getArea,
    getAreas
};

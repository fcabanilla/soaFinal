'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Client = require('../models/client');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');


function pruebas(req, res){
	res.status(200).send({
		message: 'Probando una acción del controlador de usuarios del api rest con Node y Mongo'
	});
}

function saveClient(req, res){
	var client = new Client();

	var params = req.body;

	console.log(params);

	client.user = params.user;

	if(params.password){
		// Encriptar contraseña
		bcrypt.hash(params.password, null, null, function(err, hash){
			client.password = hash;

			if(client.user != null){
				// Guardar el usuario
				client.save((err, clientStored) => {
					if(err){
						res.status(500).send({message: 'Error al guardar el cliente'});
					}else{
						if(!clientStored){
							res.status(404).send({message: 'No se ha registrado el cliente'});
						}else{
							res.status(200).send({client: clientStored});
						}
					}
				});

			}else{
			    res.status(200).send({message: 'Rellena todos los campos'});
			}
		});
	}else{
		res.status(200).send({message: 'Introduce la contraseña'});
	}

}

function loginClient(req, res){
	var params = req.body;

	var user = params.user;
	var password = params.password;

	Client.findOne({user: user.toLowerCase()}, (err, client) => {
		if(err){
			res.status(500).send({message: 'Error en la petición login client'});
		}else{
			if(!client){
				res.status(404).send({message: 'El usuario no existe'});
			}else{

				// Comprobar la contraseña
				bcrypt.compare(password, client.password, function(err, check){
					if(check){
						//devolver los datos del usuario logueado
						if(params.gethash){
							// devolver un token de jwt
							res.status(200).send({
								token: jwt.createToken(client)
							});
						}else{
							res.status(200).send({client});
						}
					}else{
						res.status(404).send({message: 'El usuario no ha podido loguease'});
					}
				});
			}
		}
	});
}

function updateClient(req, res){
	var clientId = req.params.id;
	var update = req.body;

	if(clientId != req.client.sub){
	  return res.status(500).send({message: 'No tienes permiso para actualizar este cliente'});
	}

	Client.findByIdAndUpdate(clientId, update, (err, clientUpdated) => {
		if(err){
			res.status(500).send({message: 'Error al actualizar el usuario'});
		}else{
			if(!clientUpdated){
				res.status(404).send({message: 'No se ha podido actualizar el usuario'});
			}else{
				res.status(200).send({client: clientUpdated});
			}
		}
	});
}

function getClients(req, res){
	if(req.params.page){
		var page = req.params.page;
	}else{
		var page = 1;
	}

	var itemsPerPage = 4;

	Client.find().sort('name').paginate(page, itemsPerPage, function(err, clients, total){
		if(err){
			res.status(500).send({message: 'Error en la petición get Clientes.'});
		}else{
			if(!clients){
				res.status(404).send({message: 'No hay Clientes !!'});
			}else{
				return res.status(200).send({
					total_items: total,
					clients: clients
				});
			}
		}
	});
}
module.exports = {
	pruebas,
	saveClient,
	loginClient,
	updateClient,
	getClients
};

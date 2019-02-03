'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var AutomaticFunction = require('../models/automaticFunction');


function getAutoFunction(req, res){
	var autoFuncId = req.params.id;

	if(!autoFuncId){
		// Sacar todos los lugars de la bbdd
		var find = AutomaticFunction.find({});
	}else{
		// Sacar los lugares de un cliente concreto de la bbdd
		var find = AutomaticFunction.find({automaticFunction: autoFuncId});
	}

	find.exec((err, automaticFunctions) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!automaticFunctions){
				res.status(404).send({message: 'No hay funciones automaticas cargadas'});
			}else{
				res.status(200).send({automaticFunctions});
			}
		}
	});
}

function updateStateAutomaticFunction(req, res){
	var autoFuncId = req.params.id;
	var update = req.body;

	AutomaticFunction.findByIdAndUpdate(autoFuncId, update, (err, autoFuncUpdated) => {
		if(err){
			res.status(500).send({message: 'Error al actualizar el estado de la Funcion Automatica'});
		}else{
			if(!autoFuncUpdated){
				res.status(404).send({message: 'No se ha podido actualizar la Funcion Automatica'});
			}else{
                // CONECTARME CON LA RASPY
				res.status(200).send({automaticFunction: autoFuncUpdated});
			}
		}
	});
}

function saveAutomaticFunction(req, res) {
    var automaticFunction = new AutomaticFunction();
    var params = req.body;
    automaticFunction.state = false;
    automaticFunction.automaticFunction = params.automaticFunction;

    console.log({'tipo de funcion automatica': automaticFunction.automaticFunction});

    if (!automaticFunction.automaticFunction || (automaticFunction.automaticFunction  < 1 || automaticFunction.automaticFunction > 2)) {
        res.status(500).send({message: 'Hay que especificar que tipo de funcion automatica es (nombre del atriburo: automaticFunction). \n[1] - Simulador de presencia.\n[2] - Luces con sensor de movimiento'});
    }else {
        automaticFunction.save((err, autofuncStored)=>{
            if (err) {
                res.status(500).send({message: 'Error en el servidor'});
            } else {
                if (!autofuncStored) {
                    res.status(404).send({message: 'No se ha guardado la Función Automatica'});
                } else {
                    res.status(200).send({automaticFunction: autofuncStored});
                }
            }
        })

    }


}

module.exports = {
	getAutoFunction,
	updateStateAutomaticFunction,
    saveAutomaticFunction
};

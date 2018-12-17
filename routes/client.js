'use strict'

var express = require('express');
var ClientController = require('../controllers/client');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');


api.get('/fede/probando-controlador', md_auth.ensureAuth, ClientController.pruebas);
api.get('/clients', md_auth.ensureAuth, ClientController.getClients);
api.post('/register', ClientController.saveClient);
api.post('/login', ClientController.loginClient);
api.put('/update-client/:id', md_auth.ensureAuth, ClientController.updateClient);

module.exports = api;

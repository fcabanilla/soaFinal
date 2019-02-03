'use strict'

var express = require('express');
var automaticFunctionController = require('../controllers/automaticFunction');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/automaticFunction/:id?', md_auth.ensureAuth, automaticFunctionController.getAutoFunction);
api.post('/automaticFunction', md_auth.ensureAuth, automaticFunctionController.saveAutomaticFunction);
api.put('/automaticFunction/:id', md_auth.ensureAuth, automaticFunctionController.updateStateAutomaticFunction);

module.exports = api;

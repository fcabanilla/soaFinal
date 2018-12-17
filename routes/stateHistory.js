'use strict'

var express = require('express');
var StateHistoryController = require('../controllers/stateHistory');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/stateHistory', md_auth.ensureAuth, StateHistoryController.saveStateHistory);
api.get('/stateHistory/:id', md_auth.ensureAuth, StateHistoryController.getHistory);
// api.get('/stateHistory', md_auth.ensureAuth, StateHistoryController.getAllHistory);
// api.get('/device/:id', md_auth.ensureAuth, DeviceController.getDevice);
// api.get('/device/actualState/:id', md_auth.ensureAuth, DeviceController.getActualState);
// api.put('/device/changeState/:id', md_auth.ensureAuth, DeviceController.changeState);
// api.put('/device/:id', md_auth.ensureAuth, DeviceController.updateDevice);
//
// api.get('/device/testMqtt/:id', md_auth.ensureAuth, DeviceController.testMqtt);

module.exports = api;

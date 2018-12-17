'use strict'

var express = require('express');
var DeviceController = require('../controllers/device');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/device', md_auth.ensureAuth, DeviceController.saveDevice);
api.get('/device/:id', md_auth.ensureAuth, DeviceController.getDevice);
api.get('/device/topic/:id', md_auth.ensureAuth, DeviceController.getTopic);
api.get('/device/actualState/:id', md_auth.ensureAuth, DeviceController.getActualState);
api.get('/devices/:area?', md_auth.ensureAuth, DeviceController.getDevices);
api.put('/device/changeState/:id', md_auth.ensureAuth, DeviceController.changeState);
api.put('/device/:id', md_auth.ensureAuth, DeviceController.updateDevice);

api.get('/device/testMqtt/:id', md_auth.ensureAuth, DeviceController.testMqtt);

module.exports = api;

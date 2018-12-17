'use strict'

var express = require('express');
var DeviceController = require('../controllers/device');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/device', md_auth.ensureAuth, DeviceController.saveDevice);
api.get('/device/:id', md_auth.ensureAuth, DeviceController.getDevice);
api.get('/devices/:place?', md_auth.ensureAuth, DeviceController.getDevices);
api.put('/device/:id', md_auth.ensureAuth, DeviceController.changeState);
// api.delete('/album/:id', md_auth.ensureAuth, AlbumController.deleteAlbum);
// api.post('/upload-image-album/:id', [md_auth.ensureAuth, md_upload], AlbumController.uploadImage);
// api.get('/get-image-album/:imageFile', AlbumController.getImageFile);

module.exports = api;

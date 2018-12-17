'use strict'

var express = require('express');
var PlaceController = require('../controllers/place');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/place', md_auth.ensureAuth, PlaceController.savePlace);
api.get('/place/:id', md_auth.ensureAuth, PlaceController.getPlace);
api.get('/places/:client?', md_auth.ensureAuth, PlaceController.getPlaces);
// api.put('/album/:id', md_auth.ensureAuth, AlbumController.updateAlbum);
// api.delete('/album/:id', md_auth.ensureAuth, AlbumController.deleteAlbum);
// api.post('/upload-image-album/:id', [md_auth.ensureAuth, md_upload], AlbumController.uploadImage);
// api.get('/get-image-album/:imageFile', AlbumController.getImageFile);

module.exports = api;

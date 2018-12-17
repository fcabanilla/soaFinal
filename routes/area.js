'use strict'

var express = require('express');
var AreaController = require('../controllers/area');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/area', md_auth.ensureAuth, AreaController.saveArea);
api.get('/area/:id', md_auth.ensureAuth, AreaController.getArea);
api.get('/areas/:place?', md_auth.ensureAuth, AreaController.getAreas);

module.exports = api;

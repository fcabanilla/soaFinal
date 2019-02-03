'use strict'

var express = require('express');
var StateHistoryController = require('../controllers/stateHistory');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/stateHistory', md_auth.ensureAuth, StateHistoryController.saveStateHistory);
api.get('/stateHistory/:id?', md_auth.ensureAuth, StateHistoryController.getHistory);

module.exports = api;

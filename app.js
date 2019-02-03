'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')

var app = express();

// cargar rutas
var client_routes = require('./routes/client');
var place_routes = require('./routes/place');
var area_routes = require('./routes/area');
var device_routes = require('./routes/device');
var stateHistory_routes = require('./routes/stateHistory');
var automaticFunction_routes = require('./routes/automaticFunction');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors())
// configurar cabeceras http


// rutas base
app.use('/api', client_routes);
app.use('/api', place_routes);
app.use('/api', area_routes);
app.use('/api', device_routes);
app.use('/api', stateHistory_routes);
app.use('/api', automaticFunction_routes);


module.exports = app;

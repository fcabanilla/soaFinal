'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar rutas
var client_routes = require('./routes/client');
var place_routes = require('./routes/place');
var area_routes = require('./routes/area');
var device_routes = require('./routes/device');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// configurar cabeceras http


// rutas base
app.use('/api', client_routes);
app.use('/api', place_routes);
app.use('/api', area_routes);
app.use('/api', device_routes);


module.exports = app;

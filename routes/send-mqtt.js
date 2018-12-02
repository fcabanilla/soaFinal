var express = require("express");
var bodyParser = require("body-parser");
var mqttHandler = require('./mqtt_resources/mqtt_class (copia)');
//var mqtt_mongo=require('./mqtt_resources/mqtt_mongo');
var router = express.Router();
var mqtt = require('mqtt');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))

/*
var mqttClient = new mqttHandler();
mqttClient.connect();
mqttClient.suscribe('pepe');

router.get("/:topico", function(req,res){
	mqtt_messsageReceived
})
*/
module.exports = router;

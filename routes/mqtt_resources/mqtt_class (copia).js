"use strict";
const mqtt = require('mqtt');
var MQTTStore = require("mqtt-store");

var mqttClient = null;
var host = 'mqtt://localhost:1883';
var username = 'YOUR_USER'; // mqtt credentials if these are needed to connect
var password = 'YOUR_PASSWORD';
var topic='mitopico';
var mensajerecibido='xx';
var Broker_URL = 'mqtt://localhost';

var options = {
	clientId: 'MyMQTT',
	port: 1883,
	//username: 'mqtt_user',
	//password: 'mqtt_password',	
	keepalive : 60
};

var client  = mqtt.connect(Broker_URL, options);
client.on('connect', connect);
//client.on('reconnect', mqtt_reconnect);
//client.on('error', mqtt_error);
client.on('message', receiveMessage);
client.on('close', mqtt_close);

function mqtt_close() {
	//console.log("Close MQTT");
};

function connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host);

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });


    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic

function sendMessage(message) {
    this.mqttClient.publish('mytopic', message);
  }

function suscribe(topic){
    // mqtt subscriptions
    this.mqttClient.subscribe(topic, {qos: 0});
    this.topic=topic;
  }

function receiveMessage(topic, message){
    var mensajereturn='asudsa';    
      console.log(message.toString());
      this.mensajerecibido=message.toString();
  }
  
function saveMessage(mensaje){
    this.mensajerecibido=mensaje;
    console.log('holliiis mensaje: '+this.mensajerecibido);
  } 
  
function returnSavedMessage(){
    return this.mensajerecibido;	
}

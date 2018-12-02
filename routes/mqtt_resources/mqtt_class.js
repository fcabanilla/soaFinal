"use strict";
const mqtt = require('mqtt');
var MQTTStore = require("mqtt-store");


class MqttHandler {
  constructor() {

    this.mqttClient = null;
    this.host = 'mqtt://localhost:1883';
    this.username = 'YOUR_USER'; // mqtt credentials if these are needed to connect
    this.password = 'YOUR_PASSWORD';
    this.topic='mitopico';
    this.mensajerecibido='xx';
  }
  
  connect() {
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
  sendMessage(message) {
    this.mqttClient.publish('mytopic', message);
  }

  suscribe(topic){
    // mqtt subscriptions
    this.mqttClient.subscribe(topic, {qos: 0});
    this.topic=topic;
  }

  receiveMessage(topic){
    var mensajereturn='asudsa'; 
    var store = new MQTTStore();
    // When a message arrives, console.log it
    var mqttclient=this.mqttClient;
    this.mqttClient.on('message', function (topic, message) {
      console.log(message.toString());
      this.mensajerecibido=message.toString();
      mqttclient.unsubscribe(topic, function(){
	mqttclient.end();
	return;
	})
      return;

    });
    console.log('afuera aiuda: '+store.get("pepemsj"));
    
    //return mensajereturn;
  }
  
  saveMessage(mensaje){
    this.mensajerecibido=mensaje;
    console.log('holliiis mensaje: '+this.mensajerecibido);
  } 
  
  returnSavedMessage(){
    return this.mensajerecibido;	
   }
}

module.exports = MqttHandler;

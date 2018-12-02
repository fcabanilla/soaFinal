var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
var pepe='asdads'

/*
client.on('connect', function () {
  client.subscribe('pepe')
  //client.publish('pepe', 'Hello mqtt')
})

*/
  // message is Buffer


function recibir(topic){
	client.on('message', function(topic,message){
	  console.log(message.toString())
	  pepe=message.toString()
	  console.log('PEPITOO: '+pepe)
	  //client.end()
	})
}

module.exports = recibir;

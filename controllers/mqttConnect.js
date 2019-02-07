var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://hive')

client.on('connect', function () {
  client.subscribe('test', function (err) {
    if (!err) {
      client.publish('test', 'Hello mqtt from NodeJS')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})

var SimpleMQTTClient = require('../node_modules/simple-mqtt-client');

var mqtt_client = new SimpleMQTTClient('ltg.evl.uic.edu');

mqtt_client.subscribe('/test/#', function(message, channel) {
    console.log(message +  ' on ' + channel);
});

mqtt_client.publish('/test', 'message');

console.log(mqtt_client.getHost());
console.log(mqtt_client.getSubscriptions());

mqtt_client.disconnect();

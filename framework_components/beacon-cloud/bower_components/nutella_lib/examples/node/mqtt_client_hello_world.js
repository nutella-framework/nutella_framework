var mqtt = require('../../simple-js-mqtt-client');

var client = mqtt.connect('ltg.evl.uic.edu');

client.subscribe('demo1', function(message) {
    console.log("First subscription: " + message);
});

var sscb = function(message){
    console.log("Second subscription: " + message);
    client.publish('demo2', "I'm gonna die")
    client.unsubscribe('demo1', sscb);
};
client.subscribe('demo1', sscb);

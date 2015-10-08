var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
//nutella.setResourceId('my_resource_id');

console.log('running');

// 1. Subscribing to a channel
nutella.net.subscribe('demo_channel', function(message, from) {
    // Your code to handle messages received on this channel goes here
});


// 2. Publish a message to a channel
nutella.net.publish('demo_channel', 'demo_message');


// 2a. The cool thing is that the message can be any object
nutella.net.publish('demo_channel', {a: 'proper', key: 'value'});


// 3. Make asynchronous requests on a certain channel
nutella.net.request( 'demo_channel', 'my_request', function(response){
    // Your code to handle the response to this request goes here
});


// 4. Handle requests from other components
nutella.net.handle_requests( 'demo_channel', function(message, from) {
    // Your code to handle each request here
    // Anything this function returns (String, Integer, Object...) is going to be sent as the response
    var response = 'a simple string'
    // response = 12345
    // response = {}
    // response = {my:'json'}
    return response;
});

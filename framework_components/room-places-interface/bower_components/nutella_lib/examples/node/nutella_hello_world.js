var NUTELLA = require('../../nutella_lib.js')

// Initialize nutella
//var nutella = NUTELLA.init('my_run_id', 'ltg.evl.uic.edu', 'demo_browser_interface');

//    // Subscribe to a channel
//    nutella.net.subscribe("demo1", function(message, c_id, r_id) {
//        console.log('Received "' +  JSON.stringify(message) + '" from ' + c_id + '/' + r_id);
//        nutella.net.unsubscribe('demo1');
//    });

//    // Wildcard subscribe
//    nutella.net.subscribe("demo2/#", function(message, channel, c_id, r_id) {
//        console.log('Received "' +  JSON.stringify(message) + '" on channel ' + channel + ' from ' + c_id + '/' + r_id);
//    });

//    // Publish some stuff
//    nutella.net.publish('demo1');
//    nutella.net.publish('demo1', 'just a string');
//    nutella.net.publish('demo1', {a: 'proper', key: 'value'});
//    nutella.setResourceId('a_particular_resource');
//    nutella.net.publish('demo1');
//    nutella.net.publish('demo1', 'just a string');
//    nutella.net.publish('demo1', {a: 'proper', key: 'value'});

    // Handle requests
    //nutella.net.handle_requests('demo1', function(message, component_id, resource_id) {
    //    return 'this is the returned value';
    //});
    //
    //// Perform a couple requests
    //nutella.net.request('demo1', function(response) {
    //    console.log("This is the response to empty request (GET)");
    //});
    //
    //nutella.net.request('demo1', 'my_request', function(response) {
    //    console.log("This is the response to non-empty request");
    //});

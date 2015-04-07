var NUTELLA = require('../src/nutella_lib')

// Initialize nutella
//var p = NUTELLA.parseURLParameters();    // This only works in the browser
var p = NUTELLA.parseAppComponentArgs();
console.log(p)
var nutella = NUTELLA.init('ltg.evl.uic.edu', 'my_app_id', 'my_run_id', 'demo_node_bot');
nutella.setResourceId('r_id');
nutella.log.test();
nutella.net.publish('channel', 'message');
nutella.persist.test();      // this should only work in node
nutella = NUTELLA.initApp('ltg.evl.uic.edu', 'my_app_id', 'demo_node_bot');
nutella.app.net.test();
nutella.app.log.test();
nutella.app.persist.test();



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

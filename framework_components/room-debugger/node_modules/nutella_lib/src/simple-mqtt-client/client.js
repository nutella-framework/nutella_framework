/**********************
 * Simple MQTT client *
 **********************/

"use strict";

var mqtt_lib = require('mqtt');


/**
 * Defines a Simple MQTT client.
 *
 * @param {string} host - the hostname of the broker.
 * @param {string} [clientId]  - the unique name of this client. If no ID is provided a random one is generated
 */
var SimpleMQTTClient = function (host, clientId) {
    // Initializes the object that stores subscriptions
    this.subscriptions = {};
    // Initializes the object that holds the internal client
    this.client = {};
    // Handles the optional clientId parameter
    if (arguments.length === 1 || clientId === undefined) {
        clientId = generateRandomClientId();
    }
    // Connect
    this.client = connectNode(this.subscriptions, host, clientId);
};

//
// Helper function that generates a random client ID
//
function generateRandomClientId() {
    var length = 22;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
};

//
// Helper function that connects the MQTT client in node
//
function connectNode (subscriptions, host, clientId) {
    // Create client
    var url = "tcp://" + host + ":1883";
    var client = mqtt_lib.connect(url, {clientId : clientId});
    // Register incoming message callback
    client.on('message', function(channel, message) {
        // Execute all the appropriate callbacks:
        // the ones specific to this channel with a single parameter (message)
        // the ones associated to a wildcard channel, with two parameters (message and channel)
        var cbs = findCallbacks(subscriptions, channel);
        if (cbs!==undefined) {
            cbs.forEach(function(cb) {
                if (Object.keys(subscriptions).indexOf(channel)!==-1) {
                    cb(message.toString());
                } else {
                    cb(message.toString(), channel);
                }
            });
        }
    });
    return client;
}



/**
 * Disconnects from the MQTT client.
 */
SimpleMQTTClient.prototype.disconnect = function () {
    this.client.end();
    this.subscriptions = {};
};



/**
 * Subscribes to a channel and registers a callback.
 *
 * @param {string} channel  - the channel we are subscribing to.
 * @param {callback} callback - A function that is executed every time a message is received on that channel.
 * @param {callback} [done_callback] - A function that is executed once the subscribe operation has completed successfully.
 */
SimpleMQTTClient.prototype.subscribe = function (channel, callback, done_callback) {
    subscribeNode(this.client, this.subscriptions, channel, callback, done_callback);
};


//
// Helper function that subscribes to a channel in node
//
function subscribeNode (client, subscriptions, channel, callback, done_callback) {
    if (subscriptions[channel]===undefined) {
        subscriptions[channel] = [callback];
        client.subscribe(channel, {qos: 0}, function() {
            // If there is a done_callback defined, execute it
            if (done_callback!==undefined) done_callback();
        });
    } else {
        subscriptions[channel].push(callback);
    }
}


/**
 * Unsubscribe from a channel.
 *
 * @param {string} channel  - the channel we are unsubscribing from.
 * @param {function} callback  - the callback we are trying to unregister
 * @param {callback} [done_callback] - A function that is executed once the unsubscribe operation has completed successfully.
 */
SimpleMQTTClient.prototype.unsubscribe = function (channel, callback, done_callback) {
    unsubscribeNode(this.client, this.subscriptions, channel, callback, done_callback);
};


//
// Helper function that unsubscribes from a channel in node
//
var unsubscribeNode = function(client, subscriptions, channel, callback, done_callback) {
    if (subscriptions[channel]===undefined)
        return;
    subscriptions[channel].splice(subscriptions[channel].indexOf(callback), 1);
    if (subscriptions[channel].length===0) {
        delete subscriptions[channel];
        client.unsubscribe(channel, function() {
            // If there is a done_callback defined, execute it
            if (done_callback!==undefined) done_callback();
        });
    }
};



/**
 * Lists all the channels we are currently subscribed to.
 *
 * @returns {Array} a lists of all the channels we are currently subscribed to.
 */
SimpleMQTTClient.prototype.getSubscriptions = function () {
    return Object.keys(this.subscriptions);
};


/**
 * Publishes a message to a channel.
 *
 * @param {string} channel  - the channel we are publishing to.
 * @param {string} message - the message we are publishing.
 */
SimpleMQTTClient.prototype.publish = function (channel, message) {
    publishNode(this.client, channel, message)
};


//
// Helper function that publishes to a channel in node
//
var publishNode = function (client, channel, message) {
    client.publish(channel, message);
};


/**
 * Returns the client host
 *
 * @return {String}
 */
SimpleMQTTClient.prototype.getHost = function() {
    return this.client.options.hostname;
}



SimpleMQTTClient.prototype.isChannelWildcard = function(channel) {
    return channel.indexOf('#')>-1 || channel.indexOf('+')>-1 ;
}







//
// Helper functions
//



//
// Helper function that selects the right callback when a message is received
//
function findCallbacks (subscriptions, channel) {
    // First try to see if a callback for the exact channel exists
    if(Object.keys(subscriptions).indexOf(channel)!==-1)
        return subscriptions[channel];
    // If it doesn't then let's try to see if the channel matches a wildcard callback
    var pattern = matchesWildcard(subscriptions, channel);
    if (pattern!== undefined) {
        return subscriptions[pattern];
    }
    // If there's no exact match or wildcard we have to return undefined
    return undefined;
};


//
// Helper function that tries to match a channel with each subscription
// it returns undefined if no match is found
//
function matchesWildcard (subscriptions, channel) {
    var i;
    var subs = Object.keys(subscriptions);
    for (i=0; i < subs.length; i++) {
        if (matchesFilter(subs[i], channel)) {
            return subs[i];
        }
    }
    return undefined;
};


//
// Helper function that checks a certain channel and see if it matches a wildcard pattern
// Returns true if the channel matches a pattern (including the exact pattern)
//
function matchesFilter (pattern, channel) {
    // If multi-level wildcard is the only character in pattern, then any string will match
    if (pattern==="#") {
        return true;
    }
    // Handle all other multi-level wildcards
    // FROM SPEC: The number sign (‘#’ U+0023) is a wildcard character that matches any number of levels within a topic. The multi-level wildcard represents the parent and any number of child levels. The multi-level wildcard character MUST be specified either on its own or following a topic level separator. In either case it MUST be the last character specified in the Topic Filter
    var p_wo_wildcard = pattern.substring(0, pattern.length-2);
    var str_wo_details = channel.substring(0, pattern.length-2);
    if (pattern.slice(-1)=='#' && p_wo_wildcard==str_wo_details) {
        return true;
    }
    // TODO Handle single-level wildcards (+)
    // FROM SPEC: The single-level wildcard can be used at any level in the Topic Filter, including first and last levels. Where it is used it MUST occupy an entire level of the filter [MQTT-4.7.1-3]. It can be used at more than one level in the Topic Filter and can be used in conjunction with the multilevel wildcard.
    // http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718107
    return false;
};





//
// Exports SimpleMQTTClient class for other modules
//
module.exports = SimpleMQTTClient;




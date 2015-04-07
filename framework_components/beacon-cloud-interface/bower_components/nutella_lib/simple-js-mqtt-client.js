/**********************
 * Simple MQTT client *
 **********************/

(function() {
	"use strict";

	// Establish the root object, `window` in the browser, or `exports` on the server.
	var root = this;

	// Save the previous value of the `MQTT` variable to use with noConflict().
	var previous_mqtt = root.MQTT;

    // Internal reference to this library (used below)
    var mqtt = {};

	// Detect if we are in the browser or in node and
    // load the appropriate dependencies
    var isNode;
    var mqtt_lib;
	if (typeof window === 'undefined') {
		isNode = true;		// Node
		mqtt_lib = require('mqtt');
        if( typeof mqtt_lib === 'undefined' )
            throw new Error('This MQTT client requires the mqtt library (https://www.npmjs.com/package/mqtt)');
	} else {
		isNode = false;		// Browser
		mqtt_lib = root.Paho.MQTT;
		if( typeof mqtt_lib === 'undefined' )
            throw new Error('This MQTT client requires the mqtt-ws library (https://github.com/M2MConnections/mqtt-ws) a wrapper of Paho.js');

	}



	/**
	 * Runs simple-js-mqtt-client in noConflict mode by
	 * returning the MQTT variable to its previous owner.
     *
	 * @return  a reference to the MQTT object defined by this library.
	 */
	mqtt.noConflict = function() {
		root.MQTT = previous_mqtt;
	  return mqtt;
	};



	/**
	 * Creates a new instance of SimpleMQTTClient
	 * and connects it to an MQTT.
     * This is a factory method.
	 *
	 * @param {string} host - the hostname of the broker.
	 * @param {string} [clientId]  - the unique name of this client. If no ID is provided a random one is generated
	 */
	mqtt.connect = function (host, clientId) {
		return new SimpleMQTTClient(host, clientId);
	};



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
        // Functions backlog
        this.backlog = [];

        // Handles the optional clientId parameter
        if (arguments.length === 1 || clientId === undefined) {
            clientId = generateRandomClientId();
        }

        // Connect
        if (isNode)
            this.client = connectNode(this.subscriptions, host, clientId);
        else
            this.client = connectBrowser(this.subscriptions, this.backlog, host, clientId);
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
			// Executes the appropriate channel callback
			var cbs = findCallbacks(subscriptions, channel);
			if (cbs!==undefined) {
					if (Object.keys(subscriptions).indexOf(channel)!==-1)
                        cbs.forEach(function(cb) {
                            cb(message);
                        });
                    else
                        cbs.forEach(function(cb) {
                            cb(message, channel);
                        });

			}
		});
        return client;
	}


	//
	// Helper function that connects the MQTT client in the browser
	//
	function connectBrowser (subscriptions, backlog, host, clientId) {
		// Create client
		var client = new mqtt_lib.Client(host, Number(1884), clientId);
		// Register callback for connection lost
		client.onConnectionLost = function() {
			// TODO try to reconnect
		};
		// Register callback for received message
		client.onMessageArrived = function (message) {
			// Executes the appropriate channel callback
			var cbs = findCallbacks(subscriptions, message.destinationName);
			if (cbs!==undefined) {
					if (Object.keys(subscriptions).indexOf(message.destinationName)!==-1)
                        cbs.forEach(function(cb) {
                            cb(message.payloadString);
                        });
                    else
                        cbs.forEach(function(cb) {
                            cb(message.payloadString, message.destinationName);
                        });
			}
		};
		// Connect
		client.connect({onSuccess: function() {
			// Execute the backlog of operations performed while the client wasn't connected
			backlog.forEach(function(e) {
				e.op.apply(this, e.params);
			});
		}});
		return client;
	}



    /**
     * Disconnects from the MQTT client.
     */
    SimpleMQTTClient.prototype.disconnect = function () {
        if (isNode)
            this.client.end();
        else
            this.client.disconnect();
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
		// Subscribe
		if( isNode )
			subscribeNode(this.client, this.subscriptions, channel, callback, done_callback);
		else
			subscribeBrowser(this.client, this.subscriptions, this.backlog, channel, callback, done_callback);
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


	//
	// Helper function that subscribes to a channel in the browser
	//
	function subscribeBrowser (client, subscriptions, backlog, channel, callback, done_callback) {
		if ( addToBacklog(client, backlog, subscribeBrowser, [client, subscriptions, backlog, channel, callback, done_callback]) ) return;
        if (subscriptions[channel]===undefined) {
            subscriptions[channel] = [callback];
            client.subscribe(channel, {qos: 0, onSuccess: function() {
                // If there is a done_callback defined, execute it
                if (done_callback!==undefined) done_callback();
            }});
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
		if( isNode )
			unsubscribeNode(this.client, this.subscriptions, channel, callback, done_callback);
		else
            unsubscribeBrowser(this.client, this.subscriptions, this.backlog, channel, callback, done_callback);
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


    //
	// Helper function that unsubscribes from a channel in the browser
    //
	var unsubscribeBrowser = function(client, subscriptions, backlog, channel, callback, done_callback) {
		if ( addToBacklog(client, backlog, unsubscribeBrowser, [client, subscriptions, backlog, channel, callback, done_callback]) ) return;
        if (subscriptions[channel]===undefined)
            return;
        subscriptions[channel].splice(subscriptions[channel].indexOf(callback), 1);
        if (subscriptions[channel].length===0) {
            delete subscriptions[channel];
            client.unsubscribe(channel, {onSuccess : function() {
                // If there is a done_callback defined, execute it
                if (done_callback!==undefined) done_callback();
            }});
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
        if (isNode)
            publishNode(this.client, channel, message)
        else
            publishBrowser(this.client, this.backlog, channel, message)
    };


	//
	// Helper function that publishes to a channel in node
	//
	var publishNode = function (client, channel, message) {
        client.publish(channel, message);
	};


	//
	// Helper function that publishes to a channel in the browser
	//
	var publishBrowser = function (client, backlog, channel, message) {
		if ( addToBacklog(client, backlog, publishBrowser, [client, backlog, channel, message]) ) return;
		message = new mqtt_lib.Message(message);
		message.destinationName = channel;
		client.send(message);
	};


    //
    // Helper functions
    //


    //
    // Helper function that generates a random client ID
    //
    function generateRandomClientId () {
        var length = 22;
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    };


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
    // Helper method that queues operations into the backlog.
    // This method is used to make `connect` "synchronous" by
    // queueing up operations on the client until it is connected.
    //
    // @param {string} method  - the method that needs to be added to the backlog
    // @param {Array} parameters - parameters to the method being added to the backlog
    // @returns {boolean} true if the method was successfully added, false otherwise
    //
    function addToBacklog (client, backlog, method, parameters) {
        if (!client.isConnected() ) {
            backlog.push({
                op : method,
                params : parameters
            });
            return true;
        }
        return false;
    };




    //
	// End of methods definition for SimpleMQTTClient
    //


 	// Exports mqtt object
	// For node.js, also with backwards-compatibility for the old `require()` API.
	// If we're in the browser, add `MQTT` as a global object.
 	if (typeof exports !== 'undefined') {
 		if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = mqtt;
 		}
 		exports.MQTT = mqtt;
 	} else {
 		root.MQTT = mqtt;
 	}



}.call(this));

/******************
 * nutella_lib.js *
 ******************/

(function() {
    "use strict";

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `nutella` variable for noConflict().
    var previousNutella = root.NUTELLA;

    // Internal reference to this library (used below)
    var nutella = {};

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
     * Runs nutella.js in noConflict mode by
     * returning the NUTELLA variable to its previous owner.
     *
     * @return  a reference to the nutella object defined by this library.
     */
    nutella.noConflict = function() {
        root.NUTELLA = previousNutella;
        return nutella;
    };



    /**
     * Parses URL parameters.
     * Note: this function is not defined if we are not in the browser.
     *
     * @return {Object} An object containing all the URL query parameters
     */
    if (!isNode) {
        nutella.parseURLParameters = function () {
            var str = location.search;
            var queries = str.replace(/^\?/, '').split('&');
            var searchObject = {};
            for( var i = 0; i < queries.length; i++ ) {
                var split = queries[i].split('=');
                searchObject[split[0]] = split[1];
            }
            return searchObject;
        }
    }


    /**
     * Creates a new instance of nutella
     * and initialize it
     * This is a factory method.
     *
     *
     * @param {string} run_id - the run_id this component is launched in
     * @param {string} broker_hostname - the hostname of the broker.
     * @param {string} component_id - the name of this component
     */
    nutella.init = function(run_id, broker_hostname, component_id) {
        if (run_id===undefined || broker_hostname===undefined || component_id=== undefined) {
            console.warn("Couldn't initialize nutella. Make sure you are setting all three the required parameters (runId, broker_hostname, componentId'");
        }
        return new NutellaInstance(run_id, broker_hostname, component_id);
    };



    /**
     * Defines a nutella instance.
     *
     * @param {string} run_id - the run_id this component is launched in
     * @param {string} broker_hostname - the hostname of the broker.
     * @param {string} component_id - the name of this component
     */
    var NutellaInstance = function (run_id, broker_hostname, component_id) {

        this.mqtt_client = new SimpleMQTTClient(broker_hostname);
        this.runId = run_id;
        this.componentId = component_id;

        // Initialized the various sub-modules
        this.net = new NetSubModule(this);
        this.persist = new PersistSubModule(this);
        // ... other sub-modules here
    };



    /**
     * Sets the resource id for this instance of nutella
     *
     * @param {string} resource_id - the resource_id associated to this instance of nutella
     */
    NutellaInstance.prototype.setResourceId = function(resource_id){
        this.resourceId = resource_id;
    };




    //
    // END OF: main nutella protocol module
    //



    // --------------------------------------------------------------------------------------------
    // net sub-module
    // --------------------------------------------------------------------------------------------


    var NetSubModule = function(main_nutella) {
        // Store a reference to the main module
        this.main_nutella = main_nutella;

        // Store the subscriptions and the relative callbacks
        this.subscriptions = [];
        this.callbacks = [];
    };



    /**
     * Subscribes to a channel or filter.
     *
     * @param channel
     * @param callback
     * @param done_callback
     */
    NetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
        // Prevent multiple subscriptions to the same channel
        if (this.subscriptions.indexOf(channel)!==-1)
            throw new Error('You can`t subscribe twice to the same channel');
        // Pad the channel
        var runId = this.main_nutella.runId;
        var new_channel = runId + '/' + channel;
        // Define callbacks
        var mqtt_cb;
        if (isChannelWildcard(channel))
            mqtt_cb = function(mqtt_message, mqtt_channel) {
                // Ignore anything that is not JSON or
                // doesn't comply to the nutella protocol
                try {
                    var f = extractFieldsFromMessage(mqtt_message);
                    var clean_channel = mqtt_channel.replace(runId+'/', '');
                    if (f.type==='publish')
                        callback(f.payload, clean_channel, f.componentId, f.resourceId);
                } catch(err) {
                }
            };
        else
            mqtt_cb = function(mqtt_message) {
                // Ignore anything that is not JSON or
                // doesn't comply to the nutella protocol
                try {
                    var f = extractFieldsFromMessage(mqtt_message);
                    if (f.type==='publish')
                        callback(f.payload, f.componentId, f.resourceId);
                } catch(err) {
                }
            };
        // Update subscriptions, callbacks and subscribe
        this.subscriptions.push(channel);
        this.callbacks.push(mqtt_cb);
        this.main_nutella.mqtt_client.subscribe(new_channel, mqtt_cb, done_callback);
    };



    /**
     * Unsubscribes from a channel
     *
     * @param channel
     * @param done_callback
     */
    NetSubModule.prototype.unsubscribe = function(channel, done_callback) {
        // Find index of subscription and retrieve relative callback
        var idx = this.subscriptions.indexOf(channel);
        var cbAtIdx = this.callbacks[idx];
        // Pad the channel
        var new_channel = this.main_nutella.runId + '/' + channel;
        // Unsubscribe
        this.subscriptions.splice(idx, 1);
        this.callbacks.splice(idx, 1);
        this.main_nutella.mqtt_client.unsubscribe(new_channel, cbAtIdx, done_callback);
    };



    /**
     * Publishes a message to a channel
     *
     * @param channel
     * @param message
     */
    NetSubModule.prototype.publish = function(channel, message) {
        // Pad the channel
        var new_channel = this.main_nutella.runId + '/' + channel;
        var m = prepareMessageForPublish(message, this.main_nutella.componentId, this.main_nutella.resourceId);
        this.main_nutella.mqtt_client.publish(new_channel, m);
    };



    /**
     * Sends a request.
     *
     * @param channel
     * @param message
     * @param callback
     * @param done_callback
     */
    NetSubModule.prototype.request = function(channel, message, callback, done_callback) {
        // Handle optional message parameter
        if (typeof message==='function') {
            if (callback!==undefined)
                done_callback = callback;
            callback = message;
            message = undefined;
        }
        // Pad channel
        var new_channel = this.main_nutella.runId + '/' + channel;
        // Prepare request
        var request_id = Math.floor((Math.random() * 100000) + 1).toString();
        var mqtt_request = prepareRequest(message, request_id, this.main_nutella.componentId, this.main_nutella.resourceId);
        // Prepare callback to handle response
        var mqtt_cb = function(mqtt_response) {
            // Ignore anything that is not JSON or
            // doesn't comply to the nutella protocol
            try {
                var f = extractFieldsFromMessage(mqtt_response);
                var response_id = extractIdFromMessage(mqtt_response);
                // Only handle responses that have proper id set
                if (f.type==='response' && response_id===request_id) {
                    // Execute callback
                    callback(f.payload);
                }
            } catch(err) {
            }
        };
        // Subscribe to response
        var mqtt_cli = this.main_nutella.mqtt_client;
        mqtt_cli.subscribe(new_channel, mqtt_cb, function() {
            // Once we are subscribed we publish the request
            mqtt_cli.publish(new_channel, mqtt_request);
            // Execute optional done callback
            if (done_callback!==undefined) done_callback();
        });
    };



    /**
     * Handles requests.
     *
     * @param channel
     * @param callback
     * @param done_callback
     */
    NetSubModule.prototype.handle_requests = function(channel, callback, done_callback) {
        // Pad the channel
        var new_channel = this.main_nutella.runId + '/' + channel;
        // Prepare callback
        var c_id = this.main_nutella.componentId;
        var r_id = this.main_nutella.resourceId;
        var mqtt_cli = this.main_nutella.mqtt_client;
        var mqtt_cb = function(mqtt_request) {
            // Ignore anything that is not JSON or
            // doesn't comply to the nutella protocol
            try {
                var f = extractFieldsFromMessage(mqtt_request);
                var id = extractIdFromMessage(mqtt_request);
            } catch(err) {
                return;
            }
            // Only handle requests that have proper id set
            if (f.type!=='request' || id===undefined) return;
            // Execute callback, assemble the response and publish
            var res_json = callback(f.payload, f.componentId, f.resourceId);
            var mqtt_response = prepareResponse(res_json, id, c_id, r_id);
            mqtt_cli.publish(new_channel, mqtt_response);
        };
        // Subscribe
        this.main_nutella.mqtt_client.subscribe(new_channel, mqtt_cb, done_callback);
    };



    //
    // Helper function
    // Extracts nutella parameters from a received message
    //
    function extractFieldsFromMessage(message) {
        var params = JSON.parse(message);
        var s = params.from.split('/');
        delete params.from;
        params.componentId = s[0];
        if (s.length===2)
            params.resourceId  = s[1];
        return params;
    }



    //
    // Helper function
    // Extracts request id from a received message
    //
    function extractIdFromMessage(message) {
        var params = JSON.parse(message);
        return params.id;
    }



    //
    // Helper function
    // Pads a message with the nutella protocol fields
    //
    function prepareMessageForPublish(message, componentId, resourceId) {
        var from = resourceId===undefined ? componentId : (componentId + '/' + resourceId);
        if (message===undefined)
            return JSON.stringify({type: 'publish', from: from});
        return JSON.stringify({type: 'publish', from: from, payload: message});
    }



    //
    // Helper function
    // Pads a request with the nutella protocol fields
    //
    function prepareRequest(message, request_id, componentId, resourceId) {
        var from = resourceId===undefined ? componentId : (componentId + '/' + resourceId);
        if (message===undefined)
            return JSON.stringify({id: request_id, type: 'request', from: from});
        return JSON.stringify({id: request_id, type: 'request', from: from, payload: message});
    }



    //
    // Helper function
    // Pads a response with the nutella protocol fields
    //
    function prepareResponse(message, request_id, componentId, resourceId) {
        var from = resourceId===undefined ? componentId : (componentId + '/' + resourceId);
        if (message===undefined)
            return JSON.stringify({id: request_id, type: 'response', from: from});
        return JSON.stringify({id: request_id, type: 'response', from: from, payload: message});
    }



    // Helper function to test if a channel is wildcard or not.
    // Returns true if it is Returns true is.
    // See MQTT specification for wildcard channels
    // {http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718106 here
    //
    function isChannelWildcard(channel) {
        return channel.indexOf('#')!==-1 || channel.indexOf('+')!==-1;
    }


    //
    // END OF: net sub-module
    //



    // --------------------------------------------------------------------------------------------
    // persist sub-module
    // --------------------------------------------------------------------------------------------


    var PersistSubModule = function(main_nutella) {
        // Store a reference to the main module
        this.main_nutella = main_nutella;
    };



    PersistSubModule.prototype.persist = function () {
        console.log("This is just a test method for the persist sub-module");
    };




    //
    // END OF: persist sub-module
    //




    // --------------------------------------------------------------------------------------------
    // Simple MQTT client
    // --------------------------------------------------------------------------------------------


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
            // If there is a done_callback defined, execute it
            if (done_callback!==undefined) done_callback();
        }
    }



    /**
     * Unsubscribe from a channel.
     *
     * @param {string} channel  - the channel we are un-subscribing from.
     * @param {function} callback  - the callback we are trying to de-register
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
            publishNode(this.client, channel, message);
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
    // Helper functions for Simple MQTT client
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


    // Export the nutella object
    // For node.js, also with backwards-compatibility for the old `require()` API.
    // If we're in the browser, add `NUTELLA` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = nutella;
        }
        exports.NUTELLA = nutella;
    } else {
        root.NUTELLA = nutella;
    }



}.call(this));
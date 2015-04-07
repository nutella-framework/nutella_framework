/**
 * Framework-level Networking APIs for nutella
 */


var AbstractNet = require('./util/net');


/**
 * Framework-level network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var FRNetSubModule = function(main_nutella) {
    this.net = new AbstractNet(main_nutella);
};



/**
 * Subscribes to a channel or filter.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
    this.net.subscribe_to(channel, callback, undefined, undefined, done_callback);
};


/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, undefined, undefined, done_callback);
};


/**
 * Publishes a message to a channel
 *
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish = function(channel, message) {
    this.net.publish_to(channel, message, undefined, undefined);
};


/**
 * Sends a request.
 *
 * @param channel
 * @param message
 * @param callback
 */
FRNetSubModule.prototype.request = function(channel, message, callback) {
    this.net.request_to(channel, message, callback, undefined, undefined);
};


/**
 * Handles requests.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests = function(channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, undefined, undefined, done_callback);
};



//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the run-level to a specific run
//----------------------------------------------------------------------------------------------------------------

/**
 * Allows framework-level APIs to subscribe to a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_run = function(app_id, run_id, channel, callback,done_callback) {
    this.net.subscribe_to(channel,callback,app_id,run_id,done_callback)
};


/**
 * Allows framework-level APIs to unsubscribe from a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_to_run = function( app_id, run_id, channel, done_callback ) {
    this.net.unsubscribe_from(channel, app_id, run_id, done_callback);
};


/**
 * Allows framework-level APIs to publish to a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_run = function( app_id, run_id, channel, message ) {
    this.net.publish_to(channel, message, app_id, run_id);
};


/**
 * Allows framework-level APIs to make an asynchronous request to a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_run = function( app_id, run_id, channel, request, callback) {
    this.net.request_to(channel, request, callback, app_id, run_id);
};


/**
 * Allows framework-level APIs to handle requests on a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param callback
 */
FRNetSubModule.prototype.handle_requests_on_run = function( app_id, run_id, channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, app_id, run_id, done_callback)
};



//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the run-level (broadcast)
//----------------------------------------------------------------------------------------------------------------


/**
 * Callback for subscribing to all runs
 * @callback allRunsCb
 # @param {string} message - the received message. Messages that are not JSON are discarded
 # @param {String} app_id - the app_id of the channel the message was sent on
 # @param {String} run_id - the run_id of the channel the message was sent on
 # @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Allows framework-level APIs to subscribe to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param {allRunsCb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_all_runs = function( channel, callback, done_callback ) {
    //Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', '+');
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var f1 = extractRunIdAndAppId(mqtt_channel);
            if(f.type==='publish')
                callback(f.payload, f1.appId, f1.runId, f.from);
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    // Add to subscriptions, save mqtt callback and subscribe
    this.net.subscriptions.push(padded_channel);
    this.net.callbacks.push(mqtt_cb);
    this.net.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, undefined, undefined);
};


/**
 * Allows framework-level APIs to unsubscribe from a run-level channel *for ALL runs*
 *
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_from_all_runs = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, '+', '+', done_callback);
};


/**
 * Allows framework-level APIs to publish a message to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_all_runs = function( channel, message ) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.nutella.runs_list[app_id].runs.forEach(function(run_id){
            this.net.publish_to(channel, message, app_id, run_id);
        }.bind(this));
    }.bind(this));
};


/**
 * Allows framework-level APIs to send a request to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_all_runs = function(channel, request, callback) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.nutella.runs_list[app_id].runs.forEach(function(run_id){
            this.net.publish_to(channel, message, app_id, run_id);
            this.net.request_to(channel, request, callback, app_id, run_id);
        }.bind(this));
    }.bind(this));
};

/**
 * Callback that is used to handle messages from all runs
 * @callback handle_all_runs_cb
 * @param {string} payload - the received message (request). Messages that are not JSON are discarded
 * @param {string} app_id - the app_id of the channel the request was sent on
 * @param {string} run_id - the run_id of the channel the request was sent on
 * @param {Object} from - the sender's identifiers (from containing, run_id, app_id, component_id and optionally resource_id)
 * @return {Object} the response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Allows framework-level APIs to handle requests to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param {handle_all_runs_cb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests_on_all_runs = function(channel, callback, done_callback) {
    // Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', '+');
    var ln = this.net;
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var f1 = extractRunIdAndAppId(mqtt_channel);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = ln.prepare_message_for_response(callback(f.payload, f1.appId, f1.runId, f.from), f.id);
            ln.nutella.mqtt_client.publish( padded_channel, m );
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    this.net.nutella.mqtt_client.subscribe( padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, undefined, undefined);
};



//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the application-level
//----------------------------------------------------------------------------------------------------------------


/**
 * Allows framework-level APIs to subscribe to an app-level channel
 *
 * @param app_id
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_app = function(app_id, channel, callback, done_callback) {
    this.net.subscribe_to(channel,callback,app_id, undefined, done_callback)
};


/**
 * Allows framework-level APIs to unsubscribe from an app-level channel within a specific run
 *
 * @param app_id
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_to_app = function( app_id, channel, done_callback) {
    this.net.unsubscribe_from(channel,app_id,undefined, done_callback);
};


/**
 * Allows framework-level APIs to publish to an app-level channel
 *
 * @param app_id
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_app = function(app_id, channel, message) {
    this.net.publish_to(channel,message,app_id,undefined);
};


/**
 * Allows framework-level APIs to make an asynchronous request to a run-level channel within a specific run
 *
 * @param app_id
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_app = function( app_id, channel, request, callback) {
  this.net.request_to(channel, request, callback, app_id, undefined);
};


/**
 * Allows framework-level APIs to handle requests on a run-level channel within a specific run
 *
 * @param app_id
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests_on_app = function(app_id, channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, app_id, undefined, done_callback);
};


//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the application-level (broadcast)
//----------------------------------------------------------------------------------------------------------------

/**
 * Callback used to handle all messages received when subscribing to all applications
 * @callback subscribeToAllAppsCb
 * @param {string} message - the received message. Messages that are not JSON are discarded
 * @param {string} app_id - the app_id of the channel the message was sent on
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Allows framework-level APIs to subscribe to an app-level channel *for ALL apps*
 *
 * @param channel
 * @param {subscribeToAllAppsCb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_all_apps = function(channel, callback, done_callback) {
    //Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', undefined);
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var app_id = extractAppId(mqtt_channel);
            if(f.type==='publish')
                callback(f.payload, app_id, f.from);
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    // Add to subscriptions, save mqtt callback and subscribe
    this.net.subscriptions.push(padded_channel);
    this.net.callbacks.push(mqtt_cb);
    this.net.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, undefined, undefined);
};


/**
 * Allows framework-level APIs to unsubscribe from an app-level channel *for ALL apps*
 *
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_from_all_apps = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, '+', undefined, done_callback);
};


/**
 * Allows framework-level APIs to publish a message to an app-level channel *for ALL apps*
 *
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_all_apps = function(channel, message) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.publish_to(channel, message, app_id, undefined);
    }.bind(this));
};


/**
 * Allows framework-level APIs to send a request to an app-level channel *for ALL apps*
 *
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_all_apps = function(channel, request, callback) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.request_to(channel, request, callback, app_id, undefined);
    }.bind(this));
};


/**
 * This callback is used to handle messages coming from all applications
 * @callback handleAllAppsCb
 * @param {string} request - the received message (request). Messages that are not JSON are discarded.
 * @param {string} app_id - the app_id of the channel the request was sent on
 * @param {Object} from - the sender's identifiers (from containing, run_id, app_id, component_id and optionally resource_id)
 * @return {Object} The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Allows framework-level APIs to handle requests to app-level channel *for ALL runs*
 *
 * @param channel
 * @param {handleAllAppsCb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests_on_all_apps = function(channel, callback, done_callback) {
    // Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', undefined);
    var ln = this.net;
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var f1 = extractRunIdAndAppId(mqtt_channel);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = ln.prepare_message_for_response(callback(f.payload, f1.appId, f1.runId, f.from), f.id);
            ln.nutella.mqtt_client.publish( padded_channel, m );
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    this.net.nutella.mqtt_client.subscribe( padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, undefined, undefined);
};


// Utility functions


function extractRunIdAndAppId(mqtt_channel) {
    var sp =  mqtt_channel.replace('/nutella/apps/', '').split('/');
    return {appId: sp[0], runId: sp[2]};
}

function extractAppId(mqtt_channel) {
    var sp =  mqtt_channel.replace('/nutella/apps/', '').split('/');
    return sp[0];
}




module.exports = FRNetSubModule;

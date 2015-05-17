/**
 * App-level Networking APIs for nutella
 */


var AbstractNet = require('./util/net');


/**
 * App-level network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var AppNetSubModule = function(main_nutella) {
    this.net = new AbstractNet(main_nutella);
};



/**
 * Subscribes to a channel or filter.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
    this.net.subscribe_to(channel, callback, this.net.nutella.appId, undefined, done_callback);
};



/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
AppNetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, this.net.nutella.appId, undefined, done_callback);
};



/**
 * Publishes a message to a channel
 *
 * @param channel
 * @param message
 */
AppNetSubModule.prototype.publish = function(channel, message) {
    this.net.publish_to(channel, message, this.net.nutella.appId, undefined);
};



/**
 * Sends a request.
 *
 * @param channel
 * @param message
 * @param callback
 */
AppNetSubModule.prototype.request = function(channel, message, callback) {
    this.net.request_to(channel, message, callback, this.net.nutella.appId, undefined);
};



/**
 * Handles requests.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.handle_requests = function (channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, this.net.nutella.appId, undefined, done_callback);
};



//----------------------------------------------------------------------------------------------------------------
// Application-level APIs to communicate at the run-level
//----------------------------------------------------------------------------------------------------------------

/**
 * Allows application-level APIs to subscribe to a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.subscribe_to_run = function(run_id, channel, callback, done_callback) {
    this.net.subscribe_to(channel,callback,this.net.nutella.appId,run_id,done_callback);
};


/**
 * Allows application-level APIs to unsubscribe from a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param done_callback
 */
AppNetSubModule.prototype.unsubscribe_from_run = function(run_id, channel, done_callback) {
    this.net.unsubscribe_from(channel,this.net.nutella.appId,run_id,done_callback);
};


/**
 * Allows application-level APIs to publish to a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param message
 */
AppNetSubModule.prototype.publish_to_run = function( run_id, channel, message ) {
    this.net.publish_to(channel,message,this.net.nutella.appId, run_id);
};


/**
 * Allows application-level APIs to make a request to a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param request
 * @param callback
 */
AppNetSubModule.prototype.request_to_run = function( run_id, channel, request, callback) {
    this.net.request_to(channel,request,callback,this.net.nutella.appId,run_id);
};


/**
 * Allows application-level APIs to handle requests on a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.handle_requests_on_run = function( run_id, channel, callback, done_callback ) {
    this.net.handle_requests_on(channel,callback,this.net.nutella.appId,run_id,done_callback);
};


//----------------------------------------------------------------------------------------------------------------
// Application-level APIs to communicate at the run-level (broadcast)
//----------------------------------------------------------------------------------------------------------------

/**
 * Fired whenever a message is received on the specified channel for any of the runs in the application
 *
 * @callback all_runs_cb
 * @param {string} message - the received message. Messages that are not JSON are discarded.
 * @param {string} run_id - the run_id of the channel the message was sent on
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Allows application-level APIs to subscribe to a run-level channel *for ALL runs*
 *
 * @param {string} channel - the run-level channel we are subscribing to. Can be wildcard
 * @param {all_runs_cb} callback - the callback that is fired whenever a message is received on the channel
 */
AppNetSubModule.prototype.subscribe_to_all_runs = function(channel, callback, done_callback) {
    var app_id = this.net.nutella.appId;
    //Pad channel
    var padded_channel = this.net.pad_channel(channel, app_id, '+');
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var run_id = extractRunId(app_id, mqtt_channel);
            if(f.type==='publish')
                callback(f.payload, run_id, f.from);
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
    this.net.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, this.net.nutella.appId, undefined);
};


/**
 * Allows application-level APIs to publish a message to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param message
 */
AppNetSubModule.prototype.publish_to_all_runs = function(channel, message) {
  this.net.nutella.runs_list.forEach(function(run_id){
      this.net.publish_to(channel,message,this.net.nutella.appId,run_id);
  }.bind(this));
};


/**
 * Allows application-level APIs to send a request to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param request
 * @param callback
 */
AppNetSubModule.prototype.request_to_all_runs = function(channel, request, callback) {
    this.net.nutella.runs_list.forEach(function(run_id){
        this.net.request_to(channel,request,callback,this.net.nutella.appId,run_id);
    }.bind(this));
};


/**
 * This callback is used to handle all runs
 * @callback handle_all_run
 * @param {string} message - the received message. Messages that are not JSON are discarded.
 * @param {string} run_id - the run_id of the channel the message was sent on
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 * @return {Object} the response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Allows application-level APIs to handle requests to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.handle_requests_on_all_runs = function(channel, callback, done_callback) {
    var app_id = this.net.nutella.appId;
    // Pad channel
    var padded_channel = this.net.pad_channel(channel, app_id, '+');
    var ln = this.net;
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var run_id = extractRunId(app_id, mqtt_channel);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = ln.prepare_message_for_response(callback(f.payload, run_id, f.from), f.id);
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
    this.net.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, this.net.nutella.appId, undefined);
};



// Utility function

function extractRunId(app_id, mqtt_channel) {
    var pc = '/nutella/apps/' + app_id + '/runs/';
    var sp =  mqtt_channel.replace(pc, '').split('/');
    return sp[0];
}


module.exports = AppNetSubModule;

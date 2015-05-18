/**
 * Run-level Network APIs for nutella
 */


var AbstractNet = require('./util/net');
var BinNet = require('./run_net_bin');


/**
 * Run-level network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var NetSubModule = function(main_nutella) {
    // Store a reference to the main module
    this.nutella = main_nutella;
    this.net = new AbstractNet(main_nutella);
    // Binary net sub module
    this.bin = new BinNet(main_nutella, this);
};



/**
 * Subscribes to a channel or filter.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
NetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
    this.net.subscribe_to(channel, callback, this.nutella.appId, this.nutella.runId, done_callback);
};



/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
NetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, this.nutella.appId, this.nutella.runId, done_callback);
};



/**
 * Publishes a message to a channel
 *
 * @param channel
 * @param message
 */
NetSubModule.prototype.publish = function(channel, message) {
    this.net.publish_to(channel, message, this.nutella.appId, this.nutella.runId);
};



/**
 * Sends a request.
 *
 * @param channel
 * @param message
 * @param callback
 */
NetSubModule.prototype.request = function(channel, message, callback) {
    this.net.request_to(channel, message, callback, this.nutella.appId, this.nutella.runId);
};



/**
 * Handles requests.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
NetSubModule.prototype.handle_requests = function(channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, this.nutella.appId, this.nutella.runId, done_callback);
};


module.exports = NetSubModule;

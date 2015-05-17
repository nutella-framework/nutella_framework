/**
 * Run-level and App-level Nutella instances for node
 */

var SimpleMQTTClient = require('simple-mqtt-client');

// Require various sub-modules
var AppSubModule = require('./app_core');
var NetSubModule = require('./run_net');
var LogSubModule = require('./run_log');
var PersistSubModule = require('./run_persist');


/**
 * Defines the RunNutellaInstance class.
 *
 * @param {String } app_id - the app_id this component belongs to
 * @param {string} run_id - the run_id this component is launched in
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var RunNutellaInstance = function (broker_hostname, app_id, run_id, component_id) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname);
    this.appId = app_id;
    this.runId = run_id;
    this.componentId = component_id;
    // Initialized the various sub-modules
    this.net = new NetSubModule(this);
    this.log = new LogSubModule(this);
    this.persist = new PersistSubModule(this);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
RunNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};



/**
 * Defines the AppNutellaInstance class.
 *
 * @param {String } app_id - the app_id this component belongs to
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var AppNutellaInstance = function (broker_hostname, app_id, component_id) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname);
    this.appId = app_id;
    this.componentId = component_id;
    // Initialized the various sub-modules
    this.app = new AppSubModule(this);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
AppNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};


module.exports = {
    RunNutellaInstance : RunNutellaInstance,
    AppNutellaInstance : AppNutellaInstance
};
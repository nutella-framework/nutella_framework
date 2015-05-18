/**
 * Run-level and App-level Nutella instances for the browser
 */

var SimpleMQTTClient = require('./simple-mqtt-client/client-browser');

// Require various sub-modules
var AppSubModule = require('./app_core_browser');
var FrSubModule = require('./fr_core_browser');
var NetSubModule = require('./run_net');
var LogSubModule = require('./run_log');
var LocationSubModule = require('./run_location');


/**
 * Defines the RunNutellaInstance class.
 *
 * @param {String } app_id - the app_id this component belongs to
 * @param {string} run_id - the run_id this component is launched in
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var RunNutellaInstance = function (broker_hostname, app_id, run_id, component_id, done_cb) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname, done_cb);
    this.appId = app_id;
    this.runId = run_id;
    this.componentId = component_id;
    // Initialized the various sub-modules
    this.net = new NetSubModule(this);
    this.log = new LogSubModule(this);
    this.location = new LocationSubModule(this);
    // Start pinging
    setInterval(function(){
        this.net.publish('pings', 'ping');
    }.bind(this),5000);
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
var AppNutellaInstance = function (broker_hostname, app_id, component_id, done_cb) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname, done_cb);
    this.appId = app_id;
    this.componentId = component_id;
    // Initialized the various sub-modules
    this.app = new AppSubModule(this);
    //Initialize the runs list
    this.runs_list = [];
    // Fetch the runs list
    this.app.net.request('app_runs_list', undefined, function(response) {
        this.runs_list = response;
    }.bind(this));
    // Subscribe to runs list updates
    this.app.net.subscribe('app_runs_list', function(message, from) {
        this.runs_list = message;
    }.bind(this));
    // Start pinging
    setInterval(function(){
        this.app.net.publish('pings', 'ping');
    }.bind(this),5000);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
AppNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};


/**
 * Defines the FRNutellaInstance class.
 *
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var FrNutellaInstance = function (broker_hostname, component_id, done_cb) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname, done_cb);
    this.componentId = component_id;
    // Initialize the various sub-modules
    this.f = new FrSubModule(this);
    //Initialize the runs list
    this.runs_list = {};
    // Fetch the runs list
    this.f.net.request('runs_list', undefined, function(response) {
        this.runs_list = response;
    }.bind(this));
    // Subscribe to runs list updates
    this.f.net.subscribe('runs_list', function(message, from) {
        this.runs_list = message;
    }.bind(this));
    // Start pinging
    setInterval(function(){
        this.f.net.publish('pings', 'ping');
    }.bind(this),5000);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
FrNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};



module.exports = {
    RunNutellaInstance : RunNutellaInstance,
    AppNutellaInstance : AppNutellaInstance,
    FrNutellaInstance : FrNutellaInstance
};
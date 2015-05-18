/******************
 * nutella_lib.js *
 ******************/

"use strict";

/**
 * Entry point for nutella_lib in node
 */

var nutella_i = require('./nutella_i');
var nutella_version = require('./version');

// Internal reference to this library (used below)
var nutella = {};


// Version number
nutella.version = nutella_version.version;


/**
 * Creates a new instance of nutella
 * and initialize it. This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} app_id - the app_id this component belongs to
 * @param {string} run_id - the run_id this component is launched in
 * @param {string} component_id - the name of this component
 */
nutella.init = function(broker_hostname, app_id, run_id, component_id) {
    if (broker_hostname===undefined || app_id===undefined || run_id===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all four the required parameters (broker_hostname, app_id, run_id, component_id)");
    }
    return new nutella_i.RunNutellaInstance(broker_hostname, app_id, run_id, component_id);
};


/**
 * Creates a new instance of nutella
 * and initialize it for an app-level component.
 * This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} app_id - the app_id this component belongs to
 * @param {string} run_id - the run_id this component is launched in
 * @param {string} component_id - the name of this component
 */
nutella.initApp = function(broker_hostname, app_id, component_id) {
    if (broker_hostname===undefined || app_id===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all three the required parameters (broker_hostname, app_id, run_id, component_id)");
    }
    return new nutella_i.AppNutellaInstance(broker_hostname, app_id, component_id);
};


/**
 * Utility method that parses CLI parameters for run level bots.
 *
 * @return {Object} An object containing all the CLI parameters: broker, app_id, run_id
 */
nutella.parseArgs = function() {
    if (process.argv.length<5) {
        console.warn("Couldn't read broker address, app_id and run_id from the command line, you might have troubles initializing nutella");
        return;
    }
    var t = {};
    t.broker = process.argv[2];
    t.app_id = process.argv[3];
    t.run_id = process.argv[4];
    return t;
};


/**
 * Utility method that parses CLI parameters for application level bots
 *
 * @return {Object} An object containing all the CLI parameters: broker, app_id
 */
nutella.parseAppArgs = function() {
    if (process.argv.length<4) {
        console.warn("Couldn't read broker address and app_id from the command line, you might have troubles initializing nutella");
        return;
    }
    var t = {};
    t.broker = process.argv[2];
    t.app_id = process.argv[3];
    return t;
};


/**
 * Utility method that parses CLI parameters for framework level bots
 *
 * @return {Object} An object containing all the CLI parameters: config_file, runlist
 */
nutella.parseFrArgs = function() {
    if (process.argv.length<4) {
        console.warn("Couldn't read broker address and app_id from the command line, you might have troubles initializing nutella");
        return;
    }
    var t = {};
    t.config = process.argv[2];
    t.runlist = process.argv[3];
    return t;
};


/**
 * Utility method that parses the component ID from the command line.
 *
 * @return {String} the componentId of this component
 */
nutella.parseComponentId = function() {
    return process.cwd().split("/").pop();
};



// Exports nutella object
module.exports = nutella;
/******************
 * nutella_lib.js *
 ******************/

"use strict";

/**
 * Entry point for nutella_lib in the browser
 */

var nutella_i = require('./nutella_i_browser');
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
nutella.init = function(broker_hostname, app_id, run_id, component_id, done_cb) {
    if (broker_hostname===undefined || app_id===undefined || run_id===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all four required parameters (broker_hostname, app_id, run_id, component_id)");
    }
    return new nutella_i.RunNutellaInstance(broker_hostname, app_id, run_id, component_id, done_cb);
};


/**
 * Creates a new instance of nutella
 * and initialize it for an app-level component.
 * This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} app_id - the app_id this component belongs to
 * @param {string} component_id - the name of this component
 */
nutella.initApp = function(broker_hostname, app_id, component_id, done_cb) {
    if (broker_hostname===undefined || app_id===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all three required parameters (broker_hostname, app_id, component_id)");
    }
    return new nutella_i.AppNutellaInstance(broker_hostname, app_id, component_id, done_cb);
};


/**
 * Creates a new instance of nutella
 * and initialize it for a framework-level component.
 * This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} component_id - the name of this component
 */
nutella.initFramework = function(broker_hostname, component_id, done_cb) {
    if (broker_hostname===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all two required parameters (broker_hostname, component_id)");
    }
    return new nutella_i.FrNutellaInstance(broker_hostname, component_id, done_cb);
};



/**
 * Utility method that parses URL parameters from the URL.
 * It is obviously only available in the browser.
 *
 * @return {Object} An object containing all the URL query parameters
 */
nutella.parseURLParameters = function () {
    var str = location.search;
    var queries = str.replace(/^\?/, '').split('&');
    var searchObject = {};
    for( var i = 0; i < queries.length; i++ ) {
        var split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return searchObject;
};


/**
 * Utility method that parses the component ID from the URL.
 *
 * @return {String} the componentId of this component
 */
nutella.parseComponentId = function() {
    return location.pathname.split('/')[4];
};



// Exports nutella object
module.exports = nutella;
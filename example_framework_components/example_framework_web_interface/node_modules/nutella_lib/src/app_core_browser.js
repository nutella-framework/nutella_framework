/**
 * Application-level APIs for nutella, browser version
 */

// Require various sub-modules
var AppNetSubModule = require('./app_net');
var AppLogSubModule = require('./app_log');


var AppSubModule = function(main_nutella) {
    // Initialized the various sub-modules
    this.net = new AppNetSubModule(main_nutella);
    this.log = new AppLogSubModule(main_nutella);
};


module.exports = AppSubModule;
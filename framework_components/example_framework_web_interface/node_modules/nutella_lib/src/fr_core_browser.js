/**
 * Framework-level APIs for nutella, browser version
 */

// Require various sub-modules
var FrNetSubModule = require('./fr_net');
var FrLogSubModule = require('./fr_log');


var FrSubModule = function(main_nutella) {
    // Initialized the various sub-modules
    this.net = new FrNetSubModule(main_nutella);
    this.log = new FrLogSubModule(main_nutella);
};


module.exports = FrSubModule;
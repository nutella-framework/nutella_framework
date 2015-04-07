/**
 * Framework-level log APIs for nutella
 */

var FrNetSubModule = require('./app_net');

var FrLogSubModule = function(main_nutella) {
    this.net = new FrNetSubModule(main_nutella);
};



FrLogSubModule.prototype.debug = function(message, code) {
    console.debug(message);
    this.net.publish('logging', logToJson(message, code, 'debug'));
    return code;
};

FrLogSubModule.prototype.info = function(message, code) {
    console.info(message);
    this.net.publish('logging', logToJson(message, code, 'info'));
    return code;
};

FrLogSubModule.prototype.success = function(message, code) {
    console.log('%c '+ message , 'color: #009933');
    this.net.publish('logging', logToJson(message, code, 'success'));
    return code;
};

FrLogSubModule.prototype.warn = function(message, code) {
    console.warn(message);
    this.net.publish('logging', logToJson(message, code, 'warn'));
    return code;
};

FrLogSubModule.prototype.error = function(message, code) {
    console.error(message);
    this.net.publish('logging', logToJson(message, code, 'error'));
    return code;
};


function logToJson( message, code, level) {
    return (code === undefined) ? {level: level, message: message} : {level: level, message: message, code: code};
}



module.exports = FrLogSubModule;

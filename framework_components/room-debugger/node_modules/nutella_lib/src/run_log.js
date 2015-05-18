/**
 * Run-level Logging APIs for nutella
 */

var NetSubModule = require('./run_net');

var LogSubModule = function(main_nutella) {
    this.net = new NetSubModule(main_nutella);
};


LogSubModule.prototype.debug = function(message, code) {
    console.debug(message);
    this.net.publish('logging', logToJson(message, code, 'debug'));
    return code;
};

LogSubModule.prototype.info = function(message, code) {
    console.info(message);
    this.net.publish('logging', logToJson(message, code, 'info'));
    return code;
};

LogSubModule.prototype.success = function(message, code) {
    console.log('%c '+ message , 'color: #009933');
    this.net.publish('logging', logToJson(message, code, 'success'));
    return code;
};

LogSubModule.prototype.warn = function(message, code) {
    console.warn(message);
    this.net.publish('logging', logToJson(message, code, 'warn'));
    return code;
};

LogSubModule.prototype.error = function(message, code) {
    console.error(message);
    this.net.publish('logging', logToJson(message, code, 'error'));
    return code;
};


function logToJson( message, code, level) {
    return (code===undefined) ? {level: level, message: message} : {level: level, message: message, code: code};
}





module.exports = LogSubModule;
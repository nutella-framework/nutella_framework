/**
 * App-level log APIs for nutella
 */

var AppNetSubModule = require('./app_net');

var AppLogSubModule = function(main_nutella) {
    this.net = new AppNetSubModule(main_nutella);
};



AppLogSubModule.prototype.debug = function(message, code) {
    console.debug(message);
    this.net.publish('logging', logToJson(message, code, 'debug'));
    return code;
};

AppLogSubModule.prototype.info = function(message, code) {
    console.info(message);
    this.net.publish('logging', logToJson(message, code, 'info'));
    return code;
};

AppLogSubModule.prototype.success = function(message, code) {
    console.log('%c '+ message , 'color: #009933');
    this.net.publish('logging', logToJson(message, code, 'success'));
    return code;
};

AppLogSubModule.prototype.warn = function(message, code) {
    console.warn(message);
    this.net.publish('logging', logToJson(message, code, 'warn'));
    return code;
};

AppLogSubModule.prototype.error = function(message, code) {
    console.error(message);
    this.net.publish('logging', logToJson(message, code, 'error'));
    return code;
};


function logToJson( message, code, level) {
    return (code === undefined) ? {level: level, message: message} : {level: level, message: message, code: code};
}



module.exports = AppLogSubModule;

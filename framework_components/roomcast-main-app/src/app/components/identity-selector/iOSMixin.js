
var iOSMixin = {

    iOScall: function(actionType, actionParameters) {

        // JavaScript to send an action to iOS code
        var appName = 'roomcast';
        var jsonString = (JSON.stringify(actionParameters));
        var escapedJsonParameters = escape(jsonString);
        var url = appName + '://' + actionType + "#" + escapedJsonParameters;
        console.log('launching url: ', url);
        document.location.href = url;
        
    }


};

module.exports = iOSMixin;
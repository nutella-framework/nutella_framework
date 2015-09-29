
var iOSMixin = {

    iOScall: function(actionType, actionParameters) {

        // JavaScript to send an action to iOS code
        var appName = 'roomcast';
        var url;
        if(actionParameters) {
            var jsonString = (JSON.stringify(actionParameters));
            var escapedJsonParameters = escape(jsonString);
            url = appName + '://' + actionType + "#" + escapedJsonParameters;
        } else {
            url = appName + '://' + actionType;
        }
        document.location.href = url;
        console.log('launching url: ', url);
    }


};

module.exports = iOSMixin;
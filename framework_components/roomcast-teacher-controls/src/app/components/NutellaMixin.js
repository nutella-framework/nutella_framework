var NUTELLA = require('nutella_lib');

var NutellaMixin = {

    /**
     * Stores a user interaction as a document in the MongoDB database.
     * @param action name of the action fired
     * @param info additional properties to be stored for the specific interaction
     */
    logAction: function(action, info) {
        var query_parameters = NUTELLA.parseURLParameters();
        var app_id = query_parameters.app_id;
        var run_id = query_parameters.run_id;
        var cookie = this.getCookie('roomcast_device');
        if(cookie === '') {
            cookie = (+new Date * Math.random()).toString(36).substring(0, 15);
            this.setCookie('roomcast_device', cookie, 365);
        }
        var date = new Date();
        var doc = {};
        doc.action = action;
        doc.app_id = app_id;
        doc.run_id = run_id;
        doc.device_id = cookie;
        doc.time = {
            timestamp: date,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            time: date.getHours() + ":" +date.getMinutes() + ":" +date.getSeconds()
        };
        if(Object.keys(info).length !== 0) {
            doc.info = info;
        }
        nutella.net.publish('roomcast-log-bot/store', doc);
    },

    setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },

    getCookie: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }

};

module.exports = NutellaMixin;
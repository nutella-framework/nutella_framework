
var NutellaMixin = {

    /**
     * Stores a user interaction as a document in the MongoDB database.
     * @param action name of the action fired
     * @param app_id
     * @param run_id
     * @param info additional properties to be stored for the specific interaction
     */
    logAction: function(action, app_id, run_id, info) {
        var cookie = this.getCookie('roomcast_device');
        if(cookie === '') {
            cookie = (+new Date * Math.random()).toString(36).substring(0, 15);
            this.setCookie('roomcast_device', cookie, 365);
        }
        var doc = {};
        doc.action = action;
        doc.app_id = app_id;
        doc.run_id = run_id;
        doc.deviceId = cookie;
        doc.time = new Date();
        doc.info = info;
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
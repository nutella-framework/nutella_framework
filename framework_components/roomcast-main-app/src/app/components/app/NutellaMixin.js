
var NutellaMixin = {

    /**
     * Stores a user interaction as a document in the MongoDB database.
     * @param action name of the action fired
     * @param app_id
     * @param run_id
     * @param info additional properties to be stored
     */
    logAction: function(action, app_id, run_id, info) {
        var doc = {};
        doc.action = action;
        doc.app_id = app_id;
        doc.run_id = run_id;
        doc.time = new Date();
        doc.info = info;
        nutella.net.publish('roomcast-log-bot/store', doc);
        console.log('logging');
        nutella.net.subscribe('roomcast-log-bot/store', function(message, from) {
            console.log('listening on app', message);
        });
    }

};

module.exports = NutellaMixin;
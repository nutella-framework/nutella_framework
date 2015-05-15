var MessagesModel = function() {
    var self = {};

    // Protected variables
    self._data = undefined;
    self._from = undefined;
    self._to = undefined;
    self._app_id = undefined;
    self._run_id = undefined;
    self._type = undefined;


    // Public variables
    self.channel = undefined;

    self.constant = {
        type: {
            publish: "publish",
            request: "request"
        }
    };

    // Getter and setter
    self.__defineGetter__("data", function() {
        return self._data;
    });
    self.__defineSetter__("data", function(data) {
        self._data = data;
        notificationCenter.dispatch(Notifications.data.MESSAGE_DATA_CHANGE);
    });

    self.__defineGetter__("from", function() {
        return self._from;
    });
    self.__defineSetter__("from", function(from) {
        self._from = from;
        notificationCenter.dispatch(Notifications.data.MESSAGE_DATA_CHANGE);
    });

    self.__defineGetter__("to", function() {
        return self._to;
    });
    self.__defineSetter__("to", function(to) {
        self._to = to;
        notificationCenter.dispatch(Notifications.data.MESSAGE_DATA_CHANGE);
    });

    self.__defineGetter__("app_id", function() {
        return self._app_id;
    });
    self.__defineSetter__("app_id", function(app_id) {
        self._app_id = app_id;
        notificationCenter.dispatch(Notifications.data.MESSAGE_DATA_CHANGE);
    });

    self.__defineGetter__("run_id", function() {
        return self._run_id;
    });
    self.__defineSetter__("run_id", function(run_id) {
        self._run_id = run_id;
        notificationCenter.dispatch(Notifications.data.MESSAGE_DATA_CHANGE);
    });

    self.__defineGetter__("type", function() {
        return self._type;
    });
    self.__defineSetter__("type", function(type) {
        self._type = type;
        notificationCenter.dispatch(Notifications.data.MESSAGE_DATA_CHANGE);
    });

    // Destructor
    self.deinit = function() {
        // Place here the code for dealloc eventual objects
    };

    /*
    self.fetchData = function(url) {
        d3.json(url, function(error, data) {
            if (error)
                return console.warn(error);

            self.data = data;
        });
    };
    */

    self.downloadMessages = function() {
        console.log(self);

        var request = {
            application: messageModel.app_id,
            instance: messageModel.run_id,
            channel: messageModel.channel
        };

        console.log(request);

        nutella.net.request("monitoring/message", request, function(data) {
            console.log(data);
            self.data = data;
        });
    };

    // Constructor
    self.init = function() {
    }();

    return self;
};

var messageModel = MessagesModel();
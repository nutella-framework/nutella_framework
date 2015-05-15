var AlertsModel = function() {
    var self = {};

    // Protected variables
    self._application = undefined;
    self._instance = undefined;
    self._component = undefined;
    self._emails = undefined;

    // Getter and setter
    self.__defineGetter__("application", function() {
        return self._application;
    });
    self.__defineSetter__("application", function(application) {
        self._application = application;
        notificationCenter.dispatch(Notifications.alerts.ALERT_CHANGE);
    });

    self.__defineGetter__("instance", function() {
        return self._instance;
    });
    self.__defineSetter__("instance", function(instance) {
        self._instance = instance;
        notificationCenter.dispatch(Notifications.alerts.ALERT_CHANGE);
    });

    self.__defineGetter__("component", function() {
        return self._component;
    });
    self.__defineSetter__("component", function(component) {
        self._component = component;
        notificationCenter.dispatch(Notifications.alerts.ALERT_CHANGE);
    });

    self.__defineGetter__("emails", function() {
        return self._emails;
    });
    self.__defineSetter__("emails", function(emails) {
        self._emails = emails;
        notificationCenter.dispatch(Notifications.alerts.EMAILS_CHANGE);
    });

    // Destructor
    self.deinit = function() {
        // Place here the code for dealloc eventual objects
    };

    self.fetchData = function() {

        var request = {
            application: self.application
        };

        if(self.instance != undefined) {
            request.instance = self.instance;
        }

        if(self.component != undefined) {
            request.component = self.component;
        }

        nutella.net.request("monitoring/alert", request, function(data) {
            self.emails = data.emails;
        });
    };

    // Constructor
    self.init = function() {
    }();

    return self;
};

var alertsModel = AlertsModel();
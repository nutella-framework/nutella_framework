var ApplicationsModel = function() {
    var self = {};

    // Public variables
    self.data = undefined;
    self.viewControllerApplicationSelected = undefined;
    self.viewControllerInstanceSelected = undefined;

    self.getApplicationData = function(name) {
        var appData = self.data.applications.filter(function(d) {
            return d.name == name;
        });

        if(appData.length == 0) {
            return undefined;
        }

        return appData[0];
    };

    self.getInstanceData = function(appName, instanceName) {
        var appData = self.getApplicationData(appName);

        if(appData == undefined)
            return undefined;

        var instanceData = appData.instances.filter(function(instance) {
            return instance.name == instanceName;
        });

        if(instanceData.length == 0) {
            return undefined;
        }

        return instanceData[0];
    };

    // Destructor
    self.deinit = function() {
        // Place here the code for dealloc eventual objects
    };

    self.fetchData = function(url) {

        /*
         d3.json(url, function(error, data) {
         if (error)
         return console.warn(error);

         self.data = data;

         notificationCenter.dispatch(Notifications.data.APPLICATION_DATA_CHANGE);
         });
        */

        nutella.net.request("monitoring/application", {}, function(payload) {
            self.data = payload;

            notificationCenter.dispatch(Notifications.data.APPLICATION_DATA_CHANGE);
        });

        setInterval(function(){
            nutella.net.request("monitoring/application", {}, function(payload) {
                self.data = payload;

                notificationCenter.dispatch(Notifications.data.APPLICATION_DATA_CHANGE);
            });
        }, 2000);
    };

    // Constructor
    self.init = function() {
    }();

    return self;
};

var applicationModel = ApplicationsModel();
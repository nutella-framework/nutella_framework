var InstanceViewController = function(parentApplicationViewController, name, index, layer) {
    var self = ViewController(layer);

    // Public variables
    self.name = undefined;
    self.applicationName = undefined;
    self.parentApplicationViewController = undefined;
    self.tab = undefined;
    self._notification = undefined;

    var render = self.render;
    self.render = function() {

        // Position the graphical objects
        self.tab.x = - windowViewController.width / 2 +
            UITab.style.width / 2 +
            UIApplication.style.margin;

        self.tab.y = - windowViewController.height / 2 +
            UITab.style.height / 2 +
            UITab.style.height * index +
            UIApplication.style.margin +
            UIApplication.style.headerRectHeightExpanded;

        if(parentApplicationViewController == applicationModel.viewControllerApplicationSelected) {
            self.tab.show = true;
        }
        else {
            self.tab.show = false;
        }

        self._notification.x = - windowViewController.width / 2 +
            UITab.style.width +
            UIApplication.style.margin -
            UINotification.style.margin.x;


        self._notification.y = - windowViewController.height / 2 +
            UITab.style.height * index +
            UIApplication.style.margin +
            UIApplication.style.headerRectHeightExpanded +
            UINotification.style.margin.y;

        // Display notification only if errors are present
        if(applicationModel.viewControllerApplicationSelected == self.parentApplicationViewController &&
            self.notification() > 0) {
            self._notification.show = true;
        }
        else {
            self._notification.show = false;
        }

        render();
    };

    self.clicked = function() {
        if(!self.selected) {
            applicationModel.viewControllerInstanceSelected = self;
            notificationCenter.dispatch(Notifications.ui.INSTANCE_CLICKED);
        }
    };

    self.subscribeButtonClicked = function() {
        alertsModel.application = applicationModel.viewControllerApplicationSelected.name;
        alertsModel.instance = self.name;
        alertsModel.component = undefined;
        $('#mailDisplay').modal({ show: true});
        alertsModel.fetchData();
    };

    // Getters
    self.__defineGetter__("selected", function() {
        if(applicationModel.viewControllerInstanceSelected == undefined)
            return false;

        return self.name == applicationModel.viewControllerInstanceSelected.name &&
            self.applicationName == applicationModel.viewControllerInstanceSelected.applicationName;
    });

    self.getTabsNumber = function() {
          return _.size(self.parentApplicationViewController._instanceViewControllers);
    };

    self.notification = function() {
        return self.parentApplicationViewController.notification(name);
    };

    // Constructor
    self.init = function() {
        self.name = name;
        self.parentApplicationViewController = parentApplicationViewController;
        self.applicationName = self.parentApplicationViewController.name;
        //self.selected = false;

        self.tab = self.addUITab(self.name)

        // Calculate the position of the notification and add it
        self._notification = self.addUINotification();

        notificationCenter.subscribe(Notifications.ui.INSTANCE_CLICKED, self.render);
        notificationCenter.subscribe(Notifications.ui.APPLICATION_EXPANSION_FINISHED, self.render);
    }();

    // Destructor
    self.deinit = function() {
        notificationCenter.unsubscribe(Notifications.ui.INSTANCE_CLICKED, self.render);
        notificationCenter.unsubscribe(Notifications.ui.APPLICATION_EXPANSION_FINISHED, self.render);
    };

    return self;

};
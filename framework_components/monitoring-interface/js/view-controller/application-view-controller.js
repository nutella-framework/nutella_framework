var ApplicationViewController = function(name, view) {
    var self = ViewController(view);

    // Protected variables
    self._instanceViewControllers = {};
    self._expansionAnimationFinished = undefined;
    self._reductionAnimationFinished = undefined;
    self._notification = undefined;
    self._legend = undefined;

    // Public variables
    self.name = undefined;
    self.coordinates = undefined;

    // Render function of the component
    var render = self.render;

    self.render = function() {
        var data = applicationModel.getApplicationData(self.name);

        // Check if the notification must be displayed or not
        if(self.expanded || self.notification() == 0) {
            self._notification.show = false;
        }
        else {
            self._notification.show = true;
        }

        if(self.expanded) {
            self._legend.show = true;
        }
        else {
            self._legend.show = false;
        }

        render();

        self.renderInstances();
    };



    self.mouseOverEffect = function (backGroundRect, color) {
        backGroundRect.fill(color);
    };

    self.mouseOutEffect = function (backGroundRect, color) {
        backGroundRect.fill(color);
    };

    self.closeButtonClicked = function() {
        self.clicked();
    };

    self.subscribeButtonClicked = function() {
        $('#mailDisplay').modal({ show: true});
        alertsModel.application = self.name;
        alertsModel.instance = undefined;
        alertsModel.component = undefined;
        alertsModel.fetchData();
    };

    self.reduce = function() {
        if(self.expanded == true) {
            applicationModel.viewControllerApplicationSelected = undefined;
            notificationCenter.dispatch(Notifications.ui.APPLICATION_CLICKED);
            windowViewController.resetCenter();
            notificationCenter.dispatch(Notifications.ui.APPLICATION_REDUCTION_STARTED);

            // Notify the end of the animation
            setTimeout(function(){
                notificationCenter.dispatch(Notifications.ui.APPLICATION_REDUCTION_FINISHED);
            }, Animations.application.APPLICATION_REDUCTION.delay + Animations.application.APPLICATION_REDUCTION.duration);
        }
    };

    self.clicked = function() {

        if(self.expanded == false) {
            // Deselect the instance
            applicationModel.viewControllerInstanceSelected = undefined;

            applicationModel.viewControllerApplicationSelected = self;
            notificationCenter.dispatch(Notifications.ui.APPLICATION_CLICKED);
            windowViewController.center(self.coordinates.x, self.coordinates.y);
            notificationCenter.dispatch(Notifications.ui.APPLICATION_EXPANSION_STARTED);

            // Notify the end of the animation
            setTimeout(function(){
                notificationCenter.dispatch(Notifications.ui.APPLICATION_EXPANSION_FINISHED);
            }, Animations.application.APPLICATION_EXPANSION.delay + Animations.application.APPLICATION_EXPANSION.duration);

        }
        else {
            applicationModel.viewControllerApplicationSelected = undefined;
            notificationCenter.dispatch(Notifications.ui.APPLICATION_CLICKED);
            windowViewController.resetCenter();
            notificationCenter.dispatch(Notifications.ui.APPLICATION_REDUCTION_STARTED);

            // Notify the end of the animation
            setTimeout(function(){
                notificationCenter.dispatch(Notifications.ui.APPLICATION_REDUCTION_FINISHED);
            }, Animations.application.APPLICATION_REDUCTION.delay + Animations.application.APPLICATION_REDUCTION.duration);
        }

        self.render();
    };

    // Data relative to the current selected instance
    self.__defineGetter__("instanceComponentData", function() {
        if(applicationModel.viewControllerInstanceSelected == undefined ||
            applicationModel.viewControllerApplicationSelected == undefined)
            return undefined;

        var instanceData = applicationModel.getInstanceData(
            applicationModel.viewControllerApplicationSelected.name,
            applicationModel.viewControllerInstanceSelected.name);

        return instanceData.components;
        // TODO: fix here


        if(instanceData != undefined)
            return instanceData.components;
        else
            return undefined;
    });

    self.__defineGetter__("expanded", function() {
        return self == applicationModel.viewControllerApplicationSelected;
    });

    self.__defineGetter__("status", function() {
        return applicationModel.getApplicationData(self.name).problems == undefined || applicationModel.getApplicationData(self.name).problems == 0;
    });

    self.notification = function(name) {
        var data = applicationModel.getApplicationData(self.name);

        if(name == undefined) {
            if(data.problems == undefined) {
                return 0;
            }
            return data.problems;
        }

        var instance = data.instances.filter(function(instance) {
            return instance.name == name;
        });

        if(instance.length == 0) {
            return 0;
        }

        if(instance[0].problems == undefined) {
            return 0;
        }

        return instance[0].problems;
    };

    self.renderInstances = function() {
        var instances = applicationModel.getApplicationData(self.name).instances;
        if(instances != undefined) {

            // Create new instance tabs
            self._view.selectAll(".instance_tabs")
                .data(instances)
                .enter()
                .tabTable()
                .append("g")
                .class("instance_tab")
                .each(function(data, index) {
                    this.instanceViewController = InstanceViewController(self, data.name, index, d3.select(this).newView());
                    self._instanceViewControllers[data.name] = this.instanceViewController;

                    // Set the first instance as selected
                    if(applicationModel.viewControllerInstanceSelected == undefined && self.expanded) {
                        applicationModel.viewControllerInstanceSelected = this.instanceViewController;
                    }
                });

            // Update instance tabs
            self._view.selectAll(".instance_tab")
                .data(instances)
                .each(function(data) {
                    var instanceViewController = this.instanceViewController;
                    instanceViewController.name = data.name;

                    // Render the application
                    instanceViewController.render();
                });

            // Delete instance tabs
            self._view.selectAll(".instance_tab")
                .data(instances)
                .exit()
                .each(function(data) {
                    var instanceViewController = this.instanceViewController;
                    instanceViewController.deinit();
                    delete self._instanceViewControllers[data.name];
                })
                .remove();
        }
    };


    // Constructor
    self.init = function() {

        self.coordinates = {x: 0, y: 0};

        self.name = name;

        // Add graphic components
        self.addUIApplication();    // Graphical visualization of the application
        self.addUIConnectionView(); // Connection view component
        self._notification = self.addUINotification();   // Application notification
        self._notification.x = 50;
        self._notification.y = -50;
        self._legend = self.addUILegend(); // Graph legend

        notificationCenter.subscribe(Notifications.ui.APPLICATION_CLICKED, function() {
            self.render();
        });

        notificationCenter.subscribe(Notifications.ui.APPLICATION_EXPANSION_FINISHED, function() {
            self._expansionAnimationFinished = true;
        });

        notificationCenter.subscribe(Notifications.ui.APPL, function() {
            self._expansionAnimationFinished = true;
        });


        var oldCoordinates = undefined;

        notificationCenter.subscribe(Notifications.ui.APPLICATION_EXPANSION_STARTED, function() {
            oldCoordinates = self.coordinates;
            self.coordinates = {x: (self.coordinates.x - windowViewController.width/2) * 15,
                y: (self.coordinates.y - windowViewController.height/2) * 15
            };
            if(self.expanded == false) {
                self._view.transition().duration(400).translate(self.coordinates.x, self.coordinates.y);
            }
        });

        notificationCenter.subscribe(Notifications.ui.INSTANCE_CLICKED, function() {
            self.render();
        });
    }();

    // Destructor
    self.deinit = function() {
        applicationModel.viewControllerInstanceSelected = undefined;
    };
    return self;

};
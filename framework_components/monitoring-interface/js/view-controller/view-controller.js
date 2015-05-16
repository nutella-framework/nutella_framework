var ViewController = function(view) {
    var self = {};

    // Protected variables
    self._view = undefined;
    self._uis = [];

    //#GETTER AND SETTER
    self.__defineSetter__("view", function(view){
        self._view = view;
    });

    self.__defineGetter__("view", function(){
        return self._view;
    });

    self.render = function() {
        self._uis.forEach(function(ui) {
            ui.render(self._view);
        });
    };

    // Add ui components
    self.addUIApplication = function() {
        var uiApplication = UIApplication(self);
        self.addUiComponent(uiApplication);
        return uiApplication;
    };

    self.addUIConnectionView = function() {
        var uiConnectionView = UIConnectionView(self);
        self.addUiComponent(uiConnectionView);
        return uiConnectionView;
    };

    self.addUITab = function(name) {
        var uiTab = UITab(self, name);
        self.addUiComponent(uiTab);
        return uiTab;
    };

    self.addUINotification = function(notificationName) {
        var uiNotification = UINotification(self);
        uiNotification.name = notificationName;
        self.addUiComponent(uiNotification);
        return uiNotification;
    };

    self.addUILegend = function() {
        var uiLegend = UILegend(self);
        self.addUiComponent(uiLegend);
        return uiLegend;
    };

    self.addUiComponent = function(ui) {
        self._uis.push(ui);
    };

    self.newView = function() {
        return self._view.newView();
    };

    // Constructor
    self.init = function() {
        self._view = view;
    }();

    // Destructor
    self.deinit = function() {
        self._view.remove();
    };

    return self;
};
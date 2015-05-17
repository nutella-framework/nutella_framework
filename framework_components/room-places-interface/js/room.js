var Room = function() {
    var self = {};

    // Private variables

    var _x = 5;
    var _y = 5;

    // Vector of callbacks called when a new dimension arrive
    self.observers = [];


    // Getters

    self.__defineGetter__("x", function(){
        return _x;
    });

    self.__defineGetter__("y", function(){
        return _y;
    });

    // Setters

    self.__defineSetter__("x", function(x){
        _x = x;
        self.updateOnServer();
    });

    self.__defineSetter__("y", function(y){
        _y = y;
        self.updateOnServer();
    });

    // Update the room size on server
    self.updateOnServer = function() {
        nutella.net.publish("location/room/update", {x: _x, y: _y});
    };

    // Notify the update of the room dimension to the observers
    self.notifyObservers = function() {
        for(var observer in self.observers) {
            self.observers[observer]({x: _x, y:_y});
        }
    };

    self.init = function() {

        // Subscribe to room update
        nutella.net.subscribe("location/room/updated", function(room) {
            _x = room.x;
            _y = room.y;
            self.notifyObservers();
        });

        nutella.net.request("location/room", {}, function(room) {
            _x = room.x;
            _y = room.y;
            self.notifyObservers();
        })

    }();

    return self;
};
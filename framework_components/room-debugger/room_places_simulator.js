var RoomPlacesSimulator = function(nutella) {
    this.nutella = nutella;
    this.hotspots = [];
    this.beacons = [];
    this.distance = 0.01;
};



RoomPlacesSimulator.prototype.start = function() {
    // Assign initial location
    var hotspots = this.hotspots;
    this.beacons.forEach((function(e,i) {
        e.l = hotspots[Math.floor(Math.random()*hotspots.length)];
        e.d = this.distance -0.1 + Math.random()*0.2;
        //console.log("Initial location for " + e.b + " set to to " + e.l);
        if (e.l != 'none')
            this.publishLocation(e);
    }).bind(this));
    // Every second, send an update to the bot
    // Location of only some beacons is changed though
    this.interval = setInterval((function() {
        this.beacons.forEach((function(e,i) {
            // Change location for a small percentage
            if(Math.random()>0.93) {
                e.l = hotspots[Math.floor(Math.random()*hotspots.length)];
                e.d = this.distance -0.1 + Math.random()*0.2;
                //console.log(e.b + " moved to " + e.l);
            }
            if (e.l != 'none')
                this.publishLocation(e);
        }).bind(this));
    }).bind(this), 1000);
};


RoomPlacesSimulator.prototype.stop = function() {
    clearInterval(this.interval);
};



RoomPlacesSimulator.prototype.setHotspots = function(hotspots) {
    this.hotspots = hotspots;
    this.hotspots.push('none');
};

RoomPlacesSimulator.prototype.setBeacons = function(beacons) {
    this.beacons = [];
    beacons.forEach((function(e){
        this.beacons.push({b: e, l: 'none'});
    }).bind(this));
};

RoomPlacesSimulator.prototype.setDistance = function(distance) {
    this.distance = distance;
};


// Function to generate location update
RoomPlacesSimulator.prototype.publishLocation = function(beacon) {
    var message = {
        rid : beacon.b,
        proximity: {
            rid: beacon.l,
            distance: beacon.d
        }
    };
    this.nutella.net.publish('location/resource/update', message);
};






var ResourceTable = React.createClass({
    table: {
        resource: "table.resource",
        addResource: "table.addResource",
        beacon: "table.beacon",
        discrete: "table.discrete"
    },
    getInitialState: function () {
        return {
            resourceData: [],
            beaconData: [],
            tableOpen: this.table.resource
        };
    },
    resourcesBuffer: undefined,  // Used for not updating the interface every time a resource change
    componentDidMount: function () {
        self = this;

        // Download all resources
        nutella.net.request("location/resources", {}, function(reply) {
            self.setState({resourceData: reply.resources});
        });

        // Wait for new added resources
        nutella.net.subscribe("location/resources/added", function(message) {
            var data = self.state.resourceData;
            data = data.concat(message.resources);

            self.setState({resourceData: data});
        });

        // Update the interface if the buffer is not empty
        setInterval(function() {
            if(self.resourceBuffer == undefined) {
                return; // Return if buffer empty
            }

            var data = self.state.resourceData;

            // Remove updated resources
            data = data.filter(function(d) {
                return $.inArray(d.rid, self.resourceBuffer.map(function(r) {
                        return r.rid;
                    })) == -1;
            });

            // Add updated resources from the buffer
            data = data.concat(self.resourceBuffer);

            self.setState({resourceData: data});

            self.resourceBuffer = undefined;    // Empty the buffer
        }, 200);

        // Wait for updated resources
        nutella.net.subscribe("location/resources/updated", function(message) {
            if(self.resourceBuffer == undefined) {
                self.resourceBuffer = [];
            }
            self.resourceBuffer = self.resourceBuffer.filter(function(d) {
                return $.inArray(d.rid, message.resources.map(function(r) {
                        return r.rid;
                    })) == -1;
            });
            self.resourceBuffer = self.resourceBuffer.concat(message.resources);
        });

        // Wait for removed resources
        nutella.net.subscribe("location/resources/removed", function(message) {
            var data = self.state.resourceData;
            data = data.filter(function(d) {
                return $.inArray(d.rid, message.resources.map(function(r) {
                        return r.rid;
                    })) == -1;
            });

            self.setState({resourceData: data});
        });


        // Download all beacons
        nutella.net.request("beacon/beacons", {}, function(reply) {
            self.setState({beaconData: reply.beacons});
        });

        // Wait for new added beacons
        nutella.net.subscribe("beacon/beacons/added", function(message) {
            var data = self.state.beaconData;
            data = data.concat(message.beacons);

            self.setState({beaconData: data});
        });

        // Wait for removed beacons
        nutella.net.subscribe("beacon/beacons/removed", function(message) {
            var data = self.state.beaconData;
            data = data.filter(function(d) {
                return $.inArray(d.rid, message.beacons.map(function(r) {
                        return r.rid;
                    })) == -1;
            });

            self.setState({beaconData: data});
        });
    },
    updateResource: function(resource) {
        nutella.net.publish("location/resource/update", resource);
    },
    removeResource: function(resource) {
        nutella.net.publish("location/resource/remove", resource);
    },
    addResource: function(resource) {
        nutella.net.publish("location/resource/add", resource);
    },
    showTable: function(table) {
        if(this.state.tableOpen == table) {
            this.setState({tableOpen: undefined});
        }
        else {
            this.setState({tableOpen: table});
        }
    },
    render: function() {
        var self = this;

        // Order the resource list
        var resources = this.state.resourceData;
        resources = resources.sort(function(a, b) {
            if(a.type == "STATIC" && b.type == "DYNAMIC") {
                return -1;
            }
            else if(a.type == "DYNAMIC" && b.type == "STATIC") {
                return 1;
            }
            else {
                return a.rid.localeCompare(b.rid);
            }
        });

        var resourceRows = resources.map(function (resource, index) {
            return (
                <Resource resource={resource}
                    key={resource.rid}
                    updateResource={self.updateResource}
                    removeResource={self.removeResource}
                    room={self.props.room}/>
            );
        });

        // Order the resource list
        var beacons = this.state.beaconData;
        beacons = beacons.sort(function(a, b) {
            return a.rid.localeCompare(b.rid)
        });
        beacons = beacons.filter(function(b) {

            return $.inArray(b.rid, resources.map(function(r) {
                return r.rid;
            })) == -1;

        });

        var beaconRows = beacons.map(function (beacon, index) {
            return (
                <Beacon beacon={beacon}
                    key={beacon.rid}
                    addResource={self.addResource}
                    updateResource={self.updateResource}/>
            );
        });

        var resourceTableHeight = "40px";
        var addResourceTableHeight = "40px";
        var beaconTableHeight = "40px";
        var discreteTableHeight = "40px";

        switch(this.state.tableOpen) {
            case this.table.resource:
                resourceTableHeight = "500px";
                break;
            case this.table.addResource:
                addResourceTableHeight = "300px";
                break;
            case this.table.beacon:
                beaconTableHeight = "500px";
                break;
            case this.table.discrete:
                discreteTableHeight = "500px";
                break;
        }

        return(
            <div>
                <div className="col-md-12 table-responsive table_container animated" style={{"overflowX": "scroll", maxHeight: resourceTableHeight}}>
                    <table className="table table-bordered table-striped table-hover" id="resource_table">
                        <thead onClick={_.partial(this.showTable, this.table.resource)} className="pointer">
                            <tr>
                                <th className="col-md-12 col-sm-12 col-xs-12 text-center">Resources</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resourceRows}
                        </tbody>
                    </table>
                </div>
                <ResourceAdd room={this.props.room} tableHeight={addResourceTableHeight} showTable={this.showTable}/>
                <div className="col-md-12 table-responsive table_container animated"
                     style={{
                        "overflowX": "scroll",
                        maxHeight: beaconTableHeight
                        }}>
                    <table className="table table-bordered table-striped table-hover" id="resource_table">
                        <thead onClick={_.partial(this.showTable, this.table.beacon)} className="pointer">
                            <tr>
                                <th className="col-md-12 col-sm-12 col-xs-12 text-center">Beacons</th>
                            </tr>
                        </thead>
                        <tbody>
                            {beaconRows}
                        </tbody>
                    </table>
                </div>
                <Discrete room={this.props.room} tableHeight={discreteTableHeight} showTable={this.showTable}/>
            </div>
        );
    }
});

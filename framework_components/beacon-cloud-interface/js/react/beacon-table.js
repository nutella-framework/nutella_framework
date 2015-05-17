var BeaconTable = React.createClass({
    getInitialState: function() {
        return {
            beaconData: []
        };
    },
    componentDidMount: function() {
        self = this;

        // Download all beacons
        nutella.f.net.request("beacon/beacons", {}, function(reply) {
            self.setState({beaconData: reply.beacons});
        });

        // Wait for new added beacons
        nutella.f.net.subscribe("beacon/beacons/added", function(message) {
            var data = self.state.beaconData;
            data = data.concat(message.beacons);

            self.setState({beaconData: data});
        });

        // Wait for removed beacons
        nutella.f.net.subscribe("beacon/beacons/removed", function(message) {
            var data = self.state.beaconData;
            data = data.filter(function(d) {
                return $.inArray(d.rid, message.beacons.map(function(r) {
                        return r.rid;
                    })) == -1;
            });

            self.setState({beaconData: data});
        });
    },
    hendleBeaconAdd: function(beacon) {
        nutella.f.net.publish("beacon/beacon/add", beacon);
    },
    hendleBeaconRemove: function(beacon) {
        nutella.f.net.publish("beacon/beacon/remove", {rid: beacon.rid});
    },
    render: function() {
        var self = this;

        // Reorder the beacons
        var beaconData = this.state.beaconData;
        beaconData = beaconData.sort(function(a, b) {
            return a.rid.localeCompare(b.rid)
        });

        var beacons = beaconData.map(function (beacon, index) {
            return <Beacon beacon={beacon} key={beacon.rid} removeBeacon={self.hendleBeaconRemove} addBeacon={self.hendleBeaconAdd}/>
        });

        return (
            <div className="table-responsive col-md-8 col-md-offset-2 col-sm-12">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th className="col-md-2 col-sm-2 col-xs-2">Resource Id</th>
                            <th className="col-md-6 col-sm-6 col-xs-6">UUID</th>
                            <th className="col-md-2 col-sm-2 col-xs-2">Major</th>
                            <th className="col-md-2 col-sm-2 col-xs-2">Minor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {beacons}
                        <BeaconAdd addBeacon={this.hendleBeaconAdd} />
                    </tbody>
                </table>
            </div>
        );
    }
});
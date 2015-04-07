var BeaconAdd = React.createClass({
    getInitialState: function() {
        return {
            beacon: {rid: "", uuid: "", major: "", minor: ""}
        };
    },
    handleChangeRid: function(e) {
        var beacon = this.state.beacon;
        beacon.rid = event.target.value;
        this.setState({beacon: beacon});
    },
    handleChangeUuid: function(e) {
        var beacon = this.state.beacon;
        beacon.uuid = event.target.value;

        // If it is not a valid UUID try to fix it
        if(!beacon.uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            var uuid = beacon.uuid;

            var re = new RegExp("-", 'g');
            uuid = uuid.replace(re, '');

            var uuidTemp = "";

            uuidTemp += uuid.substring(0,8);
            if(uuid.length >= 8) {
                uuidTemp += "-";
            }
            uuidTemp += uuid.substring(8,12);
            if(uuid.length >= 12) {
                uuidTemp += "-";
            }
            uuidTemp += uuid.substring(12,16);
            if(uuid.length >= 16) {
                uuidTemp += "-";
            }
            uuidTemp += uuid.substring(16,20);
            if(uuid.length >= 20) {
                uuidTemp += "-";
            }
            uuidTemp += uuid.substring(20,32);
            beacon.uuid = uuidTemp;
        }


        this.setState({beacon: beacon});
    },
    handleChangeMajor: function(e) {
        var beacon = this.state.beacon;
        if(event.target.value.match(/^[0-9]*$/i)) {
            beacon.major = event.target.value;
            this.setState({beacon: beacon});
        }
    },
    handleChangeMinor: function(e) {
        var beacon = this.state.beacon;
        if(event.target.value.match(/^[0-9]*$/i)) {
            beacon.minor = event.target.value;
            this.setState({beacon: beacon});
        }
    },
    handleKeyDownUUID: function(evt) {
        var beacon = this.state.beacon;
        if (evt.keyCode == 8 &&
            (
                beacon.uuid.length == 9 ||
                beacon.uuid.length == 14 ||
                beacon.uuid.length == 19 ||
                beacon.uuid.length == 24
            )
            ) {
            beacon.uuid = beacon.uuid.substring(0, beacon.uuid.length - 1);
            this.setState({beacon: beacon});
        }
        this.handleKeyDown(evt);
    },
    handleKeyDown: function(evt) {
        if (evt.keyCode == 13 ) {
            if( this.state.beacon.rid != "" &&
                this.state.beacon.uuid != "" &&
                this.state.beacon.major != "" &&
                this.state.beacon.minor != "") {
                this.props.addBeacon(this.state.beacon);
                this.setState({beacon: {rid: "", uuid: "", major: "", minor: ""}})
            }
            else {
                alert("Incomplete beacon")
            }

        }
    },
    render: function() {
        return (
            <tr>
                <td className="col-md-2 col-sm-2 col-xs-2 add"><input type="text" onKeyDown={this.handleKeyDown} className="form-control" value={this.state.beacon.rid} placeholder="rid" onChange={this.handleChangeRid} ref="rid"/></td>
                <td className="col-md-6 col-sm-6 col-xs-6 add"><input type="text" onKeyDown={this.handleKeyDownUUID} className="form-control" value={this.state.beacon.uuid} placeholder="uuid" onChange={this.handleChangeUuid} ref="uuid"/></td>
                <td className="col-md-2 col-sm-2 col-xs-2 add"><input type="text" onKeyDown={this.handleKeyDown} className="form-control" value={this.state.beacon.major} placeholder="major" onChange={this.handleChangeMajor} ref="major"/></td>
                <td className="col-md-2 col-sm-2 col-xs-2 add"><input type="text" onKeyDown={this.handleKeyDown} className="form-control" value={this.state.beacon.minor} placeholder="minor" onChange={this.handleChangeMinor} ref="minor"/></td>
            </tr>
        );
    }
});
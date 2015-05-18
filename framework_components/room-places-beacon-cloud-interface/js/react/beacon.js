var Beacon = React.createClass({
    getInitialState: function() {
        return {ridEdit: false, uuidEdit: false, majorEdit: false, minorEdit: false};
    },
    handleRemoveButton: function() {
        this.props.removeBeacon(this.props.beacon);
    },
    handleRidClicked: function() {
        this.replaceState({ridEdit: true});
    },
    handleUuidClicked: function() {
        this.replaceState({uuidEdit: true});
    },
    handleMajorClicked: function() {
        this.replaceState({majorEdit: true});
    },
    handleMinorClicked: function() {
        this.replaceState({minorEdit: true});
    },
    handleKeyDownRid: function(evt) {
        if (evt.keyCode == 13 ) {
            var beacon = this.props.beacon;
            this.props.removeBeacon(beacon);
            beacon.rid = this.refs.rid.getDOMNode().value.trim();
            this.props.addBeacon(beacon);
        }
    },
    handleKeyDownUuid: function(evt) {
        if (evt.keyCode == 13 ) {
            var beacon = this.props.beacon;
            this.props.removeBeacon(beacon);
            beacon.uuid = this.refs.uuid.getDOMNode().value.trim();
            this.props.addBeacon(beacon);
        }
    },
    handleKeyDownMajor: function(evt) {
        if (evt.keyCode == 13 ) {
            var beacon = this.props.beacon;
            this.props.removeBeacon(beacon);
            beacon.major = this.refs.major.getDOMNode().value.trim();
            this.props.addBeacon(beacon);
        }
    },
    handleKeyDownMinor: function(evt) {
        if (evt.keyCode == 13 ) {
            var beacon = this.props.beacon;
            this.props.removeBeacon(beacon);
            beacon.minor = this.refs.minor.getDOMNode().value.trim();
            this.props.addBeacon(beacon);
        }
    },
    render: function() {
        var b = {};

        if(this.state.ridEdit)
            b.rid = <input type="text" onKeyDown={this.handleKeyDownRid} className="form-control" defaultValue={this.props.beacon.rid} placeholder="rid" onChange={this.handleChangeRid} ref="rid"/>;
        else
            b.rid = this.props.beacon.rid;

        if(this.state.uuidEdit)
            b.uuid = <input type="text" onKeyDown={this.handleKeyDownUuid} className="form-control" defaultValue={this.props.beacon.uuid} placeholder="uuid" onChange={this.handleChangeUuid} ref="uuid"/>;
        else
            b.uuid = this.props.beacon.uuid;

        if(this.state.majorEdit)
            b.major = <input type="text" onKeyDown={this.handleKeyDownMajor} className="form-control" defaultValue={this.props.beacon.major} placeholder="major" onChange={this.handleChangeMajor} ref="major"/>;
        else
            b.major = this.props.beacon.major;

        if(this.state.minorEdit)
            b.minor = <input type="text" onKeyDown={this.handleKeyDownMinor} className="form-control" defaultValue={this.props.beacon.minor} placeholder="minor" onChange={this.handleChangeMinor} ref="minor"/>;
        else
            b.minor = this.props.beacon.minor;

        if(this.state.ridEdit || this.state.uuidEdit || this.state.majorEdit || this.state.minorEdit)
                add = "add";
            else
                add = "";

        return (

            <tr>
                <td className={"col-md-2 col-sm-2 col-xs-2 "+add} onClick={this.handleRidClicked}>{b.rid}</td>
                <td className={"col-md-6 col-sm-6 col-xs-6 "+add} onClick={this.handleUuidClicked}>{b.uuid}</td>
                <td className={"col-md-2 col-sm-2 col-xs-2 "+add} onClick={this.handleMajorClicked}>{b.major}</td>
                <td className={"col-md-2 col-sm-2 col-xs-2 "+add} onClick={this.handleMinorClicked}>
                    <span>
                        {b.minor}
                    </span>
                    <button type="button" className="btn btn-danger btn-xs right" onClick={this.handleRemoveButton}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </button>
                </td>
            </tr>
        );
    }
});
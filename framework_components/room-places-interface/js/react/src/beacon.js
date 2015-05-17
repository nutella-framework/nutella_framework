
var Beacon = React.createClass({
    componentDidMount: function () {

    },
    handleAddPressed: function() {
        var resource = {rid: this.props.beacon.rid, type: "DYNAMIC", model: "IBEACON", proximity: {}};

        this.props.addResource(resource);
        this.props.updateResource(resource);
    },
    render: function () {
        var self = this;

        return(
            <tr>
                <td className="col-md-12 col-sm-12 col-xs-12">
                    <div className="col-md-4 col-sm-4 col-xs-4"><div className="vertical-center"><span>{this.props.beacon.rid}</span></div></div>

                    <div className="right">
                        <button type="button" className="btn btn-default" onClick={this.handleAddPressed}><span className="glyphicon glyphicon-plus" aria-hidden="true"></span></button>
                    </div>

                </td>
            </tr>
        );

    }
});


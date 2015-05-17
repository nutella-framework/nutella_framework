
var Beacon = React.createClass({displayName: "Beacon",
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
            React.createElement("tr", null, 
                React.createElement("td", {className: "col-md-12 col-sm-12 col-xs-12"}, 
                    React.createElement("div", {className: "col-md-4 col-sm-4 col-xs-4"}, React.createElement("div", {className: "vertical-center"}, React.createElement("span", null, this.props.beacon.rid))), 

                    React.createElement("div", {className: "right"}, 
                        React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.handleAddPressed}, React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}))
                    )

                )
            )
        );

    }
});



var ResourceAdd = React.createClass({displayName: "ResourceAdd",
    componentDidMount: function () {

    },
    getInitialState: function() {
        return {name: "", model: "IPAD", type: "DYNAMIC", tracking: "CONTINUOUS"};
    },
    handleSubmit: function(e) {
        e.preventDefault();

        var resource = {rid: this.state.name, model: this.state.model, type: this.state.type};

        nutella.net.publish("location/resource/add", resource);

        if(this.state.tracking == "CONTINUOUS") {
            if(this.state.type == "STATIC")
                resource.proximity_range = 0;
            resource.continuous = {x: this.props.room.x/2, y: this.props.room.y/2};
        }
        else if(this.state.tracking == "DISCRETE") {
            resource.discrete = {x: 0, y: 0};
        }
        else if(this.state.tracking == "PROXIMITY") {
            resource.proximity = {};
        }


        nutella.net.publish("location/resource/update", resource);

        // Clean the form
        this.setState({name: ""});
    },
    handleChangeName: function(e) {
        this.setState({name: event.target.value});
    },
    handleChangeTypeDynamic: function(e) {
        this.setState({type: "DYNAMIC"});
    },
    handleChangeTypeStatic: function(e) {
        this.setState({type: "STATIC"});
        if(this.state.tracking == "PROXIMITY") {
            this.setState({tracking: "NONE"});
        }
    },
    handleChangeTrackingContinuous: function(e) {
        this.setState({tracking: "CONTINUOUS"});
    },
    handleChangeTrackingDiscrete: function(e) {
        this.setState({tracking: "DISCRETE"});
    },
    handleTrackingProximity: function(e) {
        this.setState({tracking: "PROXIMITY"});
    },
    handleChangeTrackingNone: function(e) {
        this.setState({tracking: "NONE"});
    },
    handleChangeModelIMAC: function(e) {
        this.setState({model: "IMAC"});
    },
    handleChangeModelIPHONE: function(e) {
        this.setState({model: "IPHONE"});
    },
    handleChangeModelIPAD: function(e) {
        this.setState({model: "IPAD"});
    },
    handleChangeModelIBEACON: function(e) {
        this.setState({model: "IBEACON"});
    },
    handleChangeModelADISPLAY: function(e) {
        this.setState({model: "ADISPLAY"});
    },
    handleChangeModelTTABLE: function(e) {
        this.setState({model: "TTABLE"});
    },
    handleChangeModelOTHER: function(e) {
        this.setState({model: "OTHER"});
    },
    handleChangeModel: function(e) {
        this.setState({model: event.target.value});
    },
    render: function () {

        var type = "";

        if(this.state.type == "STATIC") {
            type = React.createElement("b", null, "S");
        }
        else if(this.state.type == "DYNAMIC") {
            type = React.createElement("b", null, "D");
        }

        var proximity = {};
        if(this.state.type == "DYNAMIC")
            proximity = React.createElement("li", {onClick: this.handleTrackingProximity}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "fa fa-location-arrow fa-fw"}), " Proximity"));

        var tracking = "";

        if(this.state.tracking == "CONTINUOUS")
            tracking = "fa-arrows";
        else if(this.state.tracking == "DISCRETE")
            tracking = "fa-th-large";
        else if(this.state.tracking == "PROXIMITY")
            tracking = "fa-location-arrow";
        else
            tracking = "fa-ban";

        var model = "";

        switch(this.state.model) {
            case "IMAC":
                model = "icon-iMac";
                break;
            case "IPHONE":
                model = "icon-iPhone";
                break;
            case "IPAD":
                model = "icon-iPad";
                break;
            case "IBEACON":
                model = "icon-iBeacon";
                break;
            case "ADISPLAY":
                model = "icon-aDisplay";
                break;
            case "TTABLE":
                model = "icon-tTable";
                break;
            case "OTHER":
                model = "icon-other";
                break;
        }

        return(
            React.createElement("div", {className: "col-md-12 col-sm-12 col-xs-12 table-responsive table_container animated", style: {"overflowX": "hide", height: this.props.tableHeight}}, 
                React.createElement("table", {className: "table table-bordered table-striped table-hover", id: "resource_table", style: {"overflowX": "visible"}}, 
                    React.createElement("thead", {onClick: _.partial(this.props.showTable, "table.addResource"), className: "pointer"}, 
                        React.createElement("tr", null, 
                            React.createElement("th", {className: "col-md-12 col-sm-12 col-xs-12 text-center"}, "Add resource")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", {className: "col-md-12 col-sm-12 col-xs-12"}, 
                                React.createElement("form", {onSubmit: this.handleSubmit}, 
                                    React.createElement("div", {className: "col-md-4 col-sm-4 col-xs-4"}, 
                                        React.createElement("input", {type: "text", className: "form-control", placeholder: "resource-id", value: this.state.name, onChange: this.handleChangeName})
                                    ), 

                                    React.createElement("div", {className: "btn-group"}, 
                                        React.createElement("a", {className: "btn btn-default", href: "#"}, React.createElement("i", {className: "fa " + model + " fa-fw"})), 
                                        React.createElement("a", {className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", href: "#"}, 
                                            React.createElement("span", {className: "fa fa-caret-down"})
                                        ), 
                                        React.createElement("ul", {className: "dropdown-menu"}, 
                                            React.createElement("li", {onClick: this.handleChangeModelIMAC}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-iMac"}), " iMac")), 
                                            React.createElement("li", {onClick: this.handleChangeModelIPHONE}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-iPhone"}), " iPhone")), 
                                            React.createElement("li", {onClick: this.handleChangeModelIPAD}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-iPad"}), " iPad")), 
                                            React.createElement("li", {onClick: this.handleChangeModelIBEACON}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-iBeacon"}), " iBeacon")), 
                                            React.createElement("li", {onClick: this.handleChangeModelADISPLAY}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-aDisplay"}), " Ambient Display")), 
                                            React.createElement("li", {onClick: this.handleChangeModelTTABLE}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-tTable"}), " Touch Table")), 
                                            React.createElement("li", {onClick: this.handleChangeModelOTHER}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "icon-other"}), " Other"))
                                        )
                                    ), 

                                    React.createElement("div", {className: "btn-group"}, 
                                        React.createElement("a", {className: "btn btn-default", href: "#"}, React.createElement("i", {className: "fa " + tracking + " fa-fw"})), 
                                        React.createElement("a", {className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", href: "#"}, 
                                            React.createElement("span", {className: "fa fa-caret-down"})
                                        ), 
                                        React.createElement("ul", {className: "dropdown-menu"}, 
                                            React.createElement("li", {onClick: this.handleChangeTrackingContinuous}, React.createElement("a", {href: "#"}, React.createElement("i", {className: "fa fa-arrows fa-fw"}), " Continuous")), 
                                            React.createElement("li", {onClick: this.handleChangeTrackingDiscrete}, "  ", React.createElement("a", {href: "#"}, React.createElement("i", {className: "fa fa-th-large fa-fw"}), " Discrete")), 
                                            proximity, 
                                            React.createElement("li", {onClick: this.handleChangeTrackingNone}, "      ", React.createElement("a", {href: "#"}, React.createElement("i", {className: "fa fa-ban fa-fw"}), " Disabled"))
                                        )
                                    ), 

                                    React.createElement("div", {className: "btn-group", role: "group"}, 
                                        React.createElement("div", {className: "btn-group", role: "group"}, 
                                            React.createElement("button", {type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", "aria-expanded": "false"}, 
                                                type, 
                                                React.createElement("span", {className: "caret"})
                                            ), 
                                            React.createElement("ul", {className: "dropdown-menu", role: "menu"}, 
                                                React.createElement("li", {onClick: this.handleChangeTypeStatic}, " ", React.createElement("a", {href: "#"}, React.createElement("b", null, "S"), " Static")), 
                                                React.createElement("li", {onClick: this.handleChangeTypeDynamic}, React.createElement("a", {href: "#"}, React.createElement("b", null, "D"), " Dynamic"))
                                            )
                                        )
                                    ), 

                                    React.createElement("button", {onClick: this.handleSubmit, type: "button", className: "btn btn-default right"}, 
                                        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

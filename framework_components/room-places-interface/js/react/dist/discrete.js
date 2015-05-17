var Discrete = React.createClass({displayName: "Discrete",
    getInitialState: function () {
        return {
            tracking: undefined
        };
    },
    componentDidMount: function () {
        var self = this;

        nutella.net.subscribe("location/tracking/discrete/updated", function(message) {
            var tracking = message["tracking"];
            if(_.isEmpty(tracking)) {
                tracking = undefined;
            }
            self.setState({tracking: tracking});
        });

        nutella.net.request("location/tracking/discrete", {}, function(reply) {
            var tracking = reply["tracking"];
            if(_.isEmpty(tracking)){
                tracking = undefined;
            }
            self.setState({tracking: tracking});
        });
    },
    handleEnable: function () {
        var tracking = {
            x: 0,
            y: 0,
            width: this.props.room.x,
            height: this.props.room.y,
            n_x: 5,
            n_y: 5,
            t_x: 'NUMBER',
            t_y: 'NUMBER'
        };
        nutella.net.publish("location/tracking/discrete/update", {tracking: tracking});
        self.setState({tracking: tracking});
    },
    handleDisable: function () {
        self.setState({tracking: undefined});
        nutella.net.publish("location/tracking/discrete/update", {tracking: {}});
    },
    handleKeyPress: function (event) {
        if(event.which == 13) {
            event.target.textContent = event.target.textContent.trim();
            event.target.blur();
        }
    },
    handleModifyAttribute: function (name, key, value) {

        var tracking = this.state.tracking;

        switch(key) {
            case "n_x":
            case "n_y":
                tracking[key] = parseInt(value);
                break;

            case "width":
            case "height":
            case "x":
            case "y":
                tracking[key] = parseFloat(value);
                break;
        }

        nutella.net.publish("location/tracking/discrete/update", {tracking: tracking});

        this.setState({tracking: tracking});
    },
    handleTypeChange: function (axis_type, type) {
        var tracking = this.state.tracking;

        tracking[axis_type] = type;

        nutella.net.publish("location/tracking/discrete/update", {tracking: tracking});

        this.setState({tracking: tracking});
    },
    render: function () {
        var self = this;

        if(self.state.tracking == undefined) {
            return(
                React.createElement("div", {className: "col-md-12 col-sm-12 col-xs-12 table-responsive table_container animated", style: {overflowX: "hide", height: this.props.tableHeight}}, 
                    React.createElement("table", {className: "table table-bordered table-striped table-hover", id: "resource_table", style: {overflowX: "visible"}}, 
                        React.createElement("thead", {onClick: _.partial(this.props.showTable, "table.discrete"), className: "pointer"}, 
                        React.createElement("tr", null, 
                            React.createElement("th", {className: "col-md-12 col-sm-12 col-xs-12 text-center"}, "Discrete Tracking")
                        )
                        ), 
                        React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", {className: "col-md-12 col-sm-12 col-xs-12"}, 

                                React.createElement("div", {className: "col-md-4 col-sm-4 col-xs-4 btn-group"}, 
                                    React.createElement("a", {className: "btn btn-default", onClick: this.handleEnable}, React.createElement("i", {className: "fa fa-ban fa-fw"})), 
                                    React.createElement("a", {className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", href: "#"}, 
                                        React.createElement("span", {className: "fa fa-caret-down"})), 
                                    React.createElement("ul", {className: "dropdown-menu"}, 
                                        React.createElement("li", null, React.createElement("a", {onClick: self.handleEnable}, React.createElement("i", {className: "fa fa-th-large fa-fw"}), " Enabled")), 
                                        React.createElement("li", null, React.createElement("a", {onClick: self.handleDisable}, React.createElement("i", {className: "fa fa-ban fa-fw"}), " Disabled"))
                                    )
                                ), 
                                React.createElement("div", {className: "col-md-8 col-sm-8 col-xs-8", style: {marginTop: "6px"}}, "Discrete tracking system disabled")
                            )
                        )
                        )
                    )
                )
            );
        }
        else {
            var t_x = "";
            var t_y = "";
            switch(self.state.tracking.t_x) {
                case 'NUMBER':
                    t_x = React.createElement("b", null, "NUMBER");
                    break;
                case 'LETTER':
                    t_x = React.createElement("b", null, "LETTER");
                    break;
            }
            switch(self.state.tracking.t_y) {
                case 'NUMBER':
                    t_y = React.createElement("b", null, "NUMBER");
                    break;
                case 'LETTER':
                    t_y = React.createElement("b", null, "LETTER");
                    break;
            }

            return(
                React.createElement("div", {className: "col-md-12 col-sm-12 col-xs-12 table-responsive table_container animated", style: {overflowX: "hide", height: this.props.tableHeight}}, 
                    React.createElement("table", {className: "table table-bordered table-striped table-hover", id: "resource_table", style: {overflowX: "visible"}}, 
                        React.createElement("thead", {onClick: _.partial(this.props.showTable, "table.discrete"), className: "pointer"}, 
                        React.createElement("tr", null, 
                            React.createElement("th", {className: "col-md-12 col-sm-12 col-xs-12 text-center"}, "Discrete Tracking")
                        )
                        ), 
                        React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", {className: "col-md-12 col-sm-12 col-xs-12"}, 

                                React.createElement("div", {className: "col-md-4 col-sm-3 col-xs-4 btn-group"}, 
                                    React.createElement("a", {className: "btn btn-default", onClick: this.handleDisable}, React.createElement("i", {className: "fa fa-th-large fa-fw"})), 
                                    React.createElement("a", {className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", href: "#"}, 
                                        React.createElement("span", {className: "fa fa-caret-down"})), 
                                    React.createElement("ul", {className: "dropdown-menu"}, 
                                        React.createElement("li", null, React.createElement("a", {onClick: self.handleEnable}, React.createElement("i", {className: "fa fa-th-large fa-fw"}), " Enabled")), 
                                        React.createElement("li", null, React.createElement("a", {onClick: self.handleDisable}, React.createElement("i", {className: "fa fa-ban fa-fw"}), " Disabled"))
                                    )
                                ), 


                                React.createElement("div", {className: "right", "data-toggle": "collapse", "data-target": "#collapseExample2"}, 
                                    React.createElement("button", {type: "button", className: "btn btn-default"}, React.createElement("span", {className: "glyphicon glyphicon-chevron-down", "aria-hidden": "true"}))
                                ), 

                                React.createElement("div", {className: "collapse", id: "collapseExample2"}, 
                                    React.createElement("div", {style: {marginTop: "20px", padding: "10px"}}, 
                                        React.createElement("table", {className: "table table-bordered table-striped table-hover", id: "resource_table"}, 
                                            React.createElement("tbody", null, 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, React.createElement("span", {id: "A3"}, "X number")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    
                                                        /*
                                                        <span contentEditable="true"
                                                              onKeyUp={self.handleKeyPress}
                                                              onBlur={self.handleBlur}
                                                              ref="n_x">
                                                        {self.state.tracking.n_x}
                                                        </span>
                                                        */
                                                    
                                                    React.createElement(InteractiveLabel, {
                                                        onKeyPress: self.handleKeyPress, 
                                                        onValueChange: self.handleModifyAttribute, 
                                                        labelName: "value", 
                                                        labelValue: self.state.tracking.n_x, 
                                                        labelKey: "n_x"})
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, React.createElement("span", {id: "A3"}, "Y number")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement(InteractiveLabel, {
                                                        onKeyPress: self.handleKeyPress, 
                                                        onValueChange: self.handleModifyAttribute, 
                                                        labelName: "value", 
                                                        labelValue: self.state.tracking.n_y, 
                                                        labelKey: "n_y"})
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, React.createElement("span", {id: "A3"}, "Width")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement(InteractiveLabel, {
                                                        onKeyPress: self.handleKeyPress, 
                                                        onValueChange: self.handleModifyAttribute, 
                                                        labelName: "value", 
                                                        labelValue: self.state.tracking.width.toFixed(2), 
                                                        labelKey: "width"})
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, React.createElement("span", {id: "A3"}, "Height")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement(InteractiveLabel, {
                                                        onKeyPress: self.handleKeyPress, 
                                                        onValueChange: self.handleModifyAttribute, 
                                                        labelName: "value", 
                                                        labelValue: self.state.tracking.height.toFixed(2), 
                                                        labelKey: "height"})
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, React.createElement("span", {id: "A3"}, "X origin")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement(InteractiveLabel, {
                                                        onKeyPress: self.handleKeyPress, 
                                                        onValueChange: self.handleModifyAttribute, 
                                                        labelName: "value", 
                                                        labelValue: self.state.tracking.x.toFixed(2), 
                                                        labelKey: "x"})
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, React.createElement("span", {id: "A3"}, "Y origin")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement(InteractiveLabel, {
                                                        onKeyPress: self.handleKeyPress, 
                                                        onValueChange: self.handleModifyAttribute, 
                                                        labelName: "value", 
                                                        labelValue: self.state.tracking.y.toFixed(2), 
                                                        labelKey: "y"})
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6", style: {height: "48px"}}, React.createElement("span", {id: "A3"}, "X type")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement("div", {className: "btn-group dropup"}, 
                                                        React.createElement("a", {className: "btn btn-default btn-sm", href: "#"}, t_x), 
                                                        React.createElement("a", {className: "btn btn-default dropdown-toggle btn-sm", "data-toggle": "dropdown", href: "#"}, 
                                                            React.createElement("span", {className: "fa fa-caret-up"})), 
                                                        React.createElement("ul", {className: "dropdown-menu"}, 
                                                            React.createElement("li", null, React.createElement("a", {onClick: function(){self.handleTypeChange('t_x', 'NUMBER')}}, React.createElement("b", null, "N"), " Number")), 
                                                            React.createElement("li", null, React.createElement("a", {onClick: function(){self.handleTypeChange('t_x', 'LETTER')}}, React.createElement("b", null, "L"), " Letter"))
                                                        )
                                                    )
                                                )
                                            ), 
                                            React.createElement("tr", null, 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6", style: {height: "48px"}}, React.createElement("span", {id: "A3"}, "Y type")), 
                                                React.createElement("td", {className: "col-md-6 col-sm-6 col-xs-6"}, 
                                                    React.createElement("div", {className: "btn-group dropup"}, 
                                                        React.createElement("a", {className: "btn btn-default btn-sm", href: "#"}, t_y), 
                                                        React.createElement("a", {className: "btn btn-default dropdown-toggle btn-sm", "data-toggle": "dropdown", href: "#"}, 
                                                            React.createElement("span", {className: "fa fa-caret-up"})), 
                                                        React.createElement("ul", {className: "dropdown-menu"}, 
                                                            React.createElement("li", null, React.createElement("a", {onClick: function(){self.handleTypeChange('t_y', 'NUMBER')}}, React.createElement("b", null, "N"), " Number")), 
                                                            React.createElement("li", null, React.createElement("a", {onClick: function(){self.handleTypeChange('t_y', 'LETTER')}}, React.createElement("b", null, "L"), " Letter"))
                                                        )
                                                    )
                                                )
                                            )
                                            )
                                        )
                                    )
                                )

                            )
                        )
                        )
                    )
                )
            );
        }
    }
});

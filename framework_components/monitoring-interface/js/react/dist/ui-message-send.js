var UIJSONAttribute = React.createClass ({displayName: "UIJSONAttribute",
    getInitialState: function() {
        return({
            type: "string",
            value: "",
            key: "",
            application: undefined,
            instance: undefined,
            component: undefined
        })
    },
    handleTypeChange: function(type) {
        this.setState({type: type});
        this.updateJson = true;
    },
    handleKeyChange: function(event) {
        /*
        switch(this.state.type) {
            case "string":
                this.setState({key: event.target.value});
                break;
        }
        */
        this.setState({key: event.target.value});
        this.props.updateJSON();
    },
    handleValueChange: function() {
        switch(this.state.type) {
            case "string":
            case "number":
                this.setState({value: event.target.value});
                break;
        }
        this.props.updateJSON();
    },
    getJson: function() {
        if(this.props.keyEnabled) {
            var json = {};
            switch (this.state.type) {
                case "string":
                    json[this.refs.key.getDOMNode().value] = this.refs.value.getDOMNode().value;
                    break;
                case "number":
                    json[this.refs.key.getDOMNode().value] = parseFloat(this.refs.value.getDOMNode().value);
                    break;
                case "array":
                    // TODO: check refs
                    json[this.refs.key.getDOMNode().value] = this.refs.array.getJson();
                    break;
                case "object":
                    json[this.refs.key.getDOMNode().value] = this.refs.object.getJson();
                    break;
            }
            return json;
        }
        else {
            switch (this.state.type) {
                case "string":
                    return this.refs.value.getDOMNode().value;
                    break;
                case "number":
                    return parseFloat(this.refs.value.getDOMNode().value);
                    break;
                case "array":
                    // TODO: check refs
                    return this.refs.array.getJson();
                    break;
                case "object":
                    return this.refs.object.getJson();
                    break;
            }
        }
    },
    render: function() {

        var self = this;

        var inputBox = "";
        switch(this.state.type) {
            case "string":
            case "number":
                inputBox =  React.createElement("div", null, 
                                React.createElement("button", {type: "button", 
                                        className: "close", 
                                        "aria-label": "Close", 
                                        onClick: _.partial(self.props.deleteAttribute, self.state.key)}, 
                                    React.createElement("span", {"aria-hidden": "true"}, "×")
                                ), 
                                React.createElement("div", {className: "col-lg-4 col-md-4 col-sm-4", style: {padding: "10px"}}, 
                                    React.createElement("input", {
                                        onChange: this.handleValueChange, 
                                        type: "text", className: "form-control", 
                                        placeholder: "String", 
                                        "aria-describedby": "basic-addon2", 
                                        value: this.state.value, 
                                        ref: "value"})
                                )
                            );
                break;
            case "array":
                inputBox =  React.createElement("div", null, 
                    React.createElement("button", {type: "button", 
                            className: "close", 
                            "aria-label": "Close", 
                            onClick: _.partial(self.props.deleteAttribute, self.state.key)}, 
                        React.createElement("span", {"aria-hidden": "true"}, "×")
                    ), 
                    React.createElement("div", {className: "col-lg-12 col-md-12 col-sm-12", style: {padding: "10px"}}, 
                        React.createElement(UIJSONArray, {updateJSON: this.props.updateJSON, ref: "array"})
                    )
                );
                break;
            case "object":
                inputBox =  React.createElement("div", null, 
                                React.createElement("button", {type: "button", 
                                        className: "close", 
                                        "aria-label": "Close", 
                                        onClick: _.partial(self.props.deleteAttribute, self.state.key)}, 
                                    React.createElement("span", {"aria-hidden": "true"}, "×")
                                ), 
                                React.createElement("div", {className: "col-lg-12 col-md-12 col-sm-12", style: {padding: "10px"}}, 
                                    React.createElement(UIJSONObject, {updateJSON: this.props.updateJSON, ref: "object"})
                                )
                            );
                break;
        }

        return (
            React.createElement("div", null, 
                React.createElement("div", {className: "col-lg-6 col-md-6 col-sm-6 ", style: {padding: "10px"}}, 
                    React.createElement("div", {className: "input-group"}, 
                         this.props.keyEnabled ?
                            React.createElement("input", {
                                onChange: this.handleKeyChange, 
                                type: "text", className: "form-control", 
                                placeholder: "Key", 
                                "aria-describedby": "basic-addon2", 
                                value: this.state.key, 
                                ref: "key"})
                            :
                            "", 
                        
                        React.createElement("div", {className: "input-group-btn"}, 
                            React.createElement("button", {className: "btn btn-default dropdown-toggle", type: "button", id: "menu1", "data-toggle": "dropdown"}, self.state.type, 
                                React.createElement("span", {className: "caret"})), 
                            React.createElement("ul", {className: "dropdown-menu", role: "menu", "aria-labelledby": "menu1"}, 
                                React.createElement("li", {role: "presentation"}, React.createElement("a", {role: "menuitem", tabindex: "-1", onClick: function() { self.handleTypeChange("string")}}, "String")), 
                                React.createElement("li", {role: "presentation"}, React.createElement("a", {role: "menuitem", tabindex: "-1", onClick: function() { self.handleTypeChange("number")}}, "Number")), 
                                React.createElement("li", {role: "presentation"}, React.createElement("a", {role: "menuitem", tabindex: "-1", onClick: function() { self.handleTypeChange("array")}}, "Array")), 
                                React.createElement("li", {role: "presentation"}, React.createElement("a", {role: "menuitem", tabindex: "-1", onClick: function() { self.handleTypeChange("object")}}, "Object"))
                            )
                        )
                    )
                ), 
                inputBox
            )
        );
    },
    updateJson: false,
    componentDidUpdate: function() {
        if(this.updateJson) {
            this.props.updateJSON();
            this.updateJson = false;
        }
    }
});

var UIJSONArray = React.createClass ({displayName: "UIJSONArray",
    getInitialState: function () {
        return ({
            elements: 1
        })
    },
    deleteElement: function(key) {
        this.setState({
            elements: this.state.elements - 1
        });
        this.updateJson = true;
    },
    addElement: function() {
        this.setState({elements: this.state.elements + 1});
    },
    getJson: function() {
        var array = [];

        // Construct the json with the children
        for(var i = 0; i < this.state.elements; i++) {
            var element = this.refs['array-element-' + i].getJson();
            array.push(element);
        }

        this.setState({oldJson: array});
        return array;

    },
    render: function() {
        var attributes = [];

        for(var i = 0; i < this.state.elements; i++) {
            attributes.push(
                React.createElement(UIJSONAttribute, {
                    updateJSON: this.props.updateJSON, 
                    ref: "array-element-" + i, 
                    keyEnabled: false, 
                    deleteAttribute: this.deleteElement})
            );
        }

        return(
            React.createElement("div", {className: "panel panel-default"}, 
                React.createElement("div", {className: "panel-body"}, 
                    attributes, 
                    React.createElement("div", {className: "col-lg-12 col-md-12 col-sm-12"}, 
                        React.createElement("button", {onClick: this.addElement, type: "button", className: "btn btn-default"}, 
                            React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}), " Add"
                        )
                    )
                )
            )
        );
    },
    updateJson: false,
    componentDidUpdate: function() {
        if(this.updateJson) {
            this.props.updateJSON();
            this.updateJson = false;
        }
    }
});

var UIJSONObject = React.createClass ({displayName: "UIJSONObject",
    getInitialState: function() {
        return({
            attributes: 1
        })
    },
    getJson: function() {
        //alert("Get json UIJSONObject");
        var json = {};

        // Construct the json with the children
        for(var i = 0; i < this.state.attributes; i++) {
            var attribute = this.refs['object-attribute-' + i].getJson();
            json = _.extend(json, attribute);
        }

        this.setState({oldJson: json});
        return json;

    },
    deleteAttribute: function(key) {
        this.setState({
            attributes: this.state.attributes - 1
        });
        this.updateJson = true;
    },
    addAttribute: function() {
        this.setState({attributes: this.state.attributes + 1});
    },
    render: function() {
        var attributes = [];

        for(var i = 0; i < this.state.attributes; i++) {
            attributes.push(
                React.createElement(UIJSONAttribute, {
                    updateJSON: this.props.updateJSON, 
                    ref: "object-attribute-" + i, 
                    keyEnabled: true, 
                    deleteAttribute: this.deleteAttribute})
            );
        }

        return(
            React.createElement("div", {className: "panel panel-default"}, 
                React.createElement("div", {className: "panel-body"}, 
                    attributes, 
                    React.createElement("div", {className: "col-lg-12 col-md-12 col-sm-12"}, 
                        React.createElement("button", {onClick: this.addAttribute, type: "button", className: "btn btn-default"}, 
                            React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"}), " Add"
                        )
                    )
                )
            )
        );
    },
    updateJson: false,
    componentDidUpdate: function() {
        if(this.updateJson) {
            this.props.updateJSON();
            this.updateJson = false;
        }
    }
});

var UIJSONRender = React.createClass ({displayName: "UIJSONRender",
    render: function() {
        return(
            React.createElement("pre", null, 
                React.createElement("code", {className: "JSON"}, 
                    JSON.stringify(this.props.json, null, 4)
                )
            )
        );
    },
    /*
    componentDidUpdate: function() {
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }
    */
});

var UIMessageSend = React.createClass ({displayName: "UIMessageSend",
    getInitialState: function() {
        return {
            application: undefined,
            instance: undefined,
            component: undefined,
            json: {}
        }
    },

    componentDidMount: function() {
        var self = this;

        notificationCenter.subscribe(Notifications.alerts.ALERT_CHANGE, function() {
            self.setState({
                application: alertsModel.application,
                instance: alertsModel.instance,
                component: alertsModel.component
            });
        });
    },
    updateJSON: function() {
        //alert("Update JSON");
        this.setState({json: this.refs.jsonObject.getJson()})
    },
    sendMessage: function() {
        alert("Send message");
        var payload = this.refs.jsonObject.getJson();
        console.log(payload);
        var channel = messageModel.channel;
        nutellaFramework.f.net.publish_to_run(this.state.application, this.state.instance, channel, payload)
    },
    render: function() {
        var self = this;

        subscription = [];

        if(this.state.application != undefined) {
            subscription.push(React.createElement("span", null, "application: ", React.createElement("span", {className: "label label-default"}, this.state.application)));
        }

        if(this.state.instance != undefined) {
            subscription.push(React.createElement("span", null, " instance: ", React.createElement("span", {className: "label label-default"}, this.state.instance)));
        }

        if(this.state.component != undefined) {
            subscription.push(React.createElement("span", null, " component: ", React.createElement("span", {className: "label label-default"}, this.state.component)));
        }

        subscription.push(React.createElement("span", null, " on channel: ", React.createElement("span", {className: "label label-default"}, messageModel.channel)));

        return (
            React.createElement("div", {className: "modal-dialog modal-messages"}, 
                React.createElement("div", {className: "modal-content"}, 
                    React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, React.createElement("span", {"aria-hidden": "true"}, "×")), 
                        React.createElement("h4", {className: "modal-title text-center", id: "myMailLabel"}, "Send message to ", subscription)
                    ), 
                    React.createElement("div", {className: "modal-body"}, 
                        React.createElement("div", {className: "col-lg-4 col-md-4 col-sm-4"}, 
                            React.createElement(UIJSONRender, {json: this.state.json})
                        ), 
                        React.createElement("div", {className: "col-lg-8 col-md-8 col-sm-8"}, 
                            React.createElement(UIJSONObject, {updateJSON: this.updateJSON, ref: "jsonObject"})
                        )
                    ), 
                    React.createElement("div", {className: "modal-footer"}, 
                        React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.sendMessage}, "Send"), 
                        React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")
                    )
                )
            )
        );
    }
});



var Resource = React.createClass({
    componentDidMount: function () {

    },
    handleParameterChange: function(event) {
        var text = $("#"+event.target.id).text();

        // Pressed return
        if(event.which == 13) {
            $("#"+event.target.id).blur();
            $("#"+event.target.id).text(text);
        }
    },
    handleUpdateParameters: function() {
        var resource = this.props.resource;
        delete resource["parameters"];

        if(resource.continuous != undefined) {
            if(resource.continuous.x != undefined) {
                var number = parseFloat($("#"+this.props.resource.rid+"_parameter_x").attr("v"));
                if(!isNaN(number))
                    resource.continuous.x = number;
            }
            if(resource.continuous.y != undefined) {
                var number = parseFloat($("#"+this.props.resource.rid+"_parameter_y").attr("v"));
                if(!isNaN(number))
                    resource.continuous.y = number;
            }
        }

        if(resource.discrete != undefined) {
            if(resource.discrete.x != undefined) {
                var value = $("#"+this.props.resource.rid+"_parameter_x").attr("v");
                value = value || $("#"+this.props.resource.rid+"_parameter_x").attr("value");
                var number = parseFloat(value);
                if(!isNaN(number))
                    resource.discrete.x = number;
                else if(value.length > 0)
                    resource.discrete.x = value;
            }
            if(resource.discrete.y != undefined) {
                var value = $("#"+this.props.resource.rid+"_parameter_y").attr("v");
                value = value || $("#"+this.props.resource.rid+"_parameter_y").attr("value");
                var number = parseFloat(value);
                if(!isNaN(number))
                    resource.discrete.y = number;
                else if(value.length > 0)
                    resource.discrete.y = value;
            }
        }

        if(resource.proximity_range != undefined) {
            var number = parseFloat($("#"+this.props.resource.rid+"_parameter_proximity").attr("v"));
            if(!isNaN(number))
                resource.proximity_range = number;
            else
                $("#"+this.props.resource.rid+"_parameter_proximity").val(resource.proximity_range);
        }
        this.props.updateResource(resource);
    },
    handleContinousPressed: function() {
        var resource = this.props.resource;
        delete resource["discrete"];
        delete resource["proximity"];
        delete resource["parameters"];
        resource.continuous = {
            x: this.props.room.x/2,
            y: this.props.room.y/2
        };
        this.props.updateResource(resource);
    },
    handleDiscretePressed: function() {
        var resource = this.props.resource;
        delete resource["parameters"];
        delete resource["continuous"];
        delete resource["proximity"];
        resource.discrete = {
            x: 0,
            y: 0
        };
        this.props.updateResource(resource);
    },
    handleProximityPressed: function() {
        var resource = this.props.resource;
        delete resource["parameters"];
        delete resource["continuous"];
        delete resource["discrete"];
        resource.proximity = {};
        this.props.updateResource(resource);
    },
    handleDisablePressed: function() {
        var resource = this.props.resource;
        delete resource["continuous"];
        delete resource["discrete"];
        delete resource["parameters"];
        this.props.updateResource(resource);
    },
    handleDeletePressed: function() {
        this.props.removeResource(this.props.resource);
    },
    handleStaticPressed: function() {
        var resource = this.props.resource;
        delete resource["parameters"];
        if(resource.type == "STATIC")
            return;

        resource.type = "STATIC";
        resource.proximity_range = 1;
        delete resource["proximity"];
        delete resource["parameters"];
        this.props.updateResource(resource);
    },
    handleDynamicPressed: function() {
        var resource = this.props.resource;
        delete resource["parameters"];
        if(resource.type == "DYNAMIC")
            return;

        resource.type = "DYNAMIC";
        delete resource["proximity_range"];
        this.props.updateResource(resource);
    },
    handleAddKey: function() {
        var key = this.refs.key.getDOMNode().value.trim();
        var value = this.refs.value.getDOMNode().value.trim();

        this.refs.key.getDOMNode().value = "";
        this.refs.value.getDOMNode().value = "";

        var resource = this.props.resource;

        resource.parameters = [];

        resource.parameters.push({key: key, value: value});

        this.props.updateResource(resource);
    },
    handleKeyEnterPressed: function(event) {
        // Pressed return
        if(event.which == 13) {
            this.handleAddKey();
        }
    },
    handleModifyKey: function(name, _key, _value) {
        var key, value, prev_key = undefined;

        var resource = this.props.resource;

        switch(name) {
            case "key":
                key = _value;
                prev_key = _key;
                value = resource.parameters[prev_key];
                break;
            case "value":
                prev_key = _key;
                key = _key;
                value = _value;
                break;
        }

        /*
        if(key == "") {
            $("#" + event.target.id.substring(0, event.target.id.length - 1) + "k").focus();
            return;
        }
        if(value == "") {
            $("#" + event.target.id.substring(0, event.target.id.length - 1) + "v").focus();
            return;
        }
        */


        resource.parameters = [];

        resource.parameters.push({key: prev_key, delete: true});
        resource.parameters.push({key: key, value: value});

        this.props.updateResource(resource);
    },
    handleDeleteKey: function(event) {
        var key = event.target.id;

        var resource = this.props.resource;

        resource.parameters = [];

        resource.parameters.push({key: key, delete: true});

        this.props.updateResource(resource);
    },
    render: function () {
        var self = this;

         var parameters = [];

         if(this.props.resource.continuous != undefined ) {

             if(this.props.resource.continuous.x != undefined) {
                 parameters.push({key: "x", value: parseFloat(this.props.resource.continuous.x).toFixed(2)});
             }

             if(this.props.resource.continuous.y != undefined) {
                 parameters.push({key: "y", value: parseFloat(this.props.resource.continuous.y).toFixed(2)});
             }
         }

        if(this.props.resource.discrete != undefined ) {

            if(this.props.resource.discrete.x != undefined) {
                var value = this.props.resource.discrete.x;

                if(!isNaN(parseInt(value))) {
                    // Reduce precision
                    value = parseInt(value);
                }

                parameters.push({key: "x", value: value});
            }

            if(this.props.resource.discrete.y != undefined) {
                var value = this.props.resource.discrete.y;

                if(!isNaN(parseInt(value))) {
                    // Reduce precision
                    value = parseInt(value);
                }

                parameters.push({key: "y", value: value});
            }
        }

         if(this.props.resource.proximity_range != undefined) {
             parameters.push({key: "proximity", value: parseFloat(this.props.resource.proximity_range).toFixed(2)});
         }



         var parameterRows = parameters.map(function (parameter, index) {
             return(
                 <tr>
                     <td className="col-md-6 col-sm-6 col-xs-6"><span>{parameter.key}</span></td>
                     <td className="col-md-6 col-sm-6 col-xs-6">
                         <InteractiveLabel
                             id={self.props.resource.rid+"_parameter_"+parameter.key}
                             onKeyPress={self.handleParameterChange}
                             onValueChange={self.handleUpdateParameters}
                             labelValue={parameter.value}
                             labelKey={parameter.key}/>
                     </td>
                 </tr>
             );
         });

        var parameterTable =
            <table className="table table-bordered table-striped table-hover" id="resource_table">
                <thead>
                    <tr>
                        <td className="col-md-6 col-sm-6 col-xs-6">Variable</td>
                        <td className="col-md-6 col-sm-6 col-xs-6">Value</td>
                    </tr>
                </thead>
                <tbody>
                    {parameterRows}
                </tbody>
            </table>;

        if(parameterRows.length == 0)
            parameterTable = [];

        var keyValueRows = [];

        if(this.props.resource.parameters != undefined) {
            keyValueRows = Object.keys(this.props.resource.parameters).map(function (key, index) {
                return (
                    <tr>
                        <td className="col-md-6 key-values">
                            <InteractiveLabel
                                id={self.props.resource.rid+"_"+key+"_k"}
                                onKeyPress={self.handleParameterChange}
                                onValueChange={self.handleModifyKey}
                                labelName="key"
                                labelValue={key}
                                labelKey={key}/>
                        </td>
                        <td className="col-md-6 key-values">
                            <InteractiveLabel
                                id={self.props.resource.rid+"_"+key+"_k"}
                                onKeyPress={self.handleParameterChange}
                                onValueChange={self.handleModifyKey}
                                labelName="value"
                                labelValue={self.props.resource.parameters[key]}
                                labelKey={key}/>
                            <button
                                type="button"
                                onClick={self.handleDeleteKey}
                                id={key} className="btn btn-default btn-xs right">
                                <span className="glyphicon glyphicon-remove" id={key} aria-hidden="true"></span>
                            </button>
                        </td>
                    </tr>
                );
            });
        }

        var type = "";

        if(this.props.resource.type == "STATIC") {
            type = <b>S</b>;
        }
        else if(this.props.resource.type == "DYNAMIC") {
            type = <b>D</b>;
        }

        var trackingSystem = "";

        if(this.props.resource.continuous != undefined) {
            trackingSystem = <i className="fa fa-arrows fa-fw"></i>;
        }
        else if(this.props.resource.discrete != undefined) {
            trackingSystem = <i className="fa fa-th-large fa-fw"></i>;
        }
        else if(this.props.resource.proximity != undefined) {
            trackingSystem = <i className="fa fa-location-arrow fa-fw"></i>;
        }
        else {
            trackingSystem = <i className="fa fa-ban fa-fw"></i>;
        }

        var model = "";
        switch(this.props.resource.model) {
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

        var proximity = {};
        if(this.props.resource.type == "DYNAMIC")
            proximity = <li onClick={this.handleProximityPressed}><a href="#"><i className="fa fa-location-arrow fa-fw"></i> Proximity</a></li>;

        return(

            <tr>
                <td className="col-md-12 col-sm-12 col-xs-12">
                    <div className="col-md-4 col-sm-4 col-xs-4">
                        <div className="vertical-center">
                            <span className={model} style={{fontSize: "20"}}></span>
                            <span>  {this.props.resource.rid}</span>
                        </div>
                    </div>

                    <div className="col-md-8 col-sm-8 col-xs-8 right">
                        <div className="btn-group">
                            <a className="btn btn-default" href="#">{trackingSystem}</a>
                            <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                                <span className="fa fa-caret-down"></span></a>
                            <ul className="dropdown-menu">
                                <li onClick={this.handleContinousPressed}><a href="#"><i className="fa fa-arrows fa-fw"></i> Continuous</a></li>
                                <li onClick={this.handleDiscretePressed}><a href="#"><i className="fa fa-th-large fa-fw"></i> Discrete</a></li>
                                {proximity}
                                {/*<li onClick={this.handleDisablePressed}><a href="#"><i className="fa fa-ban fa-fw"></i> Disable</a></li>*/}
                                <li className="divider"></li>
                                <li onClick={this.handleDeletePressed}><a href="#"><i className="fa fa-trash-o fa-fw"></i> Delete</a></li>
                            </ul>
                        </div>

                        <div className="btn-group" role="group">
                            <div className="btn-group" role="group">
                                <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                    {type}
                                    <span className="caret"></span>
                                </button>
                                <ul className="dropdown-menu" role="menu">
                                    <li onClick={this.handleStaticPressed}><a href="#"><b>S</b> Static</a></li>
                                    <li onClick={this.handleDynamicPressed}><a href="#"><b>D</b> Dynamic</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="right"  data-toggle="collapse" data-target={"#collapse-"+this.props.resource.rid}>
                            <button type="button" className="btn btn-default"><span className="glyphicon glyphicon-chevron-down" aria-hidden="true"></span></button>
                        </div>
                    </div>

                    <div className="collapse" id={"collapse-"+this.props.resource.rid}>
                        <div style={{"padding": "20px"}}>
                            {parameterTable}
                            <table className="table table-bordered table-striped table-hover" id="resource_table">
                                <thead>
                                    <tr>
                                        <td className="col-md-6 col-sm-6 col-xs-6">Key</td>
                                        <td className="col-md-6 col-sm-6 col-xs-6">Value</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keyValueRows}
                                    <tr>
                                        <form onSubmit={this.handleAddKey}>
                                            <td className="col-md-6"><input onKeyPress={this.handleKeyEnterPressed} type="text" className="form-control" placeholder="key" ref="key" /></td>
                                            <td className="col-md-6"><input onKeyPress={this.handleKeyEnterPressed} type="text" className="form-control" placeholder="value" ref="value"/></td>
                                        </form>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </td>
            </tr>
        );

    }
});


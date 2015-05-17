
var ResourceAdd = React.createClass({
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
            type = <b>S</b>;
        }
        else if(this.state.type == "DYNAMIC") {
            type = <b>D</b>;
        }

        var proximity = {};
        if(this.state.type == "DYNAMIC")
            proximity = <li onClick={this.handleTrackingProximity}><a href="#"><i className="fa fa-location-arrow fa-fw"></i> Proximity</a></li>;

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
            <div className="col-md-12 col-sm-12 col-xs-12 table-responsive table_container animated" style={{"overflowX": "hide", height: this.props.tableHeight}}>
                <table className="table table-bordered table-striped table-hover" id="resource_table" style={{"overflowX": "visible"}}>
                    <thead onClick={_.partial(this.props.showTable, "table.addResource")} className="pointer">
                        <tr>
                            <th className="col-md-12 col-sm-12 col-xs-12 text-center">Add resource</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="col-md-12 col-sm-12 col-xs-12">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="col-md-4 col-sm-4 col-xs-4">
                                        <input type="text" className="form-control" placeholder="resource-id" value={this.state.name} onChange={this.handleChangeName}/>
                                    </div>

                                    <div className="btn-group">
                                        <a className="btn btn-default" href="#"><i className={"fa " + model + " fa-fw"}></i></a>
                                        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                                            <span className="fa fa-caret-down"></span>
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li onClick={this.handleChangeModelIMAC}><a href="#"><i className="icon-iMac"></i> iMac</a></li>
                                            <li onClick={this.handleChangeModelIPHONE}><a href="#"><i className="icon-iPhone"></i> iPhone</a></li>
                                            <li onClick={this.handleChangeModelIPAD}><a href="#"><i className="icon-iPad"></i> iPad</a></li>
                                            <li onClick={this.handleChangeModelIBEACON}><a href="#"><i className="icon-iBeacon"></i> iBeacon</a></li>
                                            <li onClick={this.handleChangeModelADISPLAY}><a href="#"><i className="icon-aDisplay"></i> Ambient Display</a></li>
                                            <li onClick={this.handleChangeModelTTABLE}><a href="#"><i className="icon-tTable"></i> Touch Table</a></li>
                                            <li onClick={this.handleChangeModelOTHER}><a href="#"><i className="icon-other"></i> Other</a></li>
                                        </ul>
                                    </div>

                                    <div className="btn-group">
                                        <a className="btn btn-default" href="#"><i className={"fa " + tracking + " fa-fw"}></i></a>
                                        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                                            <span className="fa fa-caret-down"></span>
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li onClick={this.handleChangeTrackingContinuous}><a href="#"><i className="fa fa-arrows fa-fw"></i> Continuous</a></li>
                                            <li onClick={this.handleChangeTrackingDiscrete}>  <a href="#"><i className="fa fa-th-large fa-fw"></i> Discrete</a></li>
                                            {proximity}
                                            <li onClick={this.handleChangeTrackingNone}>      <a href="#"><i className="fa fa-ban fa-fw"></i> Disabled</a></li>
                                        </ul>
                                    </div>

                                    <div className="btn-group" role="group">
                                        <div className="btn-group" role="group">
                                            <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                                {type}
                                                <span className="caret"></span>
                                            </button>
                                            <ul className="dropdown-menu" role="menu">
                                                <li onClick={this.handleChangeTypeStatic}> <a href="#"><b>S</b> Static</a></li>
                                                <li onClick={this.handleChangeTypeDynamic}><a href="#"><b>D</b> Dynamic</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <button onClick={this.handleSubmit} type="button" className="btn btn-default right">
                                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
});

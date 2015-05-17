var Discrete = React.createClass({
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
                <div className="col-md-12 col-sm-12 col-xs-12 table-responsive table_container animated" style={{overflowX: "hide", height: this.props.tableHeight}}>
                    <table className="table table-bordered table-striped table-hover" id="resource_table" style={{overflowX: "visible"}}>
                        <thead onClick={_.partial(this.props.showTable, "table.discrete")} className="pointer">
                        <tr>
                            <th className="col-md-12 col-sm-12 col-xs-12 text-center">Discrete Tracking</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="col-md-12 col-sm-12 col-xs-12">

                                <div className="col-md-4 col-sm-4 col-xs-4 btn-group">
                                    <a className="btn btn-default" onClick={this.handleEnable}><i className="fa fa-ban fa-fw"></i></a>
                                    <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                                        <span className="fa fa-caret-down"></span></a>
                                    <ul className="dropdown-menu">
                                        <li><a onClick={self.handleEnable}><i className="fa fa-th-large fa-fw"></i> Enabled</a></li>
                                        <li><a onClick={self.handleDisable}><i className="fa fa-ban fa-fw"></i> Disabled</a></li>
                                    </ul>
                                </div>
                                <div className="col-md-8 col-sm-8 col-xs-8" style={{marginTop: "6px"}}>Discrete tracking system disabled</div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
        else {
            var t_x = "";
            var t_y = "";
            switch(self.state.tracking.t_x) {
                case 'NUMBER':
                    t_x = <b>NUMBER</b>;
                    break;
                case 'LETTER':
                    t_x = <b>LETTER</b>;
                    break;
            }
            switch(self.state.tracking.t_y) {
                case 'NUMBER':
                    t_y = <b>NUMBER</b>;
                    break;
                case 'LETTER':
                    t_y = <b>LETTER</b>;
                    break;
            }

            return(
                <div className="col-md-12 col-sm-12 col-xs-12 table-responsive table_container animated" style={{overflowX: "hide", height: this.props.tableHeight}}>
                    <table className="table table-bordered table-striped table-hover" id="resource_table" style={{overflowX: "visible"}}>
                        <thead onClick={_.partial(this.props.showTable, "table.discrete")} className="pointer">
                        <tr>
                            <th className="col-md-12 col-sm-12 col-xs-12 text-center">Discrete Tracking</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="col-md-12 col-sm-12 col-xs-12">

                                <div className="col-md-4 col-sm-3 col-xs-4 btn-group">
                                    <a className="btn btn-default" onClick={this.handleDisable}><i className="fa fa-th-large fa-fw"></i></a>
                                    <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                                        <span className="fa fa-caret-down"></span></a>
                                    <ul className="dropdown-menu">
                                        <li><a onClick={self.handleEnable}><i className="fa fa-th-large fa-fw"></i> Enabled</a></li>
                                        <li><a onClick={self.handleDisable}><i className="fa fa-ban fa-fw"></i> Disabled</a></li>
                                    </ul>
                                </div>


                                <div className="right"  data-toggle="collapse" data-target="#collapseExample2">
                                    <button type="button" className="btn btn-default"><span className="glyphicon glyphicon-chevron-down" aria-hidden="true"></span></button>
                                </div>

                                <div className="collapse" id="collapseExample2">
                                    <div style={{marginTop: "20px", padding: "10px"}}>
                                        <table className="table table-bordered table-striped table-hover" id="resource_table">
                                            <tbody>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6"><span id="A3">X number</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    {
                                                        /*
                                                        <span contentEditable="true"
                                                              onKeyUp={self.handleKeyPress}
                                                              onBlur={self.handleBlur}
                                                              ref="n_x">
                                                        {self.state.tracking.n_x}
                                                        </span>
                                                        */
                                                    }
                                                    <InteractiveLabel
                                                        onKeyPress={self.handleKeyPress}
                                                        onValueChange={self.handleModifyAttribute}
                                                        labelName="value"
                                                        labelValue={self.state.tracking.n_x}
                                                        labelKey="n_x"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6"><span id="A3">Y number</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <InteractiveLabel
                                                        onKeyPress={self.handleKeyPress}
                                                        onValueChange={self.handleModifyAttribute}
                                                        labelName="value"
                                                        labelValue={self.state.tracking.n_y}
                                                        labelKey="n_y"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6"><span id="A3">Width</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <InteractiveLabel
                                                        onKeyPress={self.handleKeyPress}
                                                        onValueChange={self.handleModifyAttribute}
                                                        labelName="value"
                                                        labelValue={self.state.tracking.width.toFixed(2)}
                                                        labelKey="width"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6"><span id="A3">Height</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <InteractiveLabel
                                                        onKeyPress={self.handleKeyPress}
                                                        onValueChange={self.handleModifyAttribute}
                                                        labelName="value"
                                                        labelValue={self.state.tracking.height.toFixed(2)}
                                                        labelKey="height"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6"><span id="A3">X origin</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <InteractiveLabel
                                                        onKeyPress={self.handleKeyPress}
                                                        onValueChange={self.handleModifyAttribute}
                                                        labelName="value"
                                                        labelValue={self.state.tracking.x.toFixed(2)}
                                                        labelKey="x"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6"><span id="A3">Y origin</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <InteractiveLabel
                                                        onKeyPress={self.handleKeyPress}
                                                        onValueChange={self.handleModifyAttribute}
                                                        labelName="value"
                                                        labelValue={self.state.tracking.y.toFixed(2)}
                                                        labelKey="y"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6" style={{height: "48px"}}><span id="A3">X type</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <div className="btn-group dropup">
                                                        <a className="btn btn-default btn-sm" href="#">{t_x}</a>
                                                        <a className="btn btn-default dropdown-toggle btn-sm" data-toggle="dropdown" href="#">
                                                            <span className="fa fa-caret-up"></span></a>
                                                        <ul className="dropdown-menu">
                                                            <li><a onClick={function(){self.handleTypeChange('t_x', 'NUMBER')}}><b>N</b> Number</a></li>
                                                            <li><a onClick={function(){self.handleTypeChange('t_x', 'LETTER')}}><b>L</b> Letter</a></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="col-md-6 col-sm-6 col-xs-6" style={{height: "48px"}}><span id="A3">Y type</span></td>
                                                <td className="col-md-6 col-sm-6 col-xs-6">
                                                    <div className="btn-group dropup">
                                                        <a className="btn btn-default btn-sm" href="#">{t_y}</a>
                                                        <a className="btn btn-default dropdown-toggle btn-sm" data-toggle="dropdown" href="#">
                                                            <span className="fa fa-caret-up"></span></a>
                                                        <ul className="dropdown-menu">
                                                            <li><a onClick={function(){self.handleTypeChange('t_y', 'NUMBER')}}><b>N</b> Number</a></li>
                                                            <li><a onClick={function(){self.handleTypeChange('t_y', 'LETTER')}}><b>L</b> Letter</a></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    }
});

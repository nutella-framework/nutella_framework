
var React = require('react');
var Mui = require('material-ui');
var TextField = Mui.TextField;
var RaisedButton = Mui.RaisedButton;
var NUTELLA = require('nutella_lib');

var BrokerPage = React.createClass({

    componentWillMount: function() {
        this.updateDimensions();
    },

    componentDidMount: function() {
        window.addEventListener("resize", this.updateDimensions);
    },

    componentWillUnmount: function() {
        window.removeEventListener("resize", this.updateDimensions);
    },

    updateDimensions: function() {
        this.setState({innerHeight: window.innerHeight});
    },

    handleSetBroker: function() {
        var self = this;
        var broker = this.refs.textFieldBroker.getValue();

        if(broker.length !== 0) {

            // Start nutella
            window.nutella = NUTELLA.init(broker, 'app_id', 'run_id', 'login-screens', function(connected) {
                if(connected) {

                    var callback = function() {
                        if(!self.state.app_ids) {
                            self.setErrorText('Invalid broker.');
                        } else {
                            window.ReactMain.login.broker = broker;
                            self.props.onSwitchPage(2, {app_ids: self.state.app_ids});
                        }
                    };

                    nutella.net.request('runs_list', 'req', function (response) {
                        var app_ids = [];
                        for (var app_id in response) {
                            if (response.hasOwnProperty(app_id)) {
                                app_ids.push(app_id);
                            }
                        }
                        self.setState({
                            app_ids: app_ids
                        }, callback);
                    });

                } else {
                    self.setErrorText('Invalid broker.');
                }
            });

        } else {
            this.setErrorText('You must set a broker.');
        }
    },

    getInitialState: function () {
        return  {
            errorText: null,
            innerHeight: window.innerHeight,
            app_ids: undefined
        }
    },

    setErrorText: function(value) {
        this.setState({
            errorText: value
        });
    },

    validateInput:  function() {
        var input = this.refs.textFieldBroker.getValue();
        if (input.length === 0) {
            this.setErrorText('You must set a broker.');
        } else {
            this.setErrorText(null);
        }
    },

    render: function () {
        var self = this;

        var titlesDivStyle = {
            height: this.state.innerHeight * (0.4)
        };

        var gridDivStyle = {
            height: this.state.innerHeight * (0.6)
        };

        return (

            <div className='main-div' >

                <div className='titles-div' style={titlesDivStyle} >

                    <span className='title' > RoomCast login </span>
                    <span className='title' > broker: </span>

                </div>

                <div className='broker-div titles-div' style={gridDivStyle} >

                    <div className='text-field-broker'>
                        <TextField
                            ref='textFieldBroker'
                            hintText={'broker IP address'}
                            multiLine={false}
                            errorText={this.state.errorText}
                            onChange={this.validateInput} />
                    </div>

                </div>

                <div className='submit-broker'>
                    <RaisedButton
                        label='Submit'
                        secondary={true}
                        onTouchTap={this.handleSetBroker} />
                </div>

            </div>

        );
    }

});

module.exports = BrokerPage;

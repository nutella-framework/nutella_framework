
var React = require('react');
var Mui = require('material-ui');
var IdentitiesGrid = require('./IdentitiesGrid');

var BrokerPage = require('./BrokerPage');
var AppIdPage = require('./AppIdPage');
var RunIdPage = require('./RunIdPage');
var NUTELLA = require('nutella_lib');

var Main = React.createClass({

    componentDidMount: function() {
        var broker = 'ltg.evl.uic.edu';
        this.initWithBroker(broker);
    },

    initWithBroker: function(broker) {
        var self = this;

        // Start nutella
        window.nutella = NUTELLA.init(broker, 'app_id', 'run_id', 'login', function(connected) {
            if(connected) {

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

                var callback = function() {
                    if(!self.state.app_ids) {
                        console.log('Invalid broker.');
                    } else {
                        window.ReactMain.login.broker = broker;
                    }
                };

            } else {
                console.log('Invalid broker.');
            }
        });
    },

    getInitialState: function () {
        return  {
            identities: [],
            page: 2,
            app_ids: undefined,
            app_id: undefined
        }
    },

    setIdentities: function(ids) {
        this.setState({
            identities: ids
        });
    },

    setPage: function(page) {
        this.setState({
            page: page
        });
    },

    handleSwitchPage: function(page, params) {
        this.setPage(page);
        if(params) {
            if(params.app_ids) {
                this.setState({
                    app_ids: params.app_ids
                });
            }
            if(params.app_id) {
                this.setState({
                    app_id: params.app_id
                });
            }
        }
    },

    handleLogin: function(params) {
      this.props.onSwitchPage(2, params);
    },

    render: function () {

        var page = null;
        switch(this.state.page) {
            case 1:
                page = <BrokerPage
                    onSwitchPage={this.handleSwitchPage} />;
                break;
            case 2:
                page = <AppIdPage
                    onSwitchPage={this.handleSwitchPage}
                    values={this.state.app_ids}
                    initWithBroker={this.initWithBroker} />;
                break;
            case 3:
                page = <RunIdPage
                    onSwitchPage={this.handleSwitchPage}
                    app_id={this.state.app_id}
                    values={[]}
                    onLogin={this.handleLogin} />;
                break;
            default:
        }

        return page;
    }

});

module.exports = Main;

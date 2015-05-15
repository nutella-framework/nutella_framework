
var React = require('react');
var Mui = require('material-ui');
var ActivitiesGrid = require('./ActivitiesGrid');
var Footer = require('./Footer');

var Main = React.createClass({

    componentDidMount: function() {
        var self = this;

        // Get current configs
        nutella.net.request('configs/retrieve', 'all', function (response) {
            self.setConfigs(response);

            // Subscribe for future changes
            nutella.net.subscribe('configs/updated', function (message, from) {
                self.setConfigs(message);

            });

            // Get current selected config
            nutella.net.request('currentConfig/retrieve', '', function (response) {
                self.setCurrentConfig(response);

                // Subscribe for future changes
                nutella.net.subscribe('currentConfig/ack_updated', function (message, from) {
                    self.setCurrentConfig(message);
                });

            });

        });
    },

    getInitialState: function () {
        return  {
            currentConfig: '1',
            configs: []
        }
    },

    setConfigs: function(configs) {
        this.setState({
            configs: configs
        });
    },

    setCurrentConfig: function(config) {
        this.setState({
            currentConfig: config
        });
    },

    render: function () {

        return (

            <div className='main-div' >

                <ActivitiesGrid
                    configs={this.state.configs}
                    currentConfig={this.state.currentConfig} />

                <Footer />

            </div>

        );
    }

});

module.exports = Main;

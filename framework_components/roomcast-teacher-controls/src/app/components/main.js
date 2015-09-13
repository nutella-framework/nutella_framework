
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

                // Get current selected config
                nutella.net.request('launchTime/retrieve', '', function (time) {
                    self.setTimer(time, self.updateTimer);

                    // Subscribe for future changes
                    nutella.net.subscribe('launchTime/updated', function (time, from) {
                        self.setTimer(time, self.updateTimer);
                    });

                });

            });

        });
    },

    getInitialState: function () {
        return  {
            currentConfig: '1',
            timer: null,
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

    /**
     * Computes duration from absolute times and stores in state.
     * @param time
     */
    setTimer: function(time) {
        var self = this;

        var callback = function() {
            window.clearInterval(self._timeoutId);
            var action = function() {
                self.updateTimer(self.state.timer + 1000);
            };
            self._timeoutId = setInterval(action, 1000);
        };

        var now = new Date().getTime();
        var then = new Date(time).getTime();
        var duration = now - then;
        if(duration < 100) {
            duration = 0;
        }
        if(callback) {
            this.setState({
                timer: duration
            }, callback);
        } else {
            this.setState({
                timer: duration
            });
        }
    },

    updateTimer: function(t) {
        this.setState({
            timer: t
        });
    },

    render: function () {

        return (

            <div className='main-div' >

                <ActivitiesGrid
                    configs={this.state.configs}
                    currentConfig={this.state.currentConfig}
                    timer={this.state.timer} />

                <Footer />

            </div>

        );
    }

});

module.exports = Main;

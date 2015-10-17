var React = require('react'),
    mui = require('material-ui'),
    RaisedButton = mui.RaisedButton,
    NutellaMixin = require('./NutellaMixin');

var ResourcesPanel = require('./ResourcesPanel.js');
var ChannelsPanel = require('./ChannelsPanel');

var Main = React.createClass({

    mixins: [NutellaMixin],

    componentDidMount: function() {
        var self = this;
        self._cookie = (+new Date * Math.random()).toString(36).substring(0, 15);
        // Get current channels catalogue
        nutella.net.request('channels/retrieve', 'all', function (response) {
            self.handleUpdatedChannelsCatalogue(response);
            self.nutellaRequestConfigs();

            nutella.net.subscribe('channels/updated', function (message, from) {
                self.handleUpdatedChannelsCatalogue(message);
            });
            nutella.net.subscribe('configs/updated', function (message, from) {
                // workaround to manage sync between multiple parallell changes: reload page
                // on all the interfaces other than the one which has saved the changes
                if(self.getCookie('roomcast-id') !== self._cookie) {
                    window.location.reload(true);
                }
                // reset local cookie
                self._cookie = (+new Date * Math.random()).toString(36).substring(0, 15);
            });
        });
    },

    /**
     * @state selectedChannel: the current selected channel from UI
     * @state configs: the list of configurations fetched from server
     * @state currentConfig: the current selected configuration, also called 'mapping'
     * @state channelsCatalogue: the list of available channels fetched from server
     */
    getInitialState: function() {
        return {
            selectedChannel: null,
            configs: [],
            currentConfigId: null,
            currentConfig: [],
            channelsCatalogue: {}
        };
    },

    nutellaRequestConfigs: function() {
        var self = this;
        nutella.net.request('configs/retrieve', 'all', function(response) {
            self.handleNewConfigs(response);
        });
    },

    handleNewConfigs: function(response) {
        this.handleUpdatedConfigs(response);
        this.handleUpdatedCurrentConfigId(+Object.keys(response)[Object.keys(response).length - 1]);
        this.handleUpdatedCurrentConfig(response[Object.keys(response)[Object.keys(response).length - 1]].mapping)
    },

    handleSelection: function(selectedChannel) {
        this.setState({
            selectedChannel: selectedChannel
        });
    },

    handleUpdatedConfigs: function(configs, publish) {
        var self = this;
        var callback = function() {
            if(publish) {
                nutella.net.publish('configs/update', self.state.configs);
            }
        };
        this.setState({
            configs: configs
        }, callback());
    },

    handleUpdatedCurrentConfigId: function(id) {
        this.setState({
            currentConfigId: id
        });
    },

    handleUpdatedCurrentConfig: function(config) {
        this.setState({
            currentConfig: config
        });
    },

    handleUpdatedChannelsCatalogue: function(cat) {
        this.setState({
            channelsCatalogue: cat
        });
    },

    handleSaveChanges: function() {
        var publish = true;
        this.saveLocalConfigs(publish);
        // identify current device when message comes back
        this._cookie = (+new Date * Math.random()).toString(36).substring(0, 15);
        this.setCookie('roomcast-id', this._cookie, 365);

        // #LOG action
        this.logAction('savePackageCreator', {
            configuration: this.state.configs,
            channels_catalogue: this.state.channelsCatalogue
        });
    },

    handleUndoChanges: function() {
        //this.nutellaRequestConfigs();
        window.location.reload(true);
    },

    handleAddRow: function(family) {
        var mapping = this.state.currentConfig;
        var newMapping = [];
        mapping.forEach(function(f) {
            if(f.family === family) {
                f.items.push({name:'', channels:[]});
            }
            newMapping.push(f);
        });
        this.handleUpdatedCurrentConfig(newMapping);
    },

    /**
     * Synchronizes the local copy of the current mapping with the shared state configs
     * @param publish true if you also want to save the changes to the server
     */
    saveLocalConfigs: function(publish) {
        var configs = this.state.configs;
        configs[this.state.currentConfigId].mapping = this.state.currentConfig;
        if (publish) {
            this.handleUpdatedConfigs(configs, publish);
        } else {
            this.handleUpdatedConfigs(configs);
        }
    },

    handleChangeConfig: function(configId) {

        // update local configs copy
        this.saveLocalConfigs();

        // update current local configuration to selected one
        this.handleUpdatedCurrentConfigId(configId);
        this.handleUpdatedCurrentConfig(this.state.configs[configId].mapping)
    },

    handleDeleteConfig: function(configId) {
        var configs = this.state.configs;
        delete configs[configId];
        this.handleUpdatedConfigs(configs);
    },

    handleAddEmptyConfig: function(configName) {
        var configs = this.state.configs;
        var newConfigId = 1;

        // Find max id
        if(configs.length !== 0) {
            var ids = [];
            for (var c in configs) {
                if (configs.hasOwnProperty(c)) {
                    ids.push(+c);
                }
            }
            newConfigId = Math.max.apply(null, ids) + 1;
        }

        // Save current config
        this.saveLocalConfigs();

        // Add new config
        configs[newConfigId] = {
            "name": configName,
            "mapping": [{
                "family": "Public",
                "items": [{
                    "name": "",
                    "channels": []
                }]
            }, {
                "family": "Personal",
                "items": []
            }]
        };
        this.handleUpdatedConfigs(configs);

        // Update current local configuration to selected one
        this.handleUpdatedCurrentConfigId(newConfigId);
        this.handleUpdatedCurrentConfig(this.state.configs[newConfigId].mapping)
    },

    handleUpdateConfigName: function(id, value) {
        var configs = this.state.configs;
        configs[id].name = value;
        this.handleUpdatedConfigs(configs);
    },

    render: function () {

        return (
            <div className='outer-div'>

                <ResourcesPanel
                    configs={this.state.configs}
                    mapping={this.state.currentConfig}
                    onUpdatedMapping={this.handleUpdatedCurrentConfig}
                    channels={this.state.channelsCatalogue}
                    selectedChannel={this.state.selectedChannel}
                    onSelectedChannel={this.handleSelection}
                    onAddRow={this.handleAddRow}
                    onChangeConfig={this.handleChangeConfig}
                    onDeleteConfig={this.handleDeleteConfig}
                    onAddEmptyConfig={this.handleAddEmptyConfig}
                    onUpdateConfigName={this.handleUpdateConfigName} />

                <ChannelsPanel
                    ref={'channelsPanel'}
                    channels={this.state.channelsCatalogue}
                    selectedChannel={this.state.selectedChannel}
                    onSelectedChannel={this.handleSelection}
                    onSaveChanges={this.handleSaveChanges}
                    onUndoChanges={this.handleUndoChanges} />

            </div>
        );
    }

});

module.exports = Main;
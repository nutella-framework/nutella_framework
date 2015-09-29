var React = require('react');
var Mui = require('material-ui');
var NutellaMixin = require('./NutellaMixin');
var Paper = Mui.Paper;
var DropDownMenu = require('./material-ui/drop-down-menu.jsx');

/**
 */
var ConfigurationsPanel = React.createClass({

    mixins: [NutellaMixin],

    componentDidMount: function() {
        var self = this;
        self.didReceivedFirstConfigs = false;
        self.lastSavedNames = {};

        // Subscribe for future changes
        nutella.net.subscribe('configs/update', function (message, from) {
            if(message.length !== 0) {
                self.updatePlaceholders(message);
            }
        });
    },

    componentWillReceiveProps: function() {
        if(!this.didReceivedFirstConfigs && this.props.configs.length !== 0) {
            // Set initial placeholders
            this.updatePlaceholders(this.props.configs);
            this.didReceivedFirstConfigs = true;
        }
    },

    updatePlaceholders: function(configs) {
            for (var c in configs) {
                if (configs.hasOwnProperty(c)) {
                    this.lastSavedNames[c] = configs[c].name;
                }
            }
    },

    shouldComponentUpdate: function() {
        return this.props.configs.length !== 0;
    },

    handleChangeConfig: function(e, selectedIndex, menuItem) {
        this.props.onChangeConfig(menuItem.configId);
    },

    handleDeleteConfig: function(menuItem) {
        this.props.onDeleteConfig(menuItem.configId);
    },

    handleInputChange: function(id, value) {
        this.props.onUpdateConfigName(id, value);
    },

    render: function() {
        var self = this;
        var dropdown = null;
        var menuItems = [];

        var configs = this.props.configs;
        if(configs.length !== 0) {
            var ids = [];
            for(var c in configs) {
                if(configs.hasOwnProperty(c)) {
                    ids.push(+c);
                }
            }

            function sortNumber(a,b) {
                return b - a;
            }
            ids.sort(sortNumber);

            ids.forEach(function(id, i) {
                menuItems.push({configId: id, text: configs[id].name, lastSavedName: self.lastSavedNames[id]});
            });

            // Add last item: new configuration
            menuItems.push({configId: 0, text: '', lastSavedName: 'Add activity'});

            dropdown = (<DropDownMenu
                menuItems={menuItems}
                configMenu={true}
                autoWidth={false}
                onChange={this.handleChangeConfig}
                onDeleteConfig={this.handleDeleteConfig}
                onAddEmptyConfig={this.props.onAddEmptyConfig}
                onInputChange={this.handleInputChange} />);
        }

        return (
            <div className='configurations-panel-div'>

                <Paper>

                    <span className='config-title'> Activity: </span>

                {dropdown}

                </Paper>

            </div>);

    }

});

module.exports = ConfigurationsPanel;


var React = require('react');
var ResourceFamilyPool = require('./ResourceFamilyPool');
var ConfigurationsPanel = require('./ConfigurationsPanel');

var ResourcesPanel = React.createClass({

    handleSelectedChannel: function(ch) {
        this.props.onSelectedChannel(ch);
    },

    handleUpdatedMapping: function(familyMapping) {

        // create new object to update complete data structure (RESOURCES)
        var mapping = [];
        this.props.mapping.forEach(function(family) {
            if(family.family===familyMapping.family) {
                mapping.push(familyMapping);
            } else {
                mapping.push({
                    family: family.family,
                    items: family.items
                });
            }
        });

        this.props.onUpdatedMapping(mapping);
    },

    handleAddRow: function(family) {
        this.props.onAddRow(family);
    },

    handleUpdateConfigName: function(id, value) {
        this.props.onUpdateConfigName(id, value);
    },

    render: function(){

        var {...other} = this.props;

        var self=this;
        var pools = [];
        var channels = this.props.channels;
        this.props.mapping.forEach(function(family, i) {
            pools.push(<ResourceFamilyPool
                    key={i}
                    mapping={self.props.mapping}
                    familyName={family.family}
                    resourcesWithChannels={family.items}
                    channels={channels}
                    selectedChannel={self.props.selectedChannel}
                    onSelectedChannel={self.handleSelectedChannel}
                    onUpdatedMapping={self.handleUpdatedMapping}
                    onAddRow={self.handleAddRow} />
            );
        });

        return (
            <div className="resources-panel">

                <ConfigurationsPanel
                    configs={this.props.configs}
                    onChangeConfig={this.props.onChangeConfig}
                    onDeleteConfig={this.props.onDeleteConfig}
                    onAddEmptyConfig={this.props.onAddEmptyConfig}
                    onUpdateConfigName={this.handleUpdateConfigName} />

                {pools}

            </div> );
    }

});

module.exports = ResourcesPanel;


var React = require('react');
var PoolHeader = require('./PoolHeader');
var PoolRow = require('./PoolRow');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var ButtonInteractionsMixin = require('./ButtonInteractionsMixin');
var d3 = require('d3');

var ResourceFamilyPool = React.createClass({

    mixins: [ButtonInteractionsMixin],

    handleAddRow: function() {
        this.props.onAddRow(this.props.familyName);
    },

    handleSelectedChannel: function(ch) {
        this.props.onSelectedChannel(ch);
    },

    handleRemovedAllChannels: function() {
        var familyItems=[];
        this.props.resourcesWithChannels.forEach(function(res) {
            familyItems.push({
                name: res.name,
                channels: []
            });
        });
        this.handleUpdatedFamily(familyItems);
    },

    handleAddedChannelToPool: function(chId) {
        var self=this;
        var familyItems=[];
        this.props.resourcesWithChannels.forEach(function(res) {
            var newChannels = self.insertNewChannel(res.channels, chId);
            familyItems.push({
                name: res.name,
                channels: newChannels
            });
        });
        this.handleUpdatedFamily(familyItems);
    },

    handleRemovedChannelFromPool: function(chId) {
        var self=this;
        var familyItems=[];
        this.props.resourcesWithChannels.forEach(function(res) {
            var newChannels = self.removeChannel(res.channels, chId);
            familyItems.push({
                name: res.name,
                channels: newChannels
            });
        });
        this.handleUpdatedFamily(familyItems);
    },

    /**
     * Handles updates at row level and pushes them upwards.
     * @param resourceMapping
     * @param rowIndex
     */
    handleUpdatedMapping: function(resourceMapping, rowIndex) {

        // create new object for single family of resources
        var familyItems = [];
        var added = false;
        if(rowIndex != null) {
            this.props.resourcesWithChannels.forEach(function(item, i) {
                if(i===rowIndex) {
                    familyItems.push(resourceMapping);
                    added = true;
                } else {
                    familyItems.push({
                        name: item.name,
                        channels: item.channels
                    });
                }
            });
        } else {
            // handle new empty row
            if(!added) {
                familyItems.push(resourceMapping);
            }
        }
        this.handleUpdatedFamily(familyItems);
    },

    /**
     * Wraps the items and pushes new data upwards.
     * @param familyItems
     */
    handleUpdatedFamily: function(familyItems) {
        var familyMapping = {
            family: this.props.familyName,
            items: familyItems
        };
        this.props.onUpdatedMapping(familyMapping);
    },

    handleDeleteRow: function(rowIndex) {
        var familyItems = [];
        this.props.resourcesWithChannels.forEach(function(item, i) {
            if(i!==rowIndex) {
                familyItems.push(item)
            }
        });
        this.handleUpdatedFamily(familyItems);
    },

    render: function(){

        var self=this;
        var rows=[];
        var i = 0;
        this.props.resourcesWithChannels.forEach(function(resource) {
            rows.push(<PoolRow
                    mapping={self.props.mapping}
                    resourceWithChannels={resource}
                    channels={self.props.channels}
                    selectedChannel={self.props.selectedChannel}
                    onSelectedChannel={self.handleSelectedChannel}
                    onUpdatedMapping={self.handleUpdatedMapping}
                    onDeleteRow={self.handleDeleteRow}
                    rowIndex={i} />
            );
            i++;
        });

        return (

            <div className="resource-family-pool">

                <Paper>

                    <table>

                        <thead>

                            <PoolHeader familyName={this.props.familyName}
                                selectedChannel={self.props.selectedChannel}
                                onRemovedAllChannels={this.handleRemovedAllChannels}
                                onAddedChannelToPool={this.handleAddedChannelToPool}
                                onRemovedChannelFromPool={this.handleRemovedChannelFromPool} />

                        </thead>

                        <tbody>

                            {rows}
                            <tr className='pool-row pool-add-row' ref={this.props.familyName + 'pool'} onTouchTap={this.handleAddRow}> <td colSpan='4'> Add Row </td> </tr>

                        </tbody>

                    </table>

                </Paper>


            </div> );

    }

});

module.exports = ResourceFamilyPool;


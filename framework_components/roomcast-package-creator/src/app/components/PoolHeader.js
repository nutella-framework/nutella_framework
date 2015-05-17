var React = require('react');
var Mui = require('material-ui');
var RaisedButton_ = require('./material-ui/raised-button_.jsx');
var ContextButton = require('./ContextButton');
var GlobalButton = require('./GlobalButton');

/**
 * @prop familyName
 * @prop selectedChannel
 * @prop onRemovedAllChannels
 * @prop onAddedChannelToPool
 * @prop onRemovedChannelFromPool
 */
var PoolHeader = React.createClass({

    handleAddedChannel: function(chId) {
        this.props.onAddedChannelToPool(chId);
    },

    handleRemovedChannel: function(chId) {
        this.props.onRemovedChannelFromPool(chId);
    },

    handleRemovedChannels: function() {
        this.props.onRemovedAllChannels();
    },

    render: function() {

        var buttonStyle = {
            marginRight:'10px'
        };

        var buttonAdd, buttonRemove, headerButtons;
        if(this.props.selectedChannel) {
            buttonAdd = <ContextButton
                type='add'
                onAddedChannel={this.handleAddedChannel}
                selectedChannel={this.props.selectedChannel} />;
            buttonRemove = <ContextButton
                type='remove'
                onRemovedChannel={this.handleRemovedChannel}
                selectedChannel={this.props.selectedChannel} />;
            headerButtons = <th>
                    {buttonAdd}
                    {buttonRemove}
            </th>
        } else {
            buttonRemove = <GlobalButton type='remove' onRemovedChannels={this.handleRemovedChannels} />;
            headerButtons = <th>
                    {buttonRemove}
            </th>
        }

        return (

            <tr className='pool-header'>
                <th></th>
                <th> {this.props.familyName} </th>
                    {headerButtons}
                <th></th>
            </tr>);

    }
});

module.exports = PoolHeader;
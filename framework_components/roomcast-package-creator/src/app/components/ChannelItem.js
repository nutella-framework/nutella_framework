var React = require('react');
var Mui = require('material-ui');
var d3 = require('d3');
var Paper = Mui.Paper;

/**
 * @prop id
 * @prop name
 * @prop imgPath
 * @prop onSelectedChannel
 * @prop currentSelectedChannel
 * @prop belongsTo
 */
var ChannelItem = React.createClass({

    /**
     * Manages the interactions with the channels.
     */
    handleSelectedChannel: function() {

        var imgNode = this.refs.channelIcon.getDOMNode();
        var currentSelected = this.props.currentSelectedChannel;

        if(currentSelected && currentSelected.imgNode && currentSelected.id === this.props.id && currentSelected.imgNode == imgNode) {

            // set not selected
            this.props.onSelectedChannel(null);

        } else {

            // set selected channel (state)
            var newSelected = {
                id: this.props.id,
                belongsTo: this.props.belongsTo,
                imgNode: imgNode,
                channel: this,
                channelData: this.props.channelData
            };
            this.props.onSelectedChannel(newSelected);
        }

    },

    render: function() {

        var iconStyle = {
            backgroundColor: this.props.channelData.icon
        };

        // style channels in resources list
        if(this.props.belongsTo==='resources') {
            var currentSelected = this.props.currentSelectedChannel;
            if(currentSelected && (currentSelected.channel == this) && currentSelected.id === this.props.id) {
                iconStyle.border = '3px solid black';
            }

        }

        return (
            <div className='channel-item' onClick={this.handleSelectedChannel}>
                <div className='channel-icon' ref='channelIcon' style={iconStyle} > </div>
                <span> {this.props.name} </span>
            </div>
        );

    }

});

module.exports = ChannelItem;


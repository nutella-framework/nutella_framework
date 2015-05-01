var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;

/**
 * @prop selectedChannel
 * @prop channels
 */
var ChannelCard = React.createClass({

    handleSelectCard: function() {

        if(this.props.currentSelectedChannel && this.props.currentSelectedChannel.id === this.props.channelId) {
            this.props.onSelectedChannel(null);
        } else {
            // set selected channel (state)
            var newSelected = {
                id: this.props.channelId,
                belongsTo: 'channels',
                imgNode: null,
                channel: null,
                channelData: this.props.channelData
            };
            this.props.onSelectedChannel(newSelected);

        }

    },

    render: function() {

        var style = {
            backgroundImage: 'url(' + this.props.channelData.screenshot + ')',
            backgroundSize: '100% 100%'
        };

        if(this.props.currentSelectedChannel) {
            if(this.props.currentSelectedChannel.id !== this.props.channelId) {
                style.opacity = '0.5';
            }
        }

        var iconStyle = {
            backgroundColor: this.props.channelData.icon
        };

        var description =
            <p className='channel-description'> {this.props.channelData.description} </p>;

        return (

            <div className="col-1-3" >

                <Paper className='channel-card'
                       ref={'channel' + this.props.channelId}
                       zDepth={3}
                       style={style}
                       onTouchTap={this.handleSelectCard} >

                    <div className='channel-div'>

                        <div className='channel-caption'>

                            <div className='icon-name-wrapper'>

                                <div className='channel-icon' ref='channelIcon' style={iconStyle} > </div>

                                <div className='name-wrapper'>
                                    <p className='channel-name'> {this.props.channelData.name} </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </Paper>

            </div>);

    }

});

module.exports = ChannelCard;


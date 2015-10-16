var React = require('react');
var Mui = require('material-ui');
var ChannelCard = require('./ChannelCard');

var ChannelsCatalogue = React.createClass({

    handleSelectedChannel: function(ch) {
        this.props.onSelectedChannel(ch);
    },

    render: function() {

        var channels = [];
        var chs = this.props.channels;
        var keys = Object.keys(chs).sort();
        keys = keys.sort(function(a, b) {
            return (+a) - (+b);
        });
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];

            // set respective selected channel in channels list
            var respectiveSelected = null;
            if(this.props.selectedChannel && key===this.props.selectedChannel.id) {
                respectiveSelected = true;
            }

            channels.push(<ChannelCard
                id={key}
                key={key}
                channelData={chs[key]}
                channelId={key}
                currentSelectedChannel={this.props.selectedChannel}
                respectiveSelected={respectiveSelected}
                onSelectedChannel={this.handleSelectedChannel} />
            );
        }

        return (
            <div className='content-div'>
                <div className="grid" ref='gridRef' >
                    {channels}
                </div>
            </div>
        )
    }

});

module.exports = ChannelsCatalogue;


var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;

/**
 * @prop channel
 */
var Channel = React.createClass({

    componentDidMount: function() {

    },

    handleClick: function() {

        // JavaScript to send an action to iOS code
        var appName = 'roomcast';
        var actionType = 'playChannel';
        // TODO generalize
        var actionParameters = {
            'name': this.props.channel.name,
            'url': this.props.channel.url
        };
        var jsonString = (JSON.stringify(actionParameters));
        var escapedJsonParameters = escape(jsonString);
        var url = appName + '://' + actionType + "#" + escapedJsonParameters;
        console.log('launching url: ', url);
        document.location.href = url;

    },

    render: function() {

        var broker = '52.1.142.215', runId = 'RoomQuake', imgType = 'screenshot';

        var style = {
            backgroundImage: 'url(' + 'http://' + broker + ':57880/roomcast/main-interface/assets/channels/' + runId + '/' + imgType + '/' + this.props.channel.screenshot + ')',
            backgroundSize: '100% 100%'
        };

        return (
            <Paper className='channel' style={style} ref='channelRef' onTouchTap={this.handleClick} >

                <div className='channel-div' >

                    <div className='channel-caption'>

                        <div className='icon-name-wrapper'>

                            <img className='channel-icon'> </img>

                            <div className='name-wrapper'>
                                <p className='channel-name'> {this.props.channel.name} </p>
                                <p className='channel-description'> description... </p>
                            </div>

                        </div>

                    </div>

                </div>

            </Paper>);

    }

});

module.exports = Channel;


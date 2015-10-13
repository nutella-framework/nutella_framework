var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var NutellaMixin = require('./NutellaMixin');
var iOSMixin = require('./iOSMixin');
var $ = require('jquery');

/**
 * @prop channel
 */
var Channel = React.createClass({

    mixins: [NutellaMixin, iOSMixin],

    componentDidMount: function() {
        // Font-size adaptation based on card width
        $('.text-fit').each(function() {
            $(this).css('font-size', '2em');
            while( $(this).width() > $('.name-wrapper').width() - 10 ) {
                $(this).css('font-size', (parseInt($(this).css('font-size')) - 1) + "px" );
            }
        });
    },

    handleClick: function() {
        this.props.onSetPlaying(this.props.chId);
    },

    render: function() {

        var style = {
            backgroundImage: 'url(' + this.props.channel.screenshot + ')',
            backgroundSize: '100% 100%'
        };

        var iconStyle = {
            backgroundColor: this.props.channel.icon
        };

        var border = this.props.playing ? {
            outline: 'solid 5px rgba(255,255,0,0.75)'
        } : null;

        return (
            <Paper className='channel' style={style} ref='channelRef' onTouchTap={this.handleClick} >

                <div className='channel-div' style={border}>

                    <div className='channel-caption'>

                        <div className='icon-name-wrapper'>

                            <div className='channel-icon' ref='channelIcon' style={iconStyle} > </div>

                            <div className='name-wrapper'>
                                <span className='channel-name text-fit'>{this.props.channel.name}</span>
                            </div>

                        </div>

                    </div>

                </div>

            </Paper>);

    }

});

module.exports = Channel;


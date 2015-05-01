
var React = require('react');
var Channel = require('./Channel');

var DetailPage = React.createClass({

    componentWillMount: function() {
        this.updateDimensions();
    },

    componentDidMount: function() {
        this.setState({
            channel: this.props.channel
        });

        window.addEventListener("resize", this.updateDimensions);

    },

    componentWillUnmount: function() {
        window.removeEventListener("resize", this.updateDimensions);
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            channel: nextProps.channel
        });
    },

    getInitialState: function () {
        return  {
            channel: this.props.channel,
            windowSize: []
        }
    },

    updateDimensions: function() {
        this.setState({windowSize: [window.innerWidth, window.innerHeight]});
    },

    render: function() {

        var channel =
                <Channel
                    channel={this.state.channel}
                    selected={true} />;

        var rightBarStyle = {
            height: this.state.windowSize[1]
        };

        return (

            <div className='detail-page' >
                <div className="card-detail"> {channel} </div>
                <div className="right-bar-detail" style={rightBarStyle} >  </div>
            </div>

        );

    }

});

module.exports = DetailPage;


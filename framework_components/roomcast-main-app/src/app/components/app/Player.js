
var React = require('react');
var Mui = require('material-ui');
var FloatingActionButton = Mui.FloatingActionButton;
var d3 = require('d3');
var $ = require('jquery');
var NUTELLA = require('nutella_lib');

var Player = React.createClass({

    componentDidMount: function() {
        var self = this;
        this.showLoading();
        $('.channel-frame').load(function(){
            self.handleOnLoad();
        });
        this.interval_ = null;
    },

    componentWillUnmount: function() {
    },

    getInitialState: function () {
        return  {
            playing: true,
            loading: true
        }
    },

    componentWillReceiveProps: function(props) {
        this.setState({playing: props.playing});
    },

    handleOnLoad: function() {
        this.setState({loading: false});
        this.hideLoading();
    },

    showLoading: function() {
        var self = this;

        d3.xml("assets/Logo_grid.svg", "image/svg+xml", function (logo) {

            self.refs['player'].getDOMNode().appendChild(logo.documentElement);

            d3.select('#logo')
                .attr({
                    width: window.innerWidth,
                    height: window.innerHeight
                });

            var colorBlue = function(id) {
                d3.select(id).style({
                    'fill': '#00bcd4'
                });
            };

            var colorPink = function(id) {
                d3.select(id).style({
                    'fill': '#e91e63'
                });
            };

            var removeColor = function() {
                d3.selectAll('rect').style({
                    'fill': null
                });
            };

            var sequence = [1,2,3,4,8,7,6,5];
            var i = 0;
            var action = function() {
                removeColor();
                if(sequence[i] < 5) {
                    colorBlue('#ch' + sequence[i]);
                } else {
                    colorPink('#ch' + sequence[i]);
                }
                i++;
                if(i===sequence.length) {
                    i = 0;
                }
            };

            self.interval_ = setInterval(action, 200);
        });
    },

    hideLoading: function() {
        d3.select('#logo').remove();
        clearInterval(this.interval_);
    },

    render: function () {

        var playerStyle = null;
        if(!this.state.playing) {
            playerStyle = {
                opacity: 0,
                zIndex: 90,
                pointerEvents: 'none'
            };
        } else {
            playerStyle = {
                opacity: 1,
                zIndex: 100,
                pointerEvents: 'all'
            };
        }

        var url = this.props.url;
        var qp = this.props.nutellaParams;
        var suffix = 'broker=' + qp.broker + '&app_id=' + qp.app_id + '&run_id=' + qp.run_id;
        url = url.indexOf('?') === -1 ? url + '?' + suffix : url + '&' + suffix;

        return (

            <div className='player' style={playerStyle} ref='player' >

                <iframe className='channel-frame' src={url} > </iframe>

            </div>

        );
    }

});

module.exports = Player;

var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var d3 = require('d3');

var UploadingScreen = React.createClass({

    componentDidMount: function() {

        d3.xml("./upload.svg", "image/svg+xml", function (logo) {

            d3.select('.uploading-container')[0][0].appendChild(logo.documentElement);

            d3.select('#logo')
                .attr({
                    width: window.innerWidth,
                    height: window.innerHeight
                })
                .style({
                    position: 'fixed',
                    top: '0',
                    'background-color': 'rgba(0,0,0,0.8)',
                    'z-index': '200'
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

            setInterval(action, 200);

            console.log('loading screen');

        });

    },

    render: function() {

        return (<div className='uploading-container' > </div>);

    }

});

module.exports = UploadingScreen;


var React = require('react');
var Mui = require('material-ui');
var ColorCell = require('./ColorCell');

var ColorPicker = React.createClass({

    componentWillMount: function() {

        this.palette_ = [];
        this.palette_.push(
            '#f6e8c3',
            '#c7eae5',
            '#fde0ef',
            '#e6f5d0',
            '#e7d4e8',
            '#fee0b6',
            '#d1e5f0',
            '#f46d43',
            '#bdbdbd',
            '#a8ddb5'
        );

    },

    render: function() {
        var self = this;

        var colorsGrid = [];
        this.palette_.forEach(function(c) {
            colorsGrid.push(
                <ColorCell color={c}
                           size={self.props.cellSize}
                           onPickColor={self.props.onPickColor}/>
            );
        });

        return (

                <div className='color-picker' >

                    {colorsGrid}

                </div>

        );

    }

});

module.exports = ColorPicker;


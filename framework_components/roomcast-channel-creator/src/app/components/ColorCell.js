
var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;

var ColorCell = React.createClass({

    handlePickColor: function() {
        this.props.onPickColor(this.props.color);
    },

    render: function() {

        var style = {
            backgroundColor: this.props.color
        };

        return (

            <div className='color-cell' style={style} onTouchTap={this.handlePickColor} > </div>

        );

    }

});

module.exports = ColorCell;

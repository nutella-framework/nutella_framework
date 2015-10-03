var React = require('react');
var Mui = require('material-ui');
var RaisedButton = require('./material-ui/raised-button_.jsx');

/**
 * @prop type
 * @prop onRemovedChannels
 */
var GlobalButton = React.createClass({

    removeChannels: function() {
      this.props.onRemovedChannels();
    },

    render: function(){

        var button = this.props.type==='add'? <RaisedButton label='Add' secondary={true} /> :
            this.props.type==='remove' ? <RaisedButton label='Clear Row' primary={true} onTouchTap={this.removeChannels} /> :
                <RaisedButton label='Clear All' primary={true} onTouchTap={this.removeChannels} />;
        return (<div className='div-button-container'>
                    {button}
                </div>);
    }

});

module.exports = GlobalButton;


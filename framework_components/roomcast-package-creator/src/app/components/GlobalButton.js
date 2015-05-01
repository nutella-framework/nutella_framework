var React = require('react');
var Mui = require('material-ui');
var RaisedButton = Mui.RaisedButton_;

/**
 * @prop type
 * @prop onRemovedChannels
 */
var GlobalButton = React.createClass({

    removeChannels: function() {
      this.props.onRemovedChannels();
    },

    render: function(){

        var button = this.props.type==='add'? <RaisedButton label='Add' secondary={true} /> : <RaisedButton label='Remove' primary={true} onTouchTap={this.removeChannels} />;
        return (<div className='div-button-container'>
                    {button}
                </div>);
    }

});

module.exports = GlobalButton;


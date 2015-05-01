var React = require('react');
var Mui = require('material-ui');
var FloatingActionButton_ = Mui.FloatingActionButton_;

/**
 * @prop type
 * @prop selectedChannel
 * @prop onAddedChannel
 * @prop onRemovedChannel
 */
var ContextButton = React.createClass({

    addChannel: function() {
        this.props.onAddedChannel(this.props.selectedChannel.id);
    },

    removeChannel: function() {
        this.props.onRemovedChannel(this.props.selectedChannel.id);
    },

    render: function() {

        var button = this.props.type==='add'? <FloatingActionButton_ icon='content-add' secondary={true} onTouchTap={this.addChannel} /> :
            <FloatingActionButton_ icon='content-remove' primary={true} onTouchTap={this.removeChannel} />;

        return (
            <div className='div-button-container'>
                {button}
            </div>
        );

    }

});

module.exports = ContextButton;


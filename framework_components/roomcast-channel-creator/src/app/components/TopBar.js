
var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var RaisedButton = Mui.RaisedButton;
var FloatingActionButton = Mui.FloatingActionButton;

var TopBar = React.createClass({

    handleAddCard: function() {
        this.props.onExitSelection();
        this.scrollTo(document.body, 0, 200, this.props.onAddCard);
    },

    scrollTo: function(element, to, duration, callback) {
        var self = this;

        if (duration < 0) {
            return;
        }
        var difference = to - element.scrollTop;
        var perTick = difference / duration * 10;

        setTimeout(function() {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop === to) {
                callback();
                return;
            }
            self.scrollTo(element, to, duration - 10, callback);
        }, 10);
    },

    render: function() {

        var style = {
            position: 'absolute'
        };

        return (
            <div className='top-bar'>

                <Paper>

                    <div className='top-bar-container' >

                        <div className='plus-button' >
                            <FloatingActionButton
                                secondary={true}
                                mini={true}
                                onTouchTap={this.handleAddCard} >

                                <i className="icon ion-plus-round" ></i>

                            </FloatingActionButton>
                        </div>

                        <div className='top-bar-container-inner' >

                            <div className='channels-panel-save-buttons-div' >

                                <div className='div-button-container-final-button'>
                                    <RaisedButton className='save-button' label='Save changes' secondary={true} onTouchTap={this.props.onSave} />
                                </div>

                                <div className='div-button-container-final-button'>
                                    <RaisedButton className='undo-button' label='Undo changes' primary={true} onTouchTap={this.props.onUndo} />
                                </div>

                            </div>

                        </div>

                    </div>

                </Paper>

            </div>
        );

    }

});

module.exports = TopBar;


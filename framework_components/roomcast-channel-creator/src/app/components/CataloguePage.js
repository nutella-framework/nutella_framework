
var React = require('react');
var Mui = require('material-ui');
var TopBar = require('./TopBar');
var Dialog = Mui.Dialog;
var FlatButton = Mui.FlatButton;

var CataloguePage = React.createClass({

    componentDidMount: function() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    },

    componentWillUnmount: function() {
        window.removeEventListener("resize", this.updateDimensions);
    },

    getInitialState: function () {
        return  {
            height: 0
        }
    },

    updateDimensions: function() {
        var height = this.refs.gridRef.getDOMNode().offsetHeight;

        this.setState({height: height});
    },

    enableSaveDialog: function() {
        this.props.onExitSelection();
        this.refs.saveDialog.show();
    },

    disableSaveDialog: function() {
        this.refs.saveDialog.dismiss();
    },

    enableUndoDialog: function() {
        this.props.onExitSelection();
        this.refs.undoDialog.show();
    },

    disableUndoDialog: function() {
        this.refs.undoDialog.dismiss();
    },

    render: function() {

        var self = this;

        var handleOnSave = function() {
            self.props.onSave();
            self.disableSaveDialog();
        };

        var customActionsSave = [
            React.createElement(FlatButton, {
                key: 2,
                label: "Confirm",
                secondary: true,
                onTouchTap: handleOnSave}),
            React.createElement(FlatButton, {
                key: 1,
                label: "Cancel",
                primary: true,
                onTouchTap: this.disableSaveDialog})
        ];

        var handleOnUndo = function() {
            self.props.onUndo();
            self.disableUndoDialog();
        };

        var customActionsUndo = [
            React.createElement(FlatButton, {
                key: 2,
                label: "Confirm",
                secondary: true,
                onTouchTap: handleOnUndo}),
            React.createElement(FlatButton, {
                key: 1,
                label: "Cancel",
                primary: true,
                onTouchTap: this.disableUndoDialog})
        ];

        var overlayStyle = {
            height: this.state.height
        };

        var overlay = <div className="grid-overlay"  onTouchTap={this.props.onExitSelection} ></div>;
        if(this.props.isSelected) {
            overlay = <div className="grid-overlay is-shown"  onTouchTap={this.props.onExitSelection} ></div>;
        }

        return (

            <div>

                <TopBar
                    onSave={this.enableSaveDialog}
                    onUndo={this.enableUndoDialog}
                    onAddCard={this.props.onAddCard}
                    onExitSelection={this.props.onExitSelection} />

                <div className='content-div'>

                    {this.props.backgroudMessage}

                    <div className="grid" ref='gridRef' >
                        {overlay}
                        {this.props.channels}
                    </div>
                </div>

                <Dialog ref='saveDialog' actions={customActionsSave} > Do you want to save this catalogue? </Dialog>
                <Dialog ref='undoDialog' actions={customActionsUndo} > Do you want to reload the starting catalogue? </Dialog>

            </div>

        );

    }

});

module.exports = CataloguePage;


var React = require('react');
var Mui = '../../../../node_modules/material-ui/src/js';
var CssEvent = require('../../../../node_modules/material-ui/src/js/utils/css-event');
var Classable = require('../../../../node_modules/material-ui/src/js/mixins/classable');
var EnhancedButton = require('../../../../node_modules/material-ui/src/js/enhanced-button.jsx');
var Paper = require('../../../../node_modules/material-ui/src/js/paper.jsx');
var Ripple = require('./ripple.jsx');

var RaisedButton_ = React.createClass({

  mixins: [Classable],

  propTypes: {
    className: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    onTouchTap: React.PropTypes.func,
    primary: React.PropTypes.bool,
    secondary: React.PropTypes.bool
  },

  getInitialState: function() {
    var zDepth = 1;
    return {
      zDepth: zDepth,
      initialZDepth: zDepth
    };
  },

  render: function() {
    var {
      className,
      onTouchTap,
      ...other } = this.props,
      classes = this.getClasses('mui-raised-button', {
        'mui-is-primary': this.props.primary,
        'mui-is-secondary': !this.props.primary && this.props.secondary,
        'mui-is-save-button': !this.props.primary && !this.props.secondary && this.props.saveButton,
        'mui-is-undo-button': !this.props.primary && !this.props.secondary && !this.props.saveButton && this.props.undoButton
      });

    return (
      <Paper className={classes} zDepth={this.state.zDepth}>
        <EnhancedButton 
          {...other}
          className="mui-raised-button-container" 
          onTouchTap={this._onTouchTap}>

          <Ripple ref="ripple" className="mui-raised-button-ripple" />
          <Ripple className="mui-raised-button-focus-ripple" />
          <span className="mui-raised-button-label">{this.props.label}</span>

        </EnhancedButton>
      </Paper>
    );
  },

  _onTouchTap: function(e) {
    if (!this.props.disabled) this._animateButtonClick(e);
    if (this.props.onTouchTap) this.props.onTouchTap(e);
  },

  _animateButtonClick: function(e) {
    var el = this.getDOMNode();

    //animate the ripple
    this.refs.ripple.animate(e);

  }

});

module.exports = RaisedButton_;

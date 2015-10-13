var React = require('react');
var CssEvent = require('../../../../node_modules/material-ui/src/js/utils/css-event.js');
var Classable = require('../../../../node_modules/material-ui/src/js/mixins/classable.js');
var EnhancedButton = require('../../../../node_modules/material-ui/src/js/enhanced-button.jsx');
var Icon = require('../../../../node_modules/material-ui/src/js/icon.jsx');
var Paper = require('../../../../node_modules/material-ui/src/js/paper.jsx');
var Ripple = require('./ripple.jsx');

var FloatingActionButton_ = React.createClass({

  mixins: [Classable],

  propTypes: {
    className: React.PropTypes.string,
    icon: React.PropTypes.string.isRequired,
    mini: React.PropTypes.bool,
    onTouchTap: React.PropTypes.func,
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
      icon,
      mini,
      onTouchTap,
      ...other } = this.props,
      classes = this.getClasses('mui-floating-action-button', {
        'mui-is-mini': this.props.mini,
        'mui-is-secondary': this.props.secondary
      });

    return (
      <Paper className={classes} innerClassName="mui-floating-action-button-inner" zDepth={this.state.zDepth} circle={true}>
        <EnhancedButton 
          {...other}
          className="mui-floating-action-button-container" 
          onTouchTap={this._onTouchTap}>

          
          <Ripple className="mui-floating-action-button-focus-ripple" />
          <Icon className="mui-floating-action-button-icon" icon={this.props.icon} />

        </EnhancedButton>
        <Ripple ref="ripple" className="mui-floating-action-button-ripple" />
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
    this.refs.ripple.animateFromCenter();

  }

});

module.exports = FloatingActionButton_;
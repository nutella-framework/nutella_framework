var React = require('react');

var SvgIcon = React.createClass({

  render: function() {
    var classes = 'mui-svg-icon';
      if(this.props.class) {
          classes += ' ' + this.props.class;
      }

    return (
      <svg
        {...this.props}
        className={classes}
        viewBox="0 0 24 24">
        {this.props.children}
      </svg>
    );
  }

});

module.exports = SvgIcon;
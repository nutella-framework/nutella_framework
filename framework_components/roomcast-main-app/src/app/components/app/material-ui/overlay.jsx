var React = require('react');

var Overlay = React.createClass({

  render: function() {

    var {...other} = this.props;

    var classes = 'mui-overlay';
    if (this.props.show) {
        classes += ' mui-is-shown';
    }

    return (
        <div {...other} className={classes} />
    );
  }

});

module.exports = Overlay;
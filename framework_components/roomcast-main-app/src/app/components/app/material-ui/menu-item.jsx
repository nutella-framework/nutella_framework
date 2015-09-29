var React = require('react');
//var FontIcon = require('./font-icon');

var MenuItem = React.createClass({

  propTypes: {
    index: React.PropTypes.number.isRequired,
    iconClassName: React.PropTypes.string,
    iconRightClassName: React.PropTypes.string,
    attribute: React.PropTypes.string,
    number: React.PropTypes.string,
    data: React.PropTypes.string,
    toggle: React.PropTypes.bool,
    onTouchTap: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onToggle: React.PropTypes.func,
    selected: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      toggle: false
    };
  },

  render: function() {
    var classes = 'mui-menu-item';
      if(this.props.selected) {
          classes += ' mui-is-selected';
      }
      if(this.props.currentSelected) {
          classes += ' mui-is-current-selected';
        }

        var icon;
        var data;
        var iconRight;
        var attribute;
        var number;

        if (this.props.iconClassName) icon = <FontIcon className={'mui-menu-item-icon ' + this.props.iconClassName} />;
        if (this.props.iconRightClassName) iconRight = <FontIcon className={'mui-menu-item-icon-right ' + this.props.iconRightClassName} />;
        if (this.props.data) data = <span className="mui-menu-item-data">{this.props.data}</span>;
        if (this.props.number !== undefined) number = <span className="mui-menu-item-number">{this.props.number}</span>;
        if (this.props.attribute !== undefined) attribute = <span className="mui-menu-item-attribute">{this.props.attribute}</span>;

        return (
        <div
            key={this.props.index}
            className={classes}
            onTouchTap={this._handleTouchTap}
            onClick={this._handleOnClick}>

        {icon}
        {this.props.children}
        {data}
        {attribute}
        {number}
        {iconRight}
        
      </div>
    );
  },

  _handleTouchTap: function(e) {
    if (this.props.onTouchTap) this.props.onTouchTap(e, this.props.index);
  },

  _handleOnClick: function(e) {
    if (this.props.onClick) this.props.onClick(e, this.props.index);
  },

  _handleToggle: function(e, toggled) {
    if (this.props.onToggle) this.props.onToggle(e, this.props.index, toggled);
  }

});

module.exports = MenuItem;

var React = require('react');

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
    console.log('rendering');
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

    var useIcon;
    var deleteIcon;

    var hiddenStyle = {
      color: 'transparent',
      cursor: 'default'
    };

    if(!this.props.lastConfig && !this.props.lastItem) {
      useIcon = <div className='check-config-icon' onTouchTap={this.handleChangeConfig} > <i className="fa fa-check"></i> </div>;
      deleteIcon = <div className='delete-config-icon'> <i className="fa fa-times" onTouchTap={this.handleDeleteConfig}></i> </div>;
    }
    if(this.props.lastConfig && !this.props.lastItem) {
      useIcon = <div className='check-config-icon' onTouchTap={this.handleChangeConfig} > <i className="fa fa-check"></i> </div>
      deleteIcon = <div className='delete-config-icon' style={hiddenStyle} > <i className="fa fa-times" style={hiddenStyle} ></i> </div>;
    }
    if(this.props.lastItem) {
      useIcon = <div className='check-config-icon' onTouchTap={this.handleAddEmptyConfig} > <i className="fa fa-check"></i> </div>
      deleteIcon = <div className='delete-config-icon' style={hiddenStyle} > <i className="fa fa-times" style={hiddenStyle} ></i> </div>;
    }

    return (
        <div
            key={this.props.index}
            className={classes} >

          {icon}
          {this.props.children}
          {data}
          {attribute}
          {number}
          {iconRight}

          {deleteIcon}
          {useIcon}

        </div>
    );
  },

  handleChangeConfig: function(e) {
    if (this.props.onTouchTap) this.props.onTouchTap(e, this.props.index, 'change');
  },

  handleDeleteConfig: function(e) {
    if (this.props.onTouchTap) this.props.onTouchTap(e, this.props.index, 'delete');
  },

  handleAddEmptyConfig: function(e) {
    if (this.props.onTouchTap) this.props.onTouchTap(e, this.props.index, 'add');
  }

});

module.exports = MenuItem;

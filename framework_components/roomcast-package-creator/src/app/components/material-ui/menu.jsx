var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var Dom = require('../../../../node_modules/material-ui/src/js/utils/dom');
var KeyLine = require('../../../../node_modules/material-ui/src/js/utils/key-line');
var MenuItem = require('./menu-item.jsx');
var ConfigField = require('../ConfigField');

var Menu = React.createClass({

    propTypes: {
        autoWidth: React.PropTypes.bool,
        onItemTap: React.PropTypes.func,
        onItemClick: React.PropTypes.func,
        onToggleClick: React.PropTypes.func,
        menuItems: React.PropTypes.array.isRequired,
        selectedIndex: React.PropTypes.number,
        hideable: React.PropTypes.bool,
        visible: React.PropTypes.bool,
        zDepth: React.PropTypes.number
    },

    getInitialState: function() {
        return { hasToUpdateValues: false }
    },

    getDefaultProps: function() {
        return {
            autoWidth: true,
            hideable: false,
            visible: true,
            zDepth: 1
        };
    },

    componentDidMount: function() {
        var el = this.getDOMNode();

        //Set the menu with
        //this._setKeyWidth(el);
        var menuWidth = document.getElementsByClassName('resources-panel')[0].offsetWidth / 2.4;
        //Update the menu width
        el.style.width = menuWidth + 'px';
        var dropdownWidth = document.getElementsByClassName('mui-drop-down-menu')[0];
        dropdownWidth.style.width = menuWidth + 'px';

        //Save the initial menu height and item height for later
        this._initialMenuHeight = el.offsetHeight + KeyLine.Desktop.GUTTER_LESS;
        this._itemHeight = el.offsetHeight / (this.props.menuItems.length);

        //Show or Hide the menu according to visibility
        this._renderVisibility();
    },

    componentDidUpdate: function(prevProps, prevState) {
        this.updateHeight(this.props.menuItems.length);
        if (this.props.visible !== prevProps.visible) this._renderVisibility();
    },

    updateHeight: function(numItems) {
        if(this.props.visible) {

            // Compute new height
            this._initialMenuHeight = this._itemHeight * numItems + KeyLine.Desktop.GUTTER_LESS;

            // Update menu height
            this.getDOMNode().style.height = this._initialMenuHeight + 'px';

        }
    },

    render: function() {
        console.log('rendering menu');

        var classes = 'mui-menu';
        if(this.props.hideable) {
            classes += ' mui-menu-hideable';
        }
        if(this.props.visible) {
            classes += ' mui-visible';
        }

        return (
            <Paper ref="paperContainer" zDepth={this.props.zDepth} className={classes}>
                {this._getChildren()}
            </Paper>
        );

    },

    _getChildren: function() {
        var children = [],
            menuItem,
            itemComponent,
            isSelected;

        for (var i=0; i < this.props.menuItems.length; i++) {
            menuItem = this.props.menuItems[i];
            isSelected = i === this.props.selectedIndex;

            var {
                icon,
                data,
                attribute,
                number,
                toggle,
                onClick,
                ...other
                } = menuItem;

            var menuContent;

            if(this.props.configMenu) {

                var lastItem = i === this.props.menuItems.length - 1;

                menuContent = ( <ConfigField ref={'configField_' + lastItem}
                                             placeholder={menuItem.lastSavedName}
                                             value={menuItem.text}
                                             configId={menuItem.configId}
                                             hasToUpdateValues={this.state.hasToUpdateValues}
                                             lastItem={lastItem}
                                             onUpdatedValues={this.handleUpdatedValues}
                                             onChange={this.handleInputChange} /> );

            } else {
                menuContent = menuItem.text;
            }

            itemComponent = (
                <MenuItem
                    {...other}
                    selected={isSelected}
                    key={i}
                    index={i}
                    icon={menuItem.icon}
                    data={menuItem.data}
                    attribute={menuItem.attribute}
                    number={menuItem.number}
                    toggle={menuItem.toggle}
                    onTouchTap={this._onItemTap}
                    lastItem={lastItem}
                    lastConfig={this.props.menuItems.length === 2} >

                    {menuContent}

                </MenuItem>
            );

            children.push(itemComponent);
        }

        this._numItems = children.length;
        return children;
    },

    _setKeyWidth: function(el) {
        var menuWidth = this.props.autoWidth ?
        KeyLine.getIncrementalDim(el.offsetWidth) + 'px' :
            '100%';

        //Update the menu width
        Dom.withoutTransition(el, function() {
            el.style.width = menuWidth;
        });
    },

    _renderVisibility: function() {
        var el;

        if (this.props.hideable) {
            el = this.getDOMNode();
            var innerContainer = this.refs.paperContainer.getInnerContainer().getDOMNode();

            if (this.props.visible) {

                //Open the menu
                el.style.height = this._initialMenuHeight + 'px';
                //This is to account for fast clicks
                if (this.props.visible) {
                    innerContainer.style.overflow = 'visible';
                }

            } else {

                //Close the menu
                el.style.height = '0px';

                //Set the overflow to hidden so that animation works properly
                innerContainer.style.overflow = 'hidden';
            }
        }
    },

    handleInputChange: function(id, value) {
        this.props.onInputChange(id, value);
    },

    _onItemTap: function(e, index, action) {
       // if(action === 'delete' || action === 'add') {
            this.setState({hasToUpdateValues: true});
      //  }
        if (this.props.onItemTap) this.props.onItemTap(e, index, this.props.menuItems[index], action);
    },

    handleUpdatedValues: function() {
        this.setState({hasToUpdateValues: false});
    }

});

module.exports = Menu;

var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var Menu = require('./menu.jsx');
var DropDownArrow = require('./svg-icons/drop-down-arrow.jsx');
var ClickAwayable = require('../../../../node_modules/material-ui/src/js/mixins/click-awayable');

var DropDownMenu = React.createClass({

    mixins: [ClickAwayable],

    propTypes: {
        autoWidth: React.PropTypes.bool,
        onChange: React.PropTypes.func,
        menuItems: React.PropTypes.array.isRequired
    },

    getDefaultProps: function() {
        return {
            autoWidth: true
        };
    },

    getInitialState: function() {
        return {
            open: false,
            selectedIndex: this.props.selectedIndex || 0
        }
    },

    componentClickAway: function() {
        this.setState({ open: false });
    },

    componentDidMount: function() {
        if (this.props.autoWidth) this._setWidth();
        this._setWidth();
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.hasOwnProperty('selectedIndex')) {
            this.setState({selectedIndex: nextProps.selectedIndex});
        }
    },

    render: function() {

        var classes = 'mui-drop-down-menu';
        if(this.state.open) {
            classes += ' mui-open';
        }

        return (
            <div className={classes}>
                <div className="mui-menu-control" onClick={this._onControlClick}>
                    <Paper className="mui-menu-control-bg" zDepth={0} />
                    <div className="mui-menu-label">
                        {this.props.menuItems[this.state.selectedIndex].text}
                    </div>
                    <DropDownArrow className="mui-menu-drop-down-icon" />
                    <div className="mui-menu-control-underline" />
                </div>
                <Menu
                    ref="menu"
                    autoWidth={this.props.autoWidth}
                    selectedIndex={this.state.selectedIndex}
                    menuItems={this.props.menuItems}
                    hideable={true}
                    visible={this.state.open}
                    configMenu={this.props.configMenu}
                    onItemTap={this._onMenuItemClick}
                    onInputChange={this.handleInputChange} />
            </div>
        );
    },

    handleInputChange: function(id, value) {
        this.props.onInputChange(id, value);
    },

    _setWidth: function() {
        var el = this.getDOMNode(),
            menuItemsDom = this.refs.menu.getDOMNode();

        el.style.width = menuItemsDom.offsetWidth + 'px';
    },

    _onControlClick: function(e) {
        this.setState({ open: !this.state.open });
    },

    _onMenuItemClick: function(e, key, payload, action) {

        if(action === 'change') {

            if (this.props.onChange && this.state.selectedIndex !== key) this.props.onChange(e, null, payload);
            this.setState({
                selectedIndex: key,
                open: false
            });

        } else {

            if(action === 'delete') {

                var nextKey, nextConfigId;
                var currentIndex = this.state.selectedIndex;

                if(currentIndex !== key) {

                    // We're not deleting the current selected item, just delete
                    var newIndex = key < currentIndex ? currentIndex - 1 : currentIndex;
                    this.setState({
                        selectedIndex: newIndex
                    });

                } else {

                    // If it's the last actual menu item
                    if(key === this.props.menuItems.length - 2) {
                        nextKey = key - 1;
                        nextConfigId = nextKey;
                    } else {
                        nextKey = key;
                        nextConfigId = nextKey + 1;
                    }

                    // Update menu selected item
                    this.setState({
                        selectedIndex: nextKey
                    });

                    // Update actual shown configuration
                    if (this.props.onChange) this.props.onChange(e, null, this.props.menuItems[nextConfigId]);

                }

                // Apply actual deletion
                this.props.onDeleteConfig(payload);

            } else {

                if(action === 'add') {

                    // Update menu selected item
                    this.setState({
                        selectedIndex: 0
                    });

                    this.props.onAddEmptyConfig(this.refs.menu.refs['configField_true'].getValue());

                }
            }
        }

    }

});

module.exports = DropDownMenu;
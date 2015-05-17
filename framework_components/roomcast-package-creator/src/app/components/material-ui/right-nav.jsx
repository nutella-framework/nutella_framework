var React = require('react'),
    Overlay = require('./overlay.jsx'),
    Mui = require('material-ui'),
    Paper = Mui.Paper,
    Menu = require('./menu.jsx');

var RightNav = React.createClass({

    propTypes: {
        docked: React.PropTypes.bool,
        header: React.PropTypes.element,
        onChange: React.PropTypes.func,
        menuItems: React.PropTypes.array.isRequired,
        selectedIndex: React.PropTypes.number
    },

    getDefaultProps: function() {
        return {
            docked: true
        };
    },

    getInitialState: function() {
        return {
            open: this.props.docked,
            modal: false
        };
    },

    toggle: function() {
        this.setState({ open: !this.state.open });
        return this;
    },

    close: function() {
        this.setState({ open: false });
        return this;
    },

    open: function() {
        this.setState({ open: true });
        return this;
    },

    render: function() {
        var classes = 'mui-right-nav';
        if (!this.state.open) {
            classes += ' mui-closed';
        }
        var selectedIndex = this.props.selectedIndex;
        var overlay;

        if (!this.props.docked) overlay = <Overlay show={this.state.open} onTouchTap={this._onOverlayTouchTap} />;
        if (this.state.modal) overlay = <Overlay show={this.state.open} onTouchTap={this._onOverlayBlockTouchTap} />;

        return (
            <div className={classes}>

        {overlay}
                <Paper
                    ref="clickAwayableElement"
                    className="mui-right-nav-menu"
                    zDepth={2}
                    rounded={false}>
          
          {this.props.header}
                    <Menu
                        ref="menuItems"
                        zDepth={0}
                        menuItems={this.props.menuItems}
                        selectedIndex={selectedIndex}
                        onItemClick={this._onMenuItemClick}
                        onItemTap={this.handleItemTap}
                        onLogout={this.handleLogout}
                        canLogout={this.props.canLogout} />

                </Paper>
            </div>
        );
    },

    handleLogout: function() {
        if (!this.props.docked) this.close();
        this.props.onLogout();
    },

    _onMenuItemClick: function(e, key, payload) {
        if (!this.props.docked) this.close();
        if (this.props.onChange && this.props.selectedIndex !== key) {
            this.props.onChange(e, key, payload);
        }
    },

    _onOverlayTouchTap: function() {
        this.close();
    },

    _onOverlayBlockTouchTap: function() {
        // do nothing
    },

    handleItemTap: function(e, index, menuItem) {
        this.props.onItemTap(menuItem);
    }

});

module.exports = RightNav;


var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var RaisedButton = Mui.RaisedButton;

var Footer = React.createClass({

    handleLogoutAll: function() {
        nutella.net.publish('logout/all', '');
    },

    render: function () {

        var footerStyle = {
            height: (window.innerHeight * 0.1)
        };

        return (

            <div className='footer' style={footerStyle}>

                <RaisedButton className='logout-button' label='Logout All' primary={true} onTouchTap={this.handleLogoutAll} />

            </div>

        );

    }

});

module.exports = Footer;

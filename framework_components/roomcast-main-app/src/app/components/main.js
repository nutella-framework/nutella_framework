
var React = require('react');
var Mui = require('material-ui');

var Login = require('./login/main');
var App = require('./app/main');
var NUTELLA = require('nutella_lib');

var Main = React.createClass({

    componentDidMount: function() {

    },

    getInitialState: function () {
        return  {
            page: 1,
            params: undefined
        }
    },

    setPage: function(page) {
        this.setState({
            page: page
        });
    },

    handleSwitchPage: function(page, params) {
        if(params) {
            if(params) {
                this.setState({
                    page: page,
                    params: params
                });
            }
        } else {
            this.setState({
                page: page
            });
        }
    },

    render: function () {

        var page = null;
        switch(this.state.page) {
            case 1:
                page = <Login
                    onSwitchPage={this.handleSwitchPage} />;
                break;
            case 2:
                page = <App
                    onSwitchPage={this.handleSwitchPage}
                    params={this.state.params} />;
                break;
            default:
        }

        return page;
    }

});

module.exports = Main;

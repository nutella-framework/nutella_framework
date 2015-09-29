
var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var iOSMixin = require('./iOSMixin');

var IdentityCard = React.createClass({

    mixins: [iOSMixin],

    componentDidMount: function() {
        var self= this;
        this._colorSelected = '#00bcd4';

    },

    getInitialState: function () {
        return  {
            isSelected: false
        }
    },

    handleSelectedIdentity: function() {
        var self = this;

        if(!this.props.hasBeenSelected) {

            this.props.onSelectedIdentity(true);

            // Show selection
            this.setState({
                isSelected: true
            });

            var callback = function() {

                if(self.props.type === 'app_id') {
                    ReactMain.login.app_id = self.props.name;
                    self.props.onSwitchPage(3, {app_id: self.props.name});

                } else {

                    if(self.props.type === 'run_id') {
                        var actionParameters = {
                            broker: ReactMain.login.broker,
                            app_id: ReactMain.login.app_id,
                            run_id: self.props.name
                        };
                        // Exit point from login
                        self.props.onLogin(actionParameters);
                    }

                }
            };
            setTimeout(callback, 500);
        }

    },

    render: function () {

        var selectedCardStyle = {
            backgroundColor: this._colorSelected,
            color: 'white'
        };

        // Copy
        var cardStyle = {};
        for(var p_ in this.props.cardStyle) {
            cardStyle[p_] = this.props.cardStyle[p_];
        }

        var className='identity-card';

        // Add properties if selected
        if(this.state.isSelected) {
            className += ' identity-card-selected';
            for(var p in selectedCardStyle) {
                cardStyle[p] = selectedCardStyle[p];
            }

        }

        return (

            <Paper className={className} style={cardStyle} onTouchTap={this.handleSelectedIdentity}  >

                <div className='card-name'>

                    <span> {this.props.name} </span>

                </div>

            </Paper>);
    }

});

module.exports = IdentityCard;

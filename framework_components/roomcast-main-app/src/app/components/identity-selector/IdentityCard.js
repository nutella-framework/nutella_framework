var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var iOSMixin = require('./iOSMixin');
var NutellaMixin = require('../NutellaMixin');

var IdentityCard = React.createClass({

    mixins: [iOSMixin, NutellaMixin],

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

            // Trigger native animation
            var callback = function() {

                // #LOG action
                console.log(self.props.mode);
                if(self.props.mode === 'id') {
                    self.logAction('login', self.props.app_id, self.props.run_id, {
                        package_name: self.props.name
                    });
                } else {
                    if(self.props.mode === 'activity') {
                        self.logAction('transitionActivity', self.props.app_id, self.props.run_id, {
                            old_package_name: self.props.old_rid,
                            new_package_name: self.props.name,
                            transparent: self.props.name === self.props.old_rid
                        });
                    }
                }

                // Exit point from identity-selector
                self.props.onSetRid(self.props.name);
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

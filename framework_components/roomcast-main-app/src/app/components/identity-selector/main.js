
var React = require('react');
var Mui = require('material-ui');
var IdentitiesGrid = require('./IdentitiesGrid');
var NUTELLA = require('nutella_lib');

var Main = React.createClass({

    componentDidMount: function() {
        var self = this;

        window.nutella_identity_selector = NUTELLA.init(self.props.params.broker, self.props.params.app_id, self.props.params.run_id, 'identity-selector', function(connected) {
            if(connected) {
                window.nutella_identity_selector.net.request('mapping/retrieve', 'all', function (response) {
                    self.extractIdentitiesFromMapping(response);
                });

                window.nutella_identity_selector.net.subscribe('mapping/updated', function (message, from) {
                    self.extractIdentitiesFromMapping(message);
                });

                window.nutella_identity_selector.net.subscribe('currentConfig/switched', function (message, from) {
                    if(self.isMounted()) {
                        self.extractIdentitiesFromMapping(message);
                    }
                });
            } else {
                console.warn('nutella error in identity-selector');
            }
        });

    },

    extractIdentitiesFromMapping: function(mapping) {
        var ids = [];
        mapping.forEach(function (f) {
            for (var i in f.items) {
                if(f.items.hasOwnProperty(i) && f.items[i].name !== '') {
                    ids.push(f.items[i].name);
                }
            }
        });
        this.setIdentities(ids);
    },

    getInitialState: function () {
        return  {
            identities: [],
            mode: 'id'
        }
    },

    setIdentities: function(ids) {
        this.setState({
            identities: ids
        });
    },

    render: function () {

        var titlesDivStyle = {
            height: window.innerHeight * (0.4)
        };

        var gridDivStyle = {
            height: window.innerHeight * (0.6)
        };

        var label;
        switch(this.props.mode) {
            case 'id':
                label = 'Select new identity';
                break;
            case 'activity':
                label = 'New Activity!';
                break;
        }

        return (

            <div className='main-div' >

                <div className='titles-div' style={titlesDivStyle} >

                    <span className='title' > {label} </span>
                    <span className='title' > Who are you? </span>

                </div>

                <div className='grid-div' style={gridDivStyle} >

                    <IdentitiesGrid
                        identities={this.state.identities}
                        onSetRid = {this.props.onSetRid} />

                </div>

            </div>

        );
    }

});

module.exports = Main;


var React = require('react');
var IdentitiesGrid = require('./IdentitiesGrid');

var RunIdPage = React.createClass({

    componentWillMount: function() {
        var self = this;
        var run_ids = [];
        nutella.net.request('runs_list', 'req', function(response) {
            response[self.props.app_id].runs.forEach(function(run_id) {
                run_ids.push(run_id);
            });
            self.setState({
                values: run_ids
            });
        });
    },

    getInitialState: function () {
        return  {
            hasBeenSelected: false,
            values: undefined
        }
    },

    render: function () {

        var titlesDivStyle = {
            height: window.innerHeight * (0.4)
        };

        var gridDivStyle = {
            height: window.innerHeight * (0.6)
        };

        var run_ids_grid = null;

        if(this.state.values) {
            var backgroundMessage = null;
            if(this.state.values.length === 0) {
                backgroundMessage = <p className='backgroundMessage' > No available runs </p>;
            }

            run_ids_grid = (
                <div className='grid-div' style={gridDivStyle} >

                    {backgroundMessage}
                    <IdentitiesGrid
                        identities={this.state.values}
                        type='run_id'
                        onLogin={this.props.onLogin} />

                </div>
            );
        }

        return (

            <div className='main-div' >

                <div className='titles-div' style={titlesDivStyle} >

                    <img src='dist/assets/Logo_alpha.png' className='rc-logo' />
                    <span className='title' > run name: </span>

                </div>

                {run_ids_grid}

            </div>

        );
    }

});

module.exports = RunIdPage;


var React = require('react');
var IdentityCard = require('./IdentityCard');

var IdentitiesGrid = React.createClass({

    componentWillMount: function() {
        this._externalMargin = 20;
        this._cardMargin = 20;
        this._heightRatio = 0.6;

        this.computeGrid(this.props.identities);
    },

    componentWillReceiveProps: function(nextProps) {
        this.computeGrid(nextProps.identities);
    },

    getInitialState: function () {
        return  {
            hasBeenSelected: false
        }
    },

    setHasBeenSelected: function(b) {
        this.setState({
            hasBeenSelected: b
        });
    },

    /**
     * Computes grid size based on given number of configs.
     */
    computeGrid: function(identities) {
        var N = identities.length; // num of total cards
        var i = 1;  // num of rows
        var j = 2;  // num of columns
        for(var n=1; n<=N; n++) {
            var p = i * j;
            if(n > p) {
                if(i < j) {
                    i++;
                } else {
                    j++;
                }
            }
        }
        var cardWidth = (window.innerWidth - this._externalMargin*2 - this._cardMargin*2*j) / j;
        var cardHeight = (window.innerHeight*this._heightRatio - this._externalMargin - this._cardMargin*2*i) / i;
        this._cardSize = [cardWidth, cardHeight];

    },

    render: function () {
        var self = this;

        var cards = [];

        var height = window.innerHeight * this._heightRatio;
        var gridStyle = {height: height};

        var cardStyle = {
            width: this._cardSize[0],
            height: this._cardSize[1],
            //position: 'absolute',
            flexBasis: this._cardSize[0]
        };

        this.props.identities.forEach(function(i, key) {
            cards.push(
                <IdentityCard
                    key={key}
                    name={i}
                    type={self.props.type}
                    cardStyle={cardStyle}
                    hasBeenSelected={self.state.hasBeenSelected}
                    onSelectedIdentity={self.setHasBeenSelected}
                    onSwitchPage={self.props.onSwitchPage}
                    onLogin={self.props.onLogin} />);
        });

        return (

            <div className='identities-grid' style={gridStyle} >
                {cards}
            </div>

        );
    }

});

module.exports = IdentitiesGrid;

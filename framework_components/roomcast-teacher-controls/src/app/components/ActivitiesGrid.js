
var React = require('react');
var Mui = require('material-ui');
var ActivityCard = require('./ActivityCard');

var ActivitiesGrid = React.createClass({

    componentWillMount: function() {
        this._externalMargin = 20;
        this._cardMargin = 20;
        this._heightRatio = 0.9;

        this.computeGrid(this.props.configs);
    },

    componentWillReceiveProps: function(nextProps) {
        this.computeGrid(nextProps.configs);
    },

    /**
     * Computes grid size based on given number of configs.
     */
    computeGrid: function(configs) {
        var N = Object.keys(configs).length; // num of total cards
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

        var cards = [];

        var height = window.innerHeight * this._heightRatio;
        var gridStyle = {height: height};

        var cardStyle = {
            width: this._cardSize[0],
            height: this._cardSize[1],
            //position: 'absolute',
            flexBasis: this._cardSize[0]
        };

        for(var c in this.props.configs) {
            if(this.props.configs.hasOwnProperty(c)) {
                cards.push(
                    <ActivityCard
                        configId={c}
                        configName={this.props.configs[c].name}
                        currentConfigId={this.props.currentConfig}
                        cardStyle={cardStyle}
                        />
                );
            }
        }

        // Flip order
        var cards_ = [];
        for(var i=cards.length-1; i>=0; i--) {
            cards_.push(cards[i]);
        }

        return (

            <div className='activities-grid' style={gridStyle} >
                {cards_}
            </div>

        );
    }

});

module.exports = ActivitiesGrid;

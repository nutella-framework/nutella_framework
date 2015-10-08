
var React = require('react');
var Channel = require('./Channel');
var Mui = require('material-ui');
var FloatingActionButton = Mui.FloatingActionButton;
var RightNav = require('./material-ui/right-nav.jsx');
var NUTELLA = require('nutella_lib');
var IdentitySelector = require('../identity-selector/main');
var Player = require('./Player');

var $ = require('jquery');
require('jquery-ui/draggable');

var Main = React.createClass({

    componentDidMount: function() {
        var self = this;

        window.nutella = NUTELLA.init(self.props.params.broker, self.props.params.app_id, self.props.params.run_id, 'app', function(connected) {
            if(connected) {

                // Get current channels catalogue
                nutella.net.request('channels/retrieve', 'all', function (response) {
                    self.handleUpdatedChannelsCatalogue(response);

                    // If at startup info on id is already in state
                    if(self.state.rid) {
                        // Get current assigned channels (mapping)
                        nutella.net.request('mapping/retrieve', 'all', function (response) {
                            self.handleActivitySwitch(response);
                        });
                    }

                    // Subscribe for future changes
                    nutella.net.subscribe('mapping/updated', function (message, from) {
                        self.handleActivitySwitch(message);
                    });
                    nutella.net.subscribe('currentConfig/switched', function (message, from) {
                        self.handleActivitySwitch(message);
                    });
                    nutella.net.subscribe('channels/updated', function (message, from) {
                        nutella.net.request('mapping/retrieve', 'all', function (response) {
                            self.handleUpdatedChannelsCatalogue(message, function() {
                                self.updateChannelsForRid(response, self.state.rid);
                            });
                        });
                    });

                    // Subscribe to teacher forced logout
                    nutella.net.subscribe('logout/all', function (message, from) {
                        self.handleLogout();
                    });
                });

            }
        });


    },

    /**
     * Manages the modal sidebar right after state change
     */
    componentWillReceiveProps: function(nextProps) {
        var self = this;
        if(!this.state.rid) {
            this.refs.rightNav.open();
            this.refs.rightNav.setState({
                modal: true
            });
            // Force update menu with resources
            nutella.net.request('mapping/retrieve', 'all', function (response) {
                self.handleUpdatedMapping(response);
            });
        } else {
            this.refs.rightNav.setState({
                modal: false
            });
        }
    },

    /**
     * Updates current available channels.
     * @param message list of channels
     * @param rid current identity
     */
    updateChannelsForRid: function(message, rid) {

        var self = this;
        var myChannelsId = [];
        var myChannels = [];
        message.forEach(function (f) {
            for (var i in f.items) {
                var item = f.items[i];
                if (item.name === rid) {
                    myChannelsId = item.channels;
                    break;
                }
            }
        });
        for(var i=0; i<myChannelsId.length; i++) {
            var id = myChannelsId[i];
            if(self.state.channelsCatalogue[+id] !== undefined) {
                // Add info on id of the channel
                var ch = self.state.channelsCatalogue[+id];
                ch['id'] = id;
                myChannels.push(ch);
            }
        }
        if (myChannels.length === 0) {
            self.handleUpdatedBackgroundMessageTabs('No available channels');
            if(!self.state.rid) {
                //self.handleUpdatedBackgroundMessage('No identity set');
            }
        } else {
            self.handleUpdatedBackgroundMessageTabs(null);
        }
        // update channels list
        this.handleUpdatedChannels(myChannels);
        // logout from current channel (i.e. hide it) if not allowed anymore (for now)
        if(myChannelsId.indexOf(this.state.playing) === -1) {
            this.setState({playing: null});
        }

        // update players: if permanently deleted from catalogue they have to be destroyed
        var catalogue = this.state.channelsCatalogue;
        var players = this.state.players;
        var newPlayers = [];
        players.forEach(function(p) {
            if(catalogue[+p]) {
                newPlayers.push(p);
            }
        });
        this.setState({players: newPlayers});
        console.log(catalogue, players, newPlayers);
    },

    getInitialState: function() {
        return {
            rid: null,
            channels: [],
            mapping: [],
            channelsCatalogue: {},
            backgroundMessage: 'Select a channel',
            backgroundMessageTabs: null,
            modal: null,
            playing: null, // id of the current displayed channel
            players: [], // list of ids of the current played channels
            tabs: true
        };
    },

    handleUpdatedRid: function(rid) {
        this.setState({
            rid: rid
        });
    },

    handleUpdatedChannels: function(channels) {
        this.setState({
            channels: channels
        });
    },

    handleUpdatedMapping: function(mapping) {
        this.setState({
            mapping: mapping
        });
    },

    handleUpdatedChannelsCatalogue: function(cat, callback) {
        if(callback) {
            this.setState({
                channelsCatalogue: cat
            }, callback);
        } else {
            this.setState({
                channelsCatalogue: cat
            });
        }
    },

    handleUpdatedBackgroundMessage: function(m) {
        this.setState({
            backgroundMessage: m
        });
    },

    handleUpdatedBackgroundMessageTabs: function(m) {
        this.setState({
            backgroundMessageTabs: m
        });
    },

    handleSetPlaying: function(id) {
        var self = this;
        var players = this.state.players;
        if(players.indexOf(id) === -1) {
            players.push(id);
        }
        var callback = function() {
            if(self.state.players.length === 0) {
                self.setState({backgroundMessage: 'Select a channel'});
            } else {
                self.setState({backgroundMessage: null});
            }
        };

        this.setState({playing: id, players: players, tabs: false}, callback);
    },

    handleBacktoMenu: function() {
        var self = this;
        this.setState({playing: null});

        // Hide all players
        var ids = this.state.players;
        ids.forEach(function(id) {
            self.refs['player_' + id].setState({playing: false});
        });

    },

    handleControlButton: function() {
        var self = this;
        this.refs.rightNav.toggle();
        if(this.refs.rightNav.state.open === false) {
            nutella.net.request('mapping/retrieve', 'all', function (response) {
                self.handleUpdatedMapping(response);
            });
        }
    },

    handleSelectedResource: function(rid) {
        var self = this;
        this.handleUpdatedRid(rid);
        nutella.net.request('mapping/retrieve', 'all', function (response) {
            self.updateChannelsForRid(response, rid);
        });
    },

    handleItemTap: function(menuItem) {
        this.handleSelectedResource(menuItem.id);
    },

    handleSetRid: function(rid) {
        this.handleSelectedResource(rid);
    },

    handleLogout: function() {
        //this.handleSelectedResource(null);
        this.props.onSwitchPage(1);
    },

    promptIdentitySelector: function(mode) {
        return (
            <IdentitySelector
                params = {this.props.params}
                onSetRid = {this.handleSetRid}
                mode = {mode}/>);
    },

    componentWillUnmount: function() {
    },

    /**
     * Enables the tabs.
     */
    handleTabsButton: function() {
        this.setState({tabs: true});
    },

    /**
     * Disables the tabs.
     */
    handleOverlayTabs: function() {
        this.setState({tabs: false});
    },

    componentDidUpdate: function() {
        this.setupTabsButton();
    },

    setupTabsButton: function() {

        var fix = function() {
            $("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>")
                .css({
                    top: 0,
                    left: 0,
                    width: window.innerWidth, height: window.innerHeight,
                    position: "absolute", opacity: "0.001", zIndex: 1000
                })
                .appendTo("body");

        };
        var unfix = function() {
            $( ".ui-draggable-iframeFix" ).remove();
        };

        $(".tabs-button")
            .draggable({
                containment: ".outer-div",
                start: function(event, ui) {
                    fix();
                },
                stop: function(event, ui) {
                    unfix();
                }
            })

    },

    /**
     * Manages the transition between activities.
     * If old identity is still within the new available ones, then keeps it.
     * If not, it shows the identity-selector to pick the new one.
     */
    handleActivitySwitch: function(mapping) {
        var ids = this.extractIdentitiesFromMapping(mapping);
        var id = this.state.rid;
        if(id) {
            if(ids.indexOf(id) !== -1) {
                this.updateChannelsForRid(mapping, this.state.rid);
            } else {
                this.setState({rid: null, modal: 'activity'});
            }
        } else {
            this.setState({rid: null, modal: 'activity'});
        }
    },

    /**
     * Helper to extract identities from current mapping.
     * @param mapping
     * @returns {Array}
     */
    extractIdentitiesFromMapping: function(mapping) {
        var ids = [];
        mapping.forEach(function (f) {
            for (var i in f.items) {
                if(f.items.hasOwnProperty(i) && f.items[i].name !== '') {
                    ids.push(f.items[i].name);
                }
            }
        });
        return ids;
    },

    render: function() {

        if(!this.state.rid) {
            if(this.state.modal === 'activity') {
                return this.promptIdentitySelector('activity');
            }
            return this.promptIdentitySelector('id');
        }

        var self = this;
        var channels = [];
        for (var ch in this.state.channels) {
            if (this.state.channels.hasOwnProperty(ch)) {
                channels.push(
                    <Channel
                        key={ch}
                        chId={this.state.channels[ch].id}
                        channel={this.state.channels[ch]}
                        playing={this.state.playing === this.state.channels[ch].id}
                        onSetPlaying={this.handleSetPlaying} />
                );
            }
        }

        var menuItems = [];
        this.state.mapping.forEach(function (f) {
            for (var i in f.items) {
                if(f.items.hasOwnProperty(i) && f.items[i].name !== '') {
                    menuItems.push({
                        id: f.items[i].name,
                        text: f.items[i].name,
                        currentSelected: f.items[i].name === self.state.rid
                    });
                }
            }

        });

        var backgroundMessageStyle = {
            position: 'fixed',
            left: '0',
            bottom: '50%',
            width: '100%',
            fontSize: '2.5vw',
            textAlign: 'center',
            color: '#9197a3',
            fontWeight: '300'
        };
        var backgroundMessage = null;
        if(this.state.backgroundMessage) {
            backgroundMessage = <p style={backgroundMessageStyle} >{this.state.backgroundMessage}</p>;
        }
        if(this.state.playing === null) {
            backgroundMessage = <p style={backgroundMessageStyle} >{'Select a channel'}</p>;
        }

        var gridHeight = $('.grid').css('height');
        var backgroundMessageTabsStyle = {
            position: 'fixed',
            left: '0',
            top: (parseInt(gridHeight) / 2) - 10,
            width: '100%',
            fontSize: '2.5vw',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '300'
        };
        var backgroundMessageTabs = null;
        if(this.state.backgroundMessageTabs) {
            backgroundMessageTabs = <p style={backgroundMessageTabsStyle} >{this.state.backgroundMessageTabs}</p>;
        }

        var canLogout = true;
        if(!this.state.rid) {
            canLogout = false;
        }

        var touchDivStyle = {
            width: '80px',
            height: '60px',
            position: 'fixed',
            bottom: 0,
            right: 0,
            zIndex: 250
        };

        var players = [];
        var ids = this.state.players;
        ids.forEach(function(id) {
            var p_id = self.state.playing;
            var playing = p_id === id;
            if(self.state.channelsCatalogue[+id]) {
                var player =
                    <Player
                        key={id}
                        chId={id}
                        ref={'player_' + id}
                        playing={playing}
                        url={self.state.channelsCatalogue[+id].url}
                        name={self.state.channelsCatalogue[+id].name}
                        nutellaParams={self.props.params}
                        onBackButton={self.handleBacktoMenu} />;
                players.push(player);
            }
        });

        var outerDivStyle = null;
        if(this.state.playing) {
            // prevent the scrolling only when there's a channel playing
            outerDivStyle = {
                position: 'relative',
                height: '100vh',
                overflow: 'hidden'
            };
        }

        var buttonStyle = {
            zIndex: 110
        };

        var tabsButton = <div className='tabs-button' style={buttonStyle} onTouchTap={this.handleTabsButton} >
            <FloatingActionButton
                primary={true}
                mini={true} >
                <i className="icon ion-ios-arrow-down" ></i>
            </FloatingActionButton>
        </div>;

        var overlayTabs = null;
        var tabsClass = '';
        var overlayTabsStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 110
        };

        if(this.state.tabs) {

            overlayTabs = <div style={overlayTabsStyle} onTouchTap={this.handleOverlayTabs} ></div>;
            buttonStyle['opacity'] = 0;
            buttonStyle['pointerEvents'] = 'none';

        } else {
            tabsClass = ' hidden-tabs';
        }

        return (

            <div className='outerDiv' style={outerDivStyle} >

                <div className={"grid" + tabsClass}>{backgroundMessageTabs},{channels}</div>

                {tabsButton}

                {overlayTabs}

                {players}

                {backgroundMessage}

                <div style={touchDivStyle} onTouchTap={this.handleControlButton} >
                    <i className="controlButton icon ion-android-lock"  ></i>
                </div>

                <RightNav ref='rightNav'
                          docked={false}
                          modal={false}
                          menuItems={menuItems}
                          onItemTap={this.handleItemTap}
                          canLogout={canLogout}
                          onLogout={this.handleLogout} />
            </div>

        );
    }


});

module.exports = Main;

var React = require('react');
var Channel = require('./Channel');
var CataloguePage = require('./CataloguePage');
var DetailPage = require('./DetailPage');

var Main = React.createClass({

    componentWillMount: function() {
        var self = this;

        // Get current channels catalogue
        nutella.net.request('channels/retrieve', 'all', function (response) {
            self.setChannels(response);

            nutella.net.subscribe('channels/updated', function (message, from_) {
                self.setChannels(message);
            });

        });

    },

    componentDidMount: function() {
        this.reactChannels_ = [];
    },

    getInitialState: function () {
        return  {
            channels: {},
            selectedChannel: null,
            page: 'catalogue',
            backgroundMessage: null
        }
    },

    setChannels: function(channels, publish) {
        var self = this;
        var callback = function() {
            if(publish) {
                nutella.net.publish('channels/update', self.state.channels);
                console.log('publishing', channels);
            }
        };
        this.setState({
            channels: channels
        }, callback());
    },

    setSelectedChannel: function(selectedChannel) {
        this.setState({
            selectedChannel: selectedChannel
        });
    },

    /**
     * @param page 'catalogue' or 'detail'
     */
    setPage: function(page) {
        this.setState({
            page: page
        });
    },

    handleSave: function() {
        var self = this;

        // Publish current changes if no images have to be uploaded
        var canPublish = true;
        this.getIds().forEach(function(id) {
            if(self.refs['channel' + id].imageFile_) {
                canPublish = false;
            }
        });
        if (canPublish) {
            this.saveLocalCatalogue(true);
        } else {
            // Launch task to save images (if needed) on each channel, then publish
            this.getIds().forEach(function(id) {
                self.refs['channel' + id].handleStoreImageOnServer();
            });

        }

    },

    handleSaveCallback: function() {
        console.log("All done!");
        this.saveLocalCatalogue(true);
    },

    handleUndo: function() {
        /*
         var self = this;
         nutella.net.request('channels/retrieve', 'all', function (response) {
         self.setChannels(response);
         });
         this.setSelectedChannel(null);
         */

        // Reload page to clear cached images
        window.location.reload(true);
    },

    handleSelectedChannel: function(selectedChannel) {
        this.setSelectedChannel(selectedChannel);
    },

    handleExitSelection: function() {
        var self = this;

        this.setState({
            selectedChannel: null
        });

        this.getIds().forEach(function(id) {
            var ch = self.refs['channel' + id];
            if(ch.state.selected) {
                if(ch.state.flipped) {
                    ch.flipCardBack();
                }
            }
        });

    },

    handleDeleteCard: function(id) {
        var channels = this.state.channels;
        delete channels[id];
        this.setChannels(channels);
    },

    getIds: function() {
        var channels = this.state.channels;
        var ids = [];
        if(channels.length !== 0) {
            for (var c in channels) {
                if (channels.hasOwnProperty(c)) {
                    ids.push(+c);
                }
            }
        }
        return ids;
    },

    handleAddCard: function() {

        var channels = this.state.channels;

        // Find max id
        var ids = this.getIds();
        if(Math.max.apply(null, ids) >= 0) {
            var newChannelId = Math.max.apply(null, ids) + 1;
        } else {
            newChannelId = 1;
        }

        // Save current catalogue
        this.saveLocalCatalogue();

        channels[newChannelId] = {
            "name": " ",
            "icon": "",
            "screenshot": "http://localhost:57882/2413e677923c146b5ebbe4500b5580c9.png",
            "description": "",
            "url": "",
            "type": "web"
        };

        this.setChannels(channels);
    },

    handleSetName: function(value) {
        this.updateField('name', value);
    },

    handleSetIcon: function(color) {
        this.updateField('icon', color);
    },

    handleSetScreenshot: function(channelId, value) {
        var channels = this.state.channels;
        var channel = channels[channelId];
        channel.screenshot = value;
        channels[channelId] = channel;
        console.log(channel, channels);
        this.setChannels(channels);
        console.warn('saved', value, channelId);

    },

    handleSetDescription: function(value) {
        this.updateField('description', value);
    },

    handleSetUrl: function(value) {
        this.updateField('url', value);
    },

    handleSetType: function(value) {
        this.updateField('type', value);
    },

    updateField: function(field, value) {
        var self = this;
        var channels = this.state.channels;
        var channel = channels[this.state.selectedChannel];
        channel[field] = value;
        channels[this.state.selectedChannel] = channel;
        this.setChannels(channels);

        // Exit modify field mode
        this.getIds().forEach(function (id) {
            var ch = self.refs['channel' + id];
            if (ch.state.selected) {
                ch.setModifyField(null);
            }
        });
    },

    handleUpdatedBackgroundMessage: function(m) {
        this.setState({
            backgroundMessage: m
        });
    },

    /**
     * Synchronizes the local copy of the catalogue
     * @param publish true if you also want to save the changes to the server
     */
    saveLocalCatalogue: function(publish) {
        var channels = this.state.channels;
        if (publish) {
            this.setChannels(channels, publish);
        } else {
            this.setChannels(channels);
        }
    },

    getChannels: function() {
        var self = this;
        var channels = this.state.channels;
        var reactChannels = [];
        self.reactChannels_ = [];

        // Show from last in db (most recent)
        if(channels.length !== 0) {
            var ids = [];
            for (var c in channels) {
                if (channels.hasOwnProperty(c)) {
                    ids.push(+c);
                }
            }

            function sortNumber(a, b) {
                return b - a;
            }

            ids.sort(sortNumber);

            ids.forEach(function(id) {
                if (channels.hasOwnProperty(id)) {
                    var channel =
                        <Channel
                            ref={'channel' + id}
                            key={id}
                            channelId={id}
                            channel={channels[id]}
                            selected={self.state.selectedChannel === id}
                            onSelectChannel={self.handleSelectedChannel}
                            onDeleteCard={self.handleDeleteCard}
                            onPickColor={self.handleSetIcon}
                            onSetName={self.handleSetName}
                            onSetDescription={self.handleSetDescription}
                            onSetType={self.handleSetType}
                            onSetUrl={self.handleSetUrl}
                            onSetScreenshot={self.handleSetScreenshot}
                            onSaveCallback={self.handleSaveCallback} />;
                    reactChannels.push(
                        <div className="col-size" key={id} >
                            {channel}
                        </div>);
                    // Store for future ref
                    self.reactChannels_.push(channel);
                }
            });
        }
        return reactChannels;
    },

    render: function () {
        var self = this;

        var channels = this.getChannels();

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
        if(this.getIds().length === 0) {
            backgroundMessage = <p style={backgroundMessageStyle} > {'Empty Catalogue'} </p>;
        }

        var page;
        switch (this.state.page) {
            case 'catalogue':
                page = <CataloguePage
                    channels={channels}
                    isSelected={this.state.selectedChannel != null}
                    backgroudMessage={backgroundMessage}
                    onSave={this.handleSave}
                    onUndo={this.handleUndo}
                    onExitSelection={this.handleExitSelection}
                    onAddCard={this.handleAddCard} />;
                break;
            case 'detail':
                page = <DetailPage
                    channel={this.state.channels[this.state.selectedChannel]} />;
        }

        return page;
    }

});

module.exports = Main;
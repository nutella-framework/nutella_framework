
var NutellaMixin = {

    getChannelsForRid: function(message, rid) {
        var myChannelsId = [];
        var myChannels = [];
        message.forEach(function(f) {
            for (var i in f.items) {
                var item = f.items[i];
                if (item.name === 'iPad1') {
                    myChannelsId = item.channels;
                    break;
                }
            }
        });
        myChannelsId.forEach(function(id) {
            myChannels.push(CHANNELS[id]);
        });
    }

};

module.exports = NutellaMixin;

var ButtonInteractionsMixin = {

    insertNewChannel: function(channels, chId) {

        var newChannels = [];
        var found = false;
        for(var i=0; i<channels.length; i++) {
            if (+chId === +channels[i]) {
                return channels;
            }
            if(+chId < +channels[i] && !found) {
                newChannels.push(chId);
                newChannels.push(channels[i]);
                found = true;
            } else {
                newChannels.push(channels[i]);
            }
        }
        if(!found) {
            newChannels.push(chId);
        }

        return newChannels;
    },

    removeChannel: function(channels, chId) {

        var newChannels = [];
        for(var ch in channels) {
            newChannels.push(channels[ch]);
        }
        for(var i = newChannels.length; i>=0; i--) {
            if(newChannels[i] === chId) {
                newChannels.splice(i, 1);
            }
        }

        return newChannels;

    }

};

module.exports = ButtonInteractionsMixin;
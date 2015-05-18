/**
 * Persists a javascript array inside a JSON file
 */

var fs = require('fs');

/**
 * Creates a new persisted array and loads it into memory
 * @param filePath the path of the file where to persist the array
 */
var JSONFilePersistedCollection = function(filePath) {

    /**
     * Stores the file path
     */
    Array.prototype.filePath = function() {
        return filePath;
    };

    /**
     * Loads the persisted Array into memory
     */
    Array.prototype.load = function() {
        var json = [];
        try {
            json = JSON.parse(fs.readFileSync(this.filePath()));
        } catch(e) {
            // no file
        }
        this.length = 0;
        json.forEach(function(e){
            this.push(e);
        }, this);
    };

    /**
     * Persists the Array to the JSON file
     */
    Array.prototype.save = function() {
        fs.writeFileSync(this.filePath(), JSON.stringify(this));
    };

    // Create instance and return it
    return [];
};




module.exports = JSONFilePersistedCollection;
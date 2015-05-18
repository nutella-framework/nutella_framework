/**
 * Persists a javascript object inside a JSON file
 */

var fs = require('fs');

/**
 * Creates a new persisted object and loads it into memory
 * @param filePath the path of the file where to persist the object
 */
var JSONFilePersistedObject = function(filePath) {

    /**
     * Stores the file path
     */
    Object.prototype.filePath = function() {
        return filePath;
    };

    /**
     * Loads the persisted object into memory
     */
    Object.prototype.load = function() {
        var json = {};
        try {
            json = JSON.parse(fs.readFileSync(this.filePath()));
        } catch(e) {
        }
        // Copy keys over
        for (var k in json) {
            if (json.hasOwnProperty(k)) {
                this[k] = json[k];
            }
        }
    };

    /**
     * Persists the object on the JSON file
     */
    Object.prototype.save = function() {
        fs.writeFileSync(this.filePath(), JSON.stringify(this));
    };

    // Create instance and return it
    return {};
};




module.exports = JSONFilePersistedObject;
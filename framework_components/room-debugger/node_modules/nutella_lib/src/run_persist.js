/**
 * Run-level persistence APIs for nutella
 */

var mkdirp = require('mkdirp');
var JSONFilePersistedObject = require('./persist/json_file_persisted_object');
var JSONFilePersistedCollection = require('./persist/json_file_persisted_collection');
var MongoPersistedObject = require('./persist/mongo_persisted_object');
var MongoPersistedCollection = require('./persist/mongo_persisted_collection');



var PersistSubModule = function(main_nutella) {
    // Store a reference to the main module
    this.main_nutella = main_nutella;
};



//This method returns a MongoDB-backed store (i.e. persistence)
//for a collection (i.e. an Array)
//@param [String] name the name of the store
//@return [MongoPersistedCollection] a MongoDB-backed collection store
/**
 * This method returns a MongoDB-backed store (i.e. persistence)
 * for a collection (i.e. an Array). Use it as a regular array and call 'load'
 * and 'save' to read and write it from/to the file system
 * @param {String} name - the name of the store
 * @return {Array} the mongo-backed Array
 */
PersistSubModule.prototype.getMongoCollectionStore = function(name) {
    var collection = this.main_nutella.runId + "/" + name;
    var mongo_host = this.main_nutella.mqtt_client.getHost();
    var appId = this.main_nutella.appId;
    return MongoPersistedCollection(mongo_host, appId, collection)
};



/**
 * This method returns a MongoDB-backed store (i.e. persistence)
 * for a single object. Use it as a regular object and call 'load'
 * and 'save' to read and write it from/to the file system.
 * @param {String} name - the name of the store
 * @return {MongoPersistedObject} the mongo-backed Object
 */
PersistSubModule.prototype.getMongoObjectStore = function(name) {
    var doc_id = this.main_nutella.runId + "/" + name;
    var mongo_host = this.main_nutella.mqtt_client.getHost();
    var appId = this.main_nutella.appId;
    return MongoPersistedObject(mongo_host, appId, 'run_persisted_hashes', doc_id);
};



/**
 * This method returns a JSON-file-backed store (i.e. persistence)
 * for a collection (i.e. an Array). Use it as a regular array and call 'load'
 * and 'save' to read and write it from/to the file system
 * @param {String} name - the name of the store
 * @return {Array} the JSON-file-backed Array
 */
PersistSubModule.prototype.getJsonCollectionStore = function(name) {
    var dir_path = "data/" + this.main_nutella.runId;
    var file_path = "data/"+ this.main_nutella.runId + "/" + name + ".json";
    mkdirp.sync(dir_path);
    return JSONFilePersistedCollection(file_path);
};



/**
 * This method returns a JSON-file-backed store (i.e. persistence)
 * for a single object. Use it as a regular object and call 'load'
 * and 'save' to read and write it from/to the file system.
 * @param {String} name - the name of the store
 * @return {JSONFilePersistedObject} the JSON-file-backed Object
 */
PersistSubModule.prototype.getJsonObjectStore = function(name) {
    var dir_path = "data/" + this.main_nutella.runId;
    var file_path = "data/"+ this.main_nutella.runId + "/" + name + ".json";
    mkdirp.sync(dir_path);
    return JSONFilePersistedObject(file_path);
};



module.exports = PersistSubModule;

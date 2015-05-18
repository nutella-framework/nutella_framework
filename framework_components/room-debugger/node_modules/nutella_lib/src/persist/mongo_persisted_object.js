/**
 * Persists a javascript object with inside a MongoDB document
 */


/**
 * Creates a new persisted object
 * @param mongo_host
 * @param db
 * @param collection
 * @param doc_id
 * @return {Object}
 */
var MongoPersistedObject = function(mongo_host, db, collection, doc_id) {
    /**
     * Store the parameters
     */
    Object.prototype.host = function() {
        return mongo_host;
    };
    Object.prototype.db = function() {
        return db;
    };
    Object.prototype.mongoCollection = function() {
        return collection;
    };
    Object.prototype.doc = function() {
        return doc_id;
    };

    /**
     * Loads the persisted object into memory
     */
    Object.prototype.load = function() {

    };

    /**
     * Persists the object inside the mongo document
     */
    Object.prototype.save = function() {

    };

    // Create instance and return it
    return {};
};




module.exports = MongoPersistedObject;
/**
 * Persists a javascript array inside a MongoDB collection
 */

var MongoClient = require('mongodb').MongoClient;

/**
 * Creates a new persisted array
 * @param mongo_host
 * @param db
 * @param collection
 * @return {Array}
 */
var MongoPersistedCollection = function(mongo_host, db, collection) {

    /**
     * Store the parameters
     */
    Array.prototype.host = function() {
        return mongo_host;
    };
    Array.prototype.db = function() {
        return db;
    };
    Array.prototype.mongoCollection = function() {
        return collection;
    };

    /**
     * Loads the persisted array into memory
     */
    Array.prototype.load = function() {
        //var cname = this.mongoCollection();
        //MongoClient.connect('mongodb://' +  this.host() + ':27017/' + this.db(), (function(err, db) {
        //    if(err) return;
        //    var collection = db.collection(cname);
        //    collection.insertMany(this, function(){});
        //}).bind(this));
    };

    /**
     * Persists the array inside the mongo collection
     */
    Array.prototype.save = function() {
        /*
         // Locate all the entries using find
         collection.find().toArray(function(err, results) {
         console.dir(results);
         // Let's close the db
         db.close();
         });
         */
    };

    // Create instance and return it
    return [];
};




module.exports = MongoPersistedCollection;
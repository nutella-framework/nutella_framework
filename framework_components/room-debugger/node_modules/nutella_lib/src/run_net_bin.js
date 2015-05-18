/**
 * Run-level binary network APIs for nutella
 */


var SparkMD5 = require('spark-md5');


/**
 * Run-level binary network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var BinNetSubModule = function(main_nutella, net_sub_module) {
    // Store a reference to the main module
    this.nutella = main_nutella;
    this.net = net_sub_module;
    this.file_mngr_url = 'http://' + main_nutella.mqtt_client.getHost() + ':57882';
};



/**
 * Uploads a file to the nutella file server
 * @param {File} file - the file we are uploading
 * @param cb - the callback fired whenever a file is correctly uploaded
 */
BinNetSubModule.prototype.uploadFile = function(file, cb) {
    var file_mngr_url = this.file_mngr_url;
    var reader = new FileReader();
    reader.onload = function(event) {
        // 2. calculate md5 hash
        var hexHash = SparkMD5.ArrayBuffer.hash(event.target.result );
        var extension = getFileExtension(file);
        var filename = hexHash + '.' + extension;
        // 3. check if the file is already stored and, if so, get the url
        isAlreadyUploaded(file_mngr_url, filename, function(fileURL) {
            // 4a. if it does, execute callback and pass the file url
            cb(fileURL);
        }, function() {
            // 4b. if it doesn't, upload
            upload(file_mngr_url, file, filename, function(fileURL) {
                // 5. execute callback and pass the file url
                cb(fileURL);
            });
        });
    };
    // 1. read file
    reader.readAsArrayBuffer(file);
};


//
// Helper function
// Extracts the extension from a file object
//
function getFileExtension(file) {
    return file.name.substring(file.name.lastIndexOf('.')+1, file.name.length).toLowerCase()
}


//
// Helper function
// This function checks if a particular filename already exists.
// If so it executes the first callback that is passed,
// otherwise the second one
//
function isAlreadyUploaded(file_mngr_url, filename, file_exists_cb, file_absent_cb) {
    var req = new XMLHttpRequest();
    req.open("GET", file_mngr_url + "/test/" + filename);
    req.onload = function(e) {
        var url = JSON.parse(req.response).url;
        if (url === undefined)
            file_absent_cb();
        else
            file_exists_cb(url);
    };
    req.send();
}


//
// Helper function
// This function uploads a file with a certain file name.
// If the upload is successful the first callback is executed,
// otherwise the second one is.
function upload(file_mngr_url, file, filename, success, error) {
    // Assemble data
    var fd = new FormData();
    fd.append("filename", filename);
    fd.append("file", file);
    var req = new XMLHttpRequest();
    req.open("POST", file_mngr_url + "/upload");
    req.onload = function(e) {
        var url = JSON.parse(req.response).url;
        if (url === undefined)
            error();
        else
            success(url);
    };
    req.send(fd);
}



/**
 * Subscribes to a channel for binary files uptes.
 *
 * @param channel this can only be a simple channel not
 * @param cb it takes two parameters, file and metadata
 * @param done_callback
 */
BinNetSubModule.prototype.subscribe = function(channel, cb, done_callback) {
    this.net.subscribe(channel, function(message, from) {
        // Discard non-bin message
        if (!message.bin) return;
        // Execute callback
        cb(message.url, message.metadata);
    }, done_callback);
};



/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
BinNetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe(channel, done_callback);
};



/**
 * Publishes a binary file to a certain channel.
 *
 * @param channel
 * @param file 		File object https://developer.mozilla.org/en-US/docs/Web/API/File
 * @param done_callback
 */
BinNetSubModule.prototype.publish = function(channel, file, metadata, done_callback) {
    var net_mod = this.net;
    this.uploadFile(file, function(url) {
        net_mod.publish(channel, {bin: true, url: url, metadata: metadata});
        // Execute optional done callback
        if (done_callback!==undefined) done_callback();
    });
};









module.exports = BinNetSubModule;
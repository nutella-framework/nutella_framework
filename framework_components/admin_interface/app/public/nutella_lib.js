(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.NUTELLA = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/******************
 * nutella_lib.js *
 ******************/

"use strict";

/**
 * Entry point for nutella_lib in the browser
 */

var nutella_i = require('./nutella_i_browser');
var nutella_version = require('./version');

// Internal reference to this library (used below)
var nutella = {};


// Version number
nutella.version = nutella_version.version;


/**
 * Creates a new instance of nutella
 * and initialize it. This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} app_id - the app_id this component belongs to
 * @param {string} run_id - the run_id this component is launched in
 * @param {string} component_id - the name of this component
 */
nutella.init = function(broker_hostname, app_id, run_id, component_id, done_cb) {
    if (broker_hostname===undefined || app_id===undefined || run_id===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all four required parameters (broker_hostname, app_id, run_id, component_id)");
    }
    return new nutella_i.RunNutellaInstance(broker_hostname, app_id, run_id, component_id, done_cb);
};


/**
 * Creates a new instance of nutella
 * and initialize it for an app-level component.
 * This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} app_id - the app_id this component belongs to
 * @param {string} component_id - the name of this component
 */
nutella.initApp = function(broker_hostname, app_id, component_id, done_cb) {
    if (broker_hostname===undefined || app_id===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all three required parameters (broker_hostname, app_id, component_id)");
    }
    return new nutella_i.AppNutellaInstance(broker_hostname, app_id, component_id, done_cb);
};


/**
 * Creates a new instance of nutella
 * and initialize it for a framework-level component.
 * This is a factory method.
 *
 * @param {string} broker_hostname - the hostname of the broker.*
 * @param {string} component_id - the name of this component
 */
nutella.initFramework = function(broker_hostname, component_id, done_cb) {
    if (broker_hostname===undefined || component_id=== undefined) {
        console.warn("Couldn't initialize nutella. Make sure you are setting all two required parameters (broker_hostname, component_id)");
    }
    return new nutella_i.FrNutellaInstance(broker_hostname, component_id, done_cb);
};



/**
 * Utility method that parses URL parameters from the URL.
 * It is obviously only available in the browser.
 *
 * @return {Object} An object containing all the URL query parameters
 */
nutella.parseURLParameters = function () {
    var str = location.search;
    var queries = str.replace(/^\?/, '').split('&');
    var searchObject = {};
    for( var i = 0; i < queries.length; i++ ) {
        var split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return searchObject;
};


/**
 * Utility method that parses the component ID from the URL.
 *
 * @return {String} the componentId of this component
 */
nutella.parseComponentId = function() {
    return location.pathname.split('/')[4];
};



// Exports nutella object
module.exports = nutella;
},{"./nutella_i_browser":9,"./version":17}],2:[function(require,module,exports){
/*jshint bitwise:false*/
/*global unescape*/

(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;
        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.SparkMD5 = factory();
    }
}(function (undefined) {

    'use strict';

    ////////////////////////////////////////////////////////////////////////////

    /*
     * Fastest md5 implementation around (JKM md5)
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */
    var add32 = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
    },

    cmn = function (q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    },

    ff = function (a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    },

    gg = function (a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    },

    hh = function (a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    },

    ii = function (a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    },

    md5cycle = function (x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    },

    /* there needs to be support for Unicode here,
       * unless we pretend that we can redefine the MD-5
       * algorithm for multi-byte characters (perhaps
       * by adding every four 16-bit characters and
       * shortening the sum to 32 bits). Otherwise
       * I suggest performing MD-5 as if every character
       * was two bytes--e.g., 0040 0025 = @%--but then
       * how will an ordinary MD-5 sum be matched?
       * There is no way to standardize text to something
       * like UTF-8 before transformation; speed cost is
       * utterly prohibitive. The JavaScript standard
       * itself needs to look at this: it should start
       * providing access to strings as preformed UTF-8
       * 8-bit unsigned value arrays.
       */
    md5blk = function (s) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    },

    md5blk_array = function (a) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
    },

    md51 = function (s) {
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);
        return state;
    },

    md51_array = function (a) {
        var n = a.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }

        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
        // containing the last element of the parent array if the sub array specified starts
        // beyond the length of the parent array - weird.
        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);

        return state;
    },

    hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],

    rhex = function (n) {
        var s = '',
            j;
        for (j = 0; j < 4; j += 1) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    },

    hex = function (x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    },

    md5 = function (s) {
        return hex(md51(s));
    },



    ////////////////////////////////////////////////////////////////////////////

    /**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */
    SparkMD5 = function () {
        // call reset to init the instance
        this.reset();
    };


    // In some cases the fast add32 function cannot be used..
    if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }


    /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.append = function (str) {
        // converts the string to utf8 bytes if necessary
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        // then append as binary
        this.appendBinary(str);

        return this;
    };

    /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.appendBinary = function (contents) {
        this._buff += contents;
        this._length += contents.length;

        var length = this._buff.length,
            i;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._state, md5blk(this._buff.substring(i - 64, i)));
        }

        this._buff = this._buff.substr(i - 64);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     * Use the raw parameter to obtain the raw result instead of the hex one.
     *
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            i,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = !!raw ? this._state : hex(this._state);

        this.reset();

        return ret;
    };

    /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */
    SparkMD5.prototype._finish = function (tail, length) {
        var i = length,
            tmp,
            lo,
            hi;

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(this._state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._state, tail);
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.reset = function () {
        this._buff = "";
        this._length = 0;
        this._state = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other aditional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.prototype.destroy = function () {
        delete this._state;
        delete this._buff;
        delete this._length;
    };


    /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.hash = function (str, raw) {
        // converts the string to utf8 bytes if necessary
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        var hash = md51(str);

        return !!raw ? hash : hex(hash);
    };

    /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.hashBinary = function (content, raw) {
        var hash = md51(content);

        return !!raw ? hash : hex(hash);
    };

    /**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
    SparkMD5.ArrayBuffer = function () {
        // call reset to init the instance
        this.reset();
    };

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
        // TODO: we could avoid the concatenation here but the algorithm would be more complex
        //       if you find yourself needing extra performance, please make a PR.
        var buff = this._concatArrayBuffer(this._buff, arr),
            length = buff.length,
            i;

        this._length += arr.byteLength;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._state, md5blk_array(buff.subarray(i - 64, i)));
        }

        // Avoids IE10 weirdness (documented above)
        this._buff = (i - 64) < length ? buff.subarray(i - 64) : new Uint8Array(0);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     * Use the raw parameter to obtain the raw result instead of the hex one.
     *
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            i,
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = !!raw ? this._state : hex(this._state);

        this.reset();

        return ret;
    };

    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.reset = function () {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._state = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other aditional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

    /**
     * Concats two array buffers, returning a new one.
     *
     * @param  {ArrayBuffer} first  The first array buffer
     * @param  {ArrayBuffer} second The second array buffer
     *
     * @return {ArrayBuffer} The new array buffer
     */
    SparkMD5.ArrayBuffer.prototype._concatArrayBuffer = function (first, second) {
        var firstLength = first.length,
            result = new Uint8Array(firstLength + second.byteLength);

        result.set(first);
        result.set(new Uint8Array(second), firstLength);

        return result;
    };

    /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
        var hash = md51_array(new Uint8Array(arr));

        return !!raw ? hash : hex(hash);
    };

    return SparkMD5;
}));

},{}],3:[function(require,module,exports){
/**
 * Application-level APIs for nutella, browser version
 */

// Require various sub-modules
var AppNetSubModule = require('./app_net');
var AppLogSubModule = require('./app_log');


var AppSubModule = function(main_nutella) {
    // Initialized the various sub-modules
    this.net = new AppNetSubModule(main_nutella);
    this.log = new AppLogSubModule(main_nutella);
};


module.exports = AppSubModule;
},{"./app_log":4,"./app_net":5}],4:[function(require,module,exports){
/**
 * App-level log APIs for nutella
 */

var AppNetSubModule = require('./app_net');

var AppLogSubModule = function(main_nutella) {
    this.net = new AppNetSubModule(main_nutella);
};



AppLogSubModule.prototype.debug = function(message, code) {
    console.debug(message);
    this.net.publish('logging', logToJson(message, code, 'debug'));
    return code;
};

AppLogSubModule.prototype.info = function(message, code) {
    console.info(message);
    this.net.publish('logging', logToJson(message, code, 'info'));
    return code;
};

AppLogSubModule.prototype.success = function(message, code) {
    console.log('%c '+ message , 'color: #009933');
    this.net.publish('logging', logToJson(message, code, 'success'));
    return code;
};

AppLogSubModule.prototype.warn = function(message, code) {
    console.warn(message);
    this.net.publish('logging', logToJson(message, code, 'warn'));
    return code;
};

AppLogSubModule.prototype.error = function(message, code) {
    console.error(message);
    this.net.publish('logging', logToJson(message, code, 'error'));
    return code;
};


function logToJson( message, code, level) {
    return (code === undefined) ? {level: level, message: message} : {level: level, message: message, code: code};
}



module.exports = AppLogSubModule;

},{"./app_net":5}],5:[function(require,module,exports){
/**
 * App-level Networking APIs for nutella
 */


var AbstractNet = require('./util/net');


/**
 * App-level network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var AppNetSubModule = function(main_nutella) {
    this.net = new AbstractNet(main_nutella);
};



/**
 * Subscribes to a channel or filter.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
    this.net.subscribe_to(channel, callback, this.net.nutella.appId, undefined, done_callback);
};



/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
AppNetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, this.net.nutella.appId, undefined, done_callback);
};



/**
 * Publishes a message to a channel
 *
 * @param channel
 * @param message
 */
AppNetSubModule.prototype.publish = function(channel, message) {
    this.net.publish_to(channel, message, this.net.nutella.appId, undefined);
};



/**
 * Sends a request.
 *
 * @param channel
 * @param message
 * @param callback
 */
AppNetSubModule.prototype.request = function(channel, message, callback) {
    this.net.request_to(channel, message, callback, this.net.nutella.appId, undefined);
};



/**
 * Handles requests.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.handle_requests = function (channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, this.net.nutella.appId, undefined, done_callback);
};



//----------------------------------------------------------------------------------------------------------------
// Application-level APIs to communicate at the run-level
//----------------------------------------------------------------------------------------------------------------

/**
 * Allows application-level APIs to subscribe to a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.subscribe_to_run = function(run_id, channel, callback, done_callback) {
    this.net.subscribe_to(channel,callback,this.net.nutella.appId,run_id,done_callback);
};


/**
 * Allows application-level APIs to unsubscribe from a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param done_callback
 */
AppNetSubModule.prototype.unsubscribe_from_run = function(run_id, channel, done_callback) {
    this.net.unsubscribe_from(channel,this.net.nutella.appId,run_id,done_callback);
};


/**
 * Allows application-level APIs to publish to a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param message
 */
AppNetSubModule.prototype.publish_to_run = function( run_id, channel, message ) {
    this.net.publish_to(channel,message,this.net.nutella.appId, run_id);
};


/**
 * Allows application-level APIs to make a request to a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param request
 * @param callback
 */
AppNetSubModule.prototype.request_to_run = function( run_id, channel, request, callback) {
    this.net.request_to(channel,request,callback,this.net.nutella.appId,run_id);
};


/**
 * Allows application-level APIs to handle requests on a run-level channel within a specific run
 *
 * @param run_id
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.handle_requests_on_run = function( run_id, channel, callback, done_callback ) {
    this.net.handle_requests_on(channel,callback,this.net.nutella.appId,run_id,done_callback);
};


//----------------------------------------------------------------------------------------------------------------
// Application-level APIs to communicate at the run-level (broadcast)
//----------------------------------------------------------------------------------------------------------------

/**
 * Fired whenever a message is received on the specified channel for any of the runs in the application
 *
 * @callback all_runs_cb
 * @param {string} message - the received message. Messages that are not JSON are discarded.
 * @param {string} run_id - the run_id of the channel the message was sent on
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Allows application-level APIs to subscribe to a run-level channel *for ALL runs*
 *
 * @param {string} channel - the run-level channel we are subscribing to. Can be wildcard
 * @param {all_runs_cb} callback - the callback that is fired whenever a message is received on the channel
 */
AppNetSubModule.prototype.subscribe_to_all_runs = function(channel, callback, done_callback) {
    var app_id = this.net.nutella.appId;
    //Pad channel
    var padded_channel = this.net.pad_channel(channel, app_id, '+');
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var run_id = extractRunId(app_id, mqtt_channel);
            if(f.type==='publish')
                callback(f.payload, run_id, f.from);
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    // Add to subscriptions, save mqtt callback and subscribe
    this.net.subscriptions.push(padded_channel);
    this.net.callbacks.push(mqtt_cb);
    this.net.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, this.net.nutella.appId, undefined);
};


/**
 * Allows application-level APIs to publish a message to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param message
 */
AppNetSubModule.prototype.publish_to_all_runs = function(channel, message) {
  this.net.nutella.runs_list.forEach(function(run_id){
      this.net.publish_to(channel,message,this.net.nutella.appId,run_id);
  }.bind(this));
};


/**
 * Allows application-level APIs to send a request to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param request
 * @param callback
 */
AppNetSubModule.prototype.request_to_all_runs = function(channel, request, callback) {
    this.net.nutella.runs_list.forEach(function(run_id){
        this.net.request_to(channel,request,callback,this.net.nutella.appId,run_id);
    }.bind(this));
};


/**
 * This callback is used to handle all runs
 * @callback handle_all_run
 * @param {string} message - the received message. Messages that are not JSON are discarded.
 * @param {string} run_id - the run_id of the channel the message was sent on
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 * @return {Object} the response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Allows application-level APIs to handle requests to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
AppNetSubModule.prototype.handle_requests_on_all_runs = function(channel, callback, done_callback) {
    var app_id = this.net.nutella.appId;
    // Pad channel
    var padded_channel = this.net.pad_channel(channel, app_id, '+');
    var ln = this.net;
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var run_id = extractRunId(app_id, mqtt_channel);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = ln.prepare_message_for_response(callback(f.payload, run_id, f.from), f.id);
            ln.nutella.mqtt_client.publish( padded_channel, m );
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    this.net.nutella.mqtt_client.subscribe( padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, this.net.nutella.appId, undefined);
};



// Utility function

function extractRunId(app_id, mqtt_channel) {
    var pc = '/nutella/apps/' + app_id + '/runs/';
    var sp =  mqtt_channel.replace(pc, '').split('/');
    return sp[0];
}


module.exports = AppNetSubModule;

},{"./util/net":16}],6:[function(require,module,exports){
/**
 * Framework-level APIs for nutella, browser version
 */

// Require various sub-modules
var FrNetSubModule = require('./fr_net');
var FrLogSubModule = require('./fr_log');


var FrSubModule = function(main_nutella) {
    // Initialized the various sub-modules
    this.net = new FrNetSubModule(main_nutella);
    this.log = new FrLogSubModule(main_nutella);
};


module.exports = FrSubModule;
},{"./fr_log":7,"./fr_net":8}],7:[function(require,module,exports){
/**
 * Framework-level log APIs for nutella
 */

var FrNetSubModule = require('./app_net');

var FrLogSubModule = function(main_nutella) {
    this.net = new FrNetSubModule(main_nutella);
};



FrLogSubModule.prototype.debug = function(message, code) {
    console.debug(message);
    this.net.publish('logging', logToJson(message, code, 'debug'));
    return code;
};

FrLogSubModule.prototype.info = function(message, code) {
    console.info(message);
    this.net.publish('logging', logToJson(message, code, 'info'));
    return code;
};

FrLogSubModule.prototype.success = function(message, code) {
    console.log('%c '+ message , 'color: #009933');
    this.net.publish('logging', logToJson(message, code, 'success'));
    return code;
};

FrLogSubModule.prototype.warn = function(message, code) {
    console.warn(message);
    this.net.publish('logging', logToJson(message, code, 'warn'));
    return code;
};

FrLogSubModule.prototype.error = function(message, code) {
    console.error(message);
    this.net.publish('logging', logToJson(message, code, 'error'));
    return code;
};


function logToJson( message, code, level) {
    return (code === undefined) ? {level: level, message: message} : {level: level, message: message, code: code};
}



module.exports = FrLogSubModule;

},{"./app_net":5}],8:[function(require,module,exports){
/**
 * Framework-level Networking APIs for nutella
 */


var AbstractNet = require('./util/net');


/**
 * Framework-level network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var FRNetSubModule = function(main_nutella) {
    this.net = new AbstractNet(main_nutella);
};



/**
 * Subscribes to a channel or filter.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
    this.net.subscribe_to(channel, callback, undefined, undefined, done_callback);
};


/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, undefined, undefined, done_callback);
};


/**
 * Publishes a message to a channel
 *
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish = function(channel, message) {
    this.net.publish_to(channel, message, undefined, undefined);
};


/**
 * Sends a request.
 *
 * @param channel
 * @param message
 * @param callback
 */
FRNetSubModule.prototype.request = function(channel, message, callback) {
    this.net.request_to(channel, message, callback, undefined, undefined);
};


/**
 * Handles requests.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests = function(channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, undefined, undefined, done_callback);
};



//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the run-level to a specific run
//----------------------------------------------------------------------------------------------------------------

/**
 * Allows framework-level APIs to subscribe to a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_run = function(app_id, run_id, channel, callback,done_callback) {
    this.net.subscribe_to(channel,callback,app_id,run_id,done_callback)
};


/**
 * Allows framework-level APIs to unsubscribe from a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_to_run = function( app_id, run_id, channel, done_callback ) {
    this.net.unsubscribe_from(channel, app_id, run_id, done_callback);
};


/**
 * Allows framework-level APIs to publish to a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_run = function( app_id, run_id, channel, message ) {
    this.net.publish_to(channel, message, app_id, run_id);
};


/**
 * Allows framework-level APIs to make an asynchronous request to a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_run = function( app_id, run_id, channel, request, callback) {
    this.net.request_to(channel, request, callback, app_id, run_id);
};


/**
 * Allows framework-level APIs to handle requests on a run-level channel within a specific run
 *
 * @param app_id
 * @param run_id
 * @param channel
 * @param callback
 */
FRNetSubModule.prototype.handle_requests_on_run = function( app_id, run_id, channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, app_id, run_id, done_callback)
};



//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the run-level (broadcast)
//----------------------------------------------------------------------------------------------------------------


/**
 * Callback for subscribing to all runs
 * @callback allRunsCb
 # @param {string} message - the received message. Messages that are not JSON are discarded
 # @param {String} app_id - the app_id of the channel the message was sent on
 # @param {String} run_id - the run_id of the channel the message was sent on
 # @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Allows framework-level APIs to subscribe to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param {allRunsCb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_all_runs = function( channel, callback, done_callback ) {
    //Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', '+');
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var f1 = extractRunIdAndAppId(mqtt_channel);
            if(f.type==='publish')
                callback(f.payload, f1.appId, f1.runId, f.from);
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    // Add to subscriptions, save mqtt callback and subscribe
    this.net.subscriptions.push(padded_channel);
    this.net.callbacks.push(mqtt_cb);
    this.net.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, undefined, undefined);
};


/**
 * Allows framework-level APIs to unsubscribe from a run-level channel *for ALL runs*
 *
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_from_all_runs = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, '+', '+', done_callback);
};


/**
 * Allows framework-level APIs to publish a message to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_all_runs = function( channel, message ) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.nutella.runs_list[app_id].runs.forEach(function(run_id){
            this.net.publish_to(channel, message, app_id, run_id);
        }.bind(this));
    }.bind(this));
};


/**
 * Allows framework-level APIs to send a request to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_all_runs = function(channel, request, callback) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.nutella.runs_list[app_id].runs.forEach(function(run_id){
            this.net.publish_to(channel, message, app_id, run_id);
            this.net.request_to(channel, request, callback, app_id, run_id);
        }.bind(this));
    }.bind(this));
};

/**
 * Callback that is used to handle messages from all runs
 * @callback handle_all_runs_cb
 * @param {string} payload - the received message (request). Messages that are not JSON are discarded
 * @param {string} app_id - the app_id of the channel the request was sent on
 * @param {string} run_id - the run_id of the channel the request was sent on
 * @param {Object} from - the sender's identifiers (from containing, run_id, app_id, component_id and optionally resource_id)
 * @return {Object} the response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Allows framework-level APIs to handle requests to a run-level channel *for ALL runs*
 *
 * @param channel
 * @param {handle_all_runs_cb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests_on_all_runs = function(channel, callback, done_callback) {
    // Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', '+');
    var ln = this.net;
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var f1 = extractRunIdAndAppId(mqtt_channel);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = ln.prepare_message_for_response(callback(f.payload, f1.appId, f1.runId, f.from), f.id);
            ln.nutella.mqtt_client.publish( padded_channel, m );
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    this.net.nutella.mqtt_client.subscribe( padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, undefined, undefined);
};



//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the application-level
//----------------------------------------------------------------------------------------------------------------


/**
 * Allows framework-level APIs to subscribe to an app-level channel
 *
 * @param app_id
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_app = function(app_id, channel, callback, done_callback) {
    this.net.subscribe_to(channel,callback,app_id, undefined, done_callback)
};


/**
 * Allows framework-level APIs to unsubscribe from an app-level channel within a specific run
 *
 * @param app_id
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_to_app = function( app_id, channel, done_callback) {
    this.net.unsubscribe_from(channel,app_id,undefined, done_callback);
};


/**
 * Allows framework-level APIs to publish to an app-level channel
 *
 * @param app_id
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_app = function(app_id, channel, message) {
    this.net.publish_to(channel,message,app_id,undefined);
};


/**
 * Allows framework-level APIs to make an asynchronous request to a run-level channel within a specific run
 *
 * @param app_id
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_app = function( app_id, channel, request, callback) {
  this.net.request_to(channel, request, callback, app_id, undefined);
};


/**
 * Allows framework-level APIs to handle requests on a run-level channel within a specific run
 *
 * @param app_id
 * @param channel
 * @param callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests_on_app = function(app_id, channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, app_id, undefined, done_callback);
};


//----------------------------------------------------------------------------------------------------------------
// Framework-level APIs to communicate at the application-level (broadcast)
//----------------------------------------------------------------------------------------------------------------

/**
 * Callback used to handle all messages received when subscribing to all applications
 * @callback subscribeToAllAppsCb
 * @param {string} message - the received message. Messages that are not JSON are discarded
 * @param {string} app_id - the app_id of the channel the message was sent on
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Allows framework-level APIs to subscribe to an app-level channel *for ALL apps*
 *
 * @param channel
 * @param {subscribeToAllAppsCb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.subscribe_to_all_apps = function(channel, callback, done_callback) {
    //Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', undefined);
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var app_id = extractAppId(mqtt_channel);
            if(f.type==='publish')
                callback(f.payload, app_id, f.from);
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    // Add to subscriptions, save mqtt callback and subscribe
    this.net.subscriptions.push(padded_channel);
    this.net.callbacks.push(mqtt_cb);
    this.net.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, undefined, undefined);
};


/**
 * Allows framework-level APIs to unsubscribe from an app-level channel *for ALL apps*
 *
 * @param channel
 * @param done_callback
 */
FRNetSubModule.prototype.unsubscribe_from_all_apps = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, '+', undefined, done_callback);
};


/**
 * Allows framework-level APIs to publish a message to an app-level channel *for ALL apps*
 *
 * @param channel
 * @param message
 */
FRNetSubModule.prototype.publish_to_all_apps = function(channel, message) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.publish_to(channel, message, app_id, undefined);
    }.bind(this));
};


/**
 * Allows framework-level APIs to send a request to an app-level channel *for ALL apps*
 *
 * @param channel
 * @param request
 * @param callback
 */
FRNetSubModule.prototype.request_to_all_apps = function(channel, request, callback) {
    Object.keys(this.net.nutella.runs_list).forEach(function(app_id) {
        this.net.request_to(channel, request, callback, app_id, undefined);
    }.bind(this));
};


/**
 * This callback is used to handle messages coming from all applications
 * @callback handleAllAppsCb
 * @param {string} request - the received message (request). Messages that are not JSON are discarded.
 * @param {string} app_id - the app_id of the channel the request was sent on
 * @param {Object} from - the sender's identifiers (from containing, run_id, app_id, component_id and optionally resource_id)
 * @return {Object} The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Allows framework-level APIs to handle requests to app-level channel *for ALL runs*
 *
 * @param channel
 * @param {handleAllAppsCb} callback
 * @param done_callback
 */
FRNetSubModule.prototype.handle_requests_on_all_apps = function(channel, callback, done_callback) {
    // Pad channel
    var padded_channel = this.net.pad_channel(channel, '+', undefined);
    var ln = this.net;
    var mqtt_cb = function(mqtt_message, mqtt_channel) {
        try {
            var f = JSON.parse(mqtt_message);
            var f1 = extractRunIdAndAppId(mqtt_channel);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = ln.prepare_message_for_response(callback(f.payload, f1.appId, f1.runId, f.from), f.id);
            ln.nutella.mqtt_client.publish( padded_channel, m );
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    this.net.nutella.mqtt_client.subscribe( padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.net.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, undefined, undefined);
};


// Utility functions


function extractRunIdAndAppId(mqtt_channel) {
    var sp =  mqtt_channel.replace('/nutella/apps/', '').split('/');
    return {appId: sp[0], runId: sp[2]};
}

function extractAppId(mqtt_channel) {
    var sp =  mqtt_channel.replace('/nutella/apps/', '').split('/');
    return sp[0];
}




module.exports = FRNetSubModule;

},{"./util/net":16}],9:[function(require,module,exports){
/**
 * Run-level and App-level Nutella instances for the browser
 */

var SimpleMQTTClient = require('./simple-mqtt-client/client-browser');

// Require various sub-modules
var AppSubModule = require('./app_core_browser');
var FrSubModule = require('./fr_core_browser');
var NetSubModule = require('./run_net');
var LogSubModule = require('./run_log');
var LocationSubModule = require('./run_location');


/**
 * Defines the RunNutellaInstance class.
 *
 * @param {String } app_id - the app_id this component belongs to
 * @param {string} run_id - the run_id this component is launched in
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var RunNutellaInstance = function (broker_hostname, app_id, run_id, component_id, done_cb) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname, done_cb);
    this.appId = app_id;
    this.runId = run_id;
    this.componentId = component_id;
    // Initialized the various sub-modules
    this.net = new NetSubModule(this);
    this.log = new LogSubModule(this);
    this.location = new LocationSubModule(this);
    // Start pinging
    setInterval(function(){
        this.net.publish('pings', 'ping');
    }.bind(this),5000);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
RunNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};


/**
 * Defines the AppNutellaInstance class.
 *
 * @param {String } app_id - the app_id this component belongs to
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var AppNutellaInstance = function (broker_hostname, app_id, component_id, done_cb) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname, done_cb);
    this.appId = app_id;
    this.componentId = component_id;
    // Initialized the various sub-modules
    this.app = new AppSubModule(this);
    //Initialize the runs list
    this.runs_list = [];
    // Fetch the runs list
    this.app.net.request('app_runs_list', undefined, function(response) {
        this.runs_list = response;
    }.bind(this));
    // Subscribe to runs list updates
    this.app.net.subscribe('app_runs_list', function(message, from) {
        this.runs_list = message;
    }.bind(this));
    // Start pinging
    setInterval(function(){
        this.app.net.publish('pings', 'ping');
    }.bind(this),5000);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
AppNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};


/**
 * Defines the FRNutellaInstance class.
 *
 * @param {string} broker_hostname - the hostname of the broker.
 * @param {string} component_id - the name of this component
 */
var FrNutellaInstance = function (broker_hostname, component_id, done_cb) {
    //Initialize parameters
    this.mqtt_client = new SimpleMQTTClient(broker_hostname, done_cb);
    this.componentId = component_id;
    // Initialize the various sub-modules
    this.f = new FrSubModule(this);
    //Initialize the runs list
    this.runs_list = {};
    // Fetch the runs list
    this.f.net.request('runs_list', undefined, function(response) {
        this.runs_list = response;
    }.bind(this));
    // Subscribe to runs list updates
    this.f.net.subscribe('runs_list', function(message, from) {
        this.runs_list = message;
    }.bind(this));
    // Start pinging
    setInterval(function(){
        this.f.net.publish('pings', 'ping');
    }.bind(this),5000);
};

/**
 * Sets the resource id for this instance of nutella
 *
 * @param {string} resource_id - the resource_id associated to this instance of nutella
 */
FrNutellaInstance.prototype.setResourceId = function(resource_id){
    this.resourceId = resource_id;
};



module.exports = {
    RunNutellaInstance : RunNutellaInstance,
    AppNutellaInstance : AppNutellaInstance,
    FrNutellaInstance : FrNutellaInstance
};
},{"./app_core_browser":3,"./fr_core_browser":6,"./run_location":10,"./run_log":11,"./run_net":12,"./simple-mqtt-client/client-browser":14}],10:[function(require,module,exports){
var nutella;
var LocationSubModule = function(main_nutella) {
    this.nutella = main_nutella;
    nutella = this.nutella;

    this._resources = {};
    this._room = undefined;

    this._resourcesReady = false;
    this._roomReady = false;

    var self = this;

    // Download all resources
    this.nutella.net.request("location/resources", {}, function(reply) {
        reply.resources.forEach(function(resource) {
            self._resources[resource.rid] = resource;
        });
        self._resourcesReady = true;

        if(self._roomReady == true && readyCallback != undefined) {
            readyCallback();
        }
    });

    // Update resources
    this.nutella.net.subscribe("location/resources/updated", function(message) {
        var resources = message.resources;
        resources.forEach(function(resource) {
            self._resources[resource.rid] = resource;
        });
    });

    // Add resources
    this.nutella.net.subscribe("location/resources/added", function(message) {
        var resources = message.resources;
        resources.forEach(function(resource) {
            self._resources[resource.rid] = resource;
        });
    });

    // Remove resources
    this.nutella.net.subscribe("location/resources/removed", function(message) {
        var resources = message.resources;
        resources.forEach(function(resource) {
            delete self._resources[resource.rid];
        });
    });

    // Download the room dimension
    this.nutella.net.request("location/room", {}, function(reply) {
        self._room = reply;
        self._roomReady = true;

        if(self._resourcesReady == true && readyCallback != undefined) {
            readyCallback();
        }
    });

    // Update room dimension
    this.nutella.net.subscribe("location/room/updated", function(message) {
        self._room = message;
    });
};

// Resource list for notify the update
updateResources = [];
enterResources = [];
exitResources = [];

// Enter and exit callbacks
enterCallback = undefined;
exitCallback = undefined;

// Ready callback
readyCallback = undefined;


Object.defineProperty(LocationSubModule.prototype, 'resources', {
    get: function() {
        var self = this;

        var resources = [];

        Object.keys(this._resources).forEach(function(key) {
            resources.push(self._resources[key]);
        });
        return resources;
    }
});

Object.defineProperty(LocationSubModule.prototype, 'resource', {
    get: function() {
        var self = this;

        var resource = {};

        // Create a virtual resource for every resource
        Object.keys(this._resources).forEach(function(key) {
            var r = self._resources[key];
            Object.defineProperty(resource, r.rid, {
                get: function() {
                    var virtualResource = generateVirtualResource(r);
                    return virtualResource;
                }
            });
        });
        return resource;
    }
});

Object.defineProperty(LocationSubModule.prototype, 'room', {
    get: function() {
        return this._room;
    }
});

function updateResource(resource) {
    var newResource = {};
    newResource.rid = resource.rid;
    if(resource.continuous != undefined) newResource.continuous = resource.continuous;
    if(resource.discrete != undefined) newResource.discrete = resource.discrete;

    newResource.parameters = [];

    for(p in resource.parameters) {
        newResource.parameters.push({key: p, value: resource.parameters[p]});
    }

    nutella.net.publish("location/resource/update", newResource);
}

function generateVirtualResource(resource) {
    var virtualResource = {};
    Object.defineProperty(virtualResource, 'rid', {
        get: function() {
            return resource.rid;
        }
    });
    virtualResource.continuous = {
        get x() { return resource.continuous.x; },
        set x(value) { resource.continuous.x = value; updateResource(resource); },

        get y() { return resource.continuous.y; },
        set y(value) { resource.continuous.y = value; updateResource(resource); }
    };
    virtualResource.discrete = {
        get x() { return resource.discrete.x; },
        set x(value) { resource.discrete.x = value; updateResource(resource); },

        get y() { return resource.discrete.y; },
        set y(value) { resource.discrete.y = value; updateResource(resource); }
    };
    virtualResource.proximity = {
        get rid() { return resource.proximity.rid; },
        get continuous() {
            return {x: resource.proximity.continuous.x, y: resource.proximity.continuous.y};
        },
        get discrete() {
            return {x: resource.proximity.discrete.x, y: resource.proximity.discrete.y};
        }
    };

    Object.defineProperty(virtualResource, 'notifyUpdate', {
        get: function () {
            return updateResources.indexOf(virtualResource.rid) != -1;
        },
        set: function (condition) {
            if(condition == true) {
                if (updateResources.indexOf(virtualResource.rid) == -1) {
                    updateResources.push(virtualResource.rid);
                }
            }
            else {
                if (updateResources.indexOf(virtualResource.rid) != -1) {
                    updateResources.remove(updateResources.indexOf(virtualResource.rid));
                }
            }
        }
    });


    Object.defineProperty(virtualResource, 'notifyEnter', {
        get: function () {
            return enterResources.indexOf(virtualResource.rid) != -1;
        },
        set: function (condition) {
            if(condition == true) {
                if (enterResources.indexOf(virtualResource.rid) == -1) {
                    enterResources.push(virtualResource.rid);
                    nutella.net.subscribe("location/resource/static/" + virtualResource.rid + "/enter", function(message) {
                        message.resources.forEach(function(dynamicResource) {
                            var staticVirtualResource = virtualResource;
                            var dynamicVirtualResource = generateVirtualResource(dynamicResource);
                            if(enterCallback != undefined) {
                                enterCallback(dynamicVirtualResource, staticVirtualResource);
                            }
                        });
                    });
                }
            }
            else {
                if (enterResources.indexOf(virtualResource.rid) != -1) {
                    enterResources.splice(enterResources.indexOf(virtualResource.rid), 1);
                    nutella.net.unsubscribe("location/resource/static/" + virtualResource.rid + "/enter");
                }
            }
        }
    });

    Object.defineProperty(virtualResource, 'notifyExit', {
        get: function () {
            return exitResources.indexOf(virtualResource.rid) != -1;
        },
        set: function (condition) {
            if(condition == true) {
                if (exitResources.indexOf(virtualResource.rid) == -1) {
                    exitResources.push(virtualResource.rid);
                    nutella.net.subscribe("location/resource/static/" + virtualResource.rid + "/exit", function(message) {
                        message.resources.forEach(function(dynamicResource) {
                            var staticVirtualResource = virtualResource;
                            var dynamicVirtualResource = generateVirtualResource(dynamicResource);
                            if(exitCallback != undefined) {
                                exitCallback(dynamicVirtualResource, staticVirtualResource);
                            }
                        });
                    });
                }
            }
            else {
                if (exitResources.indexOf(virtualResource.rid) != -1) {
                    exitResources.splice(exitResources.indexOf(virtualResource.rid), 1);
                    nutella.net.unsubscribe("location/resource/static/" + virtualResource.rid + "/exit");
                }
            }
        }
    });

    virtualResource.parameter = {};

    var parameters = [];
    for(p in resource.parameters) {
        parameters.push({value: resource.parameters[p], key: p});
    }
    parameters.forEach(function(p) {
        Object.defineProperty(virtualResource.parameter, p.key, {
            get: function() {
                return p.value;
            },
            set: function(value) {
                resource.parameters[p.key] = value;
                updateResource(resource);
            }
        });
    });

    return virtualResource;
}

LocationSubModule.prototype.resourceUpdated = function(callback) {
    nutella.net.subscribe("location/resources/updated", function(message) {
        message.resources.forEach(function(resource) {
            var virtualResource = generateVirtualResource(resource);
            if(updateResources.indexOf(resource.rid) != -1) {
                callback(virtualResource);
            }
        });
    });
};

// /location/resource/static/<rid>/enter
LocationSubModule.prototype.resourceEntered = function(callback) {
    enterCallback = callback;
};

LocationSubModule.prototype.resourceExited = function(callback) {
    exitCallback = callback;
};

LocationSubModule.prototype.ready = function(callback) {
    readyCallback = callback;
};

module.exports = LocationSubModule;

},{}],11:[function(require,module,exports){
/**
 * Run-level Logging APIs for nutella
 */

var NetSubModule = require('./run_net');

var LogSubModule = function(main_nutella) {
    this.net = new NetSubModule(main_nutella);
};


LogSubModule.prototype.debug = function(message, code) {
    console.debug(message);
    this.net.publish('logging', logToJson(message, code, 'debug'));
    return code;
};

LogSubModule.prototype.info = function(message, code) {
    console.info(message);
    this.net.publish('logging', logToJson(message, code, 'info'));
    return code;
};

LogSubModule.prototype.success = function(message, code) {
    console.log('%c '+ message , 'color: #009933');
    this.net.publish('logging', logToJson(message, code, 'success'));
    return code;
};

LogSubModule.prototype.warn = function(message, code) {
    console.warn(message);
    this.net.publish('logging', logToJson(message, code, 'warn'));
    return code;
};

LogSubModule.prototype.error = function(message, code) {
    console.error(message);
    this.net.publish('logging', logToJson(message, code, 'error'));
    return code;
};


function logToJson( message, code, level) {
    return (code===undefined) ? {level: level, message: message} : {level: level, message: message, code: code};
}





module.exports = LogSubModule;
},{"./run_net":12}],12:[function(require,module,exports){
/**
 * Run-level Network APIs for nutella
 */


var AbstractNet = require('./util/net');
var BinNet = require('./run_net_bin');


/**
 * Run-level network APIs for nutella
 * @param main_nutella
 * @constructor
 */
var NetSubModule = function(main_nutella) {
    // Store a reference to the main module
    this.nutella = main_nutella;
    this.net = new AbstractNet(main_nutella);
    // Binary net sub module
    this.bin = new BinNet(main_nutella, this);
};



/**
 * Subscribes to a channel or filter.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
NetSubModule.prototype.subscribe = function(channel, callback, done_callback) {
    this.net.subscribe_to(channel, callback, this.nutella.appId, this.nutella.runId, done_callback);
};



/**
 * Unsubscribes from a channel
 *
 * @param channel
 * @param done_callback
 */
NetSubModule.prototype.unsubscribe = function(channel, done_callback) {
    this.net.unsubscribe_from(channel, this.nutella.appId, this.nutella.runId, done_callback);
};



/**
 * Publishes a message to a channel
 *
 * @param channel
 * @param message
 */
NetSubModule.prototype.publish = function(channel, message) {
    this.net.publish_to(channel, message, this.nutella.appId, this.nutella.runId);
};



/**
 * Sends a request.
 *
 * @param channel
 * @param message
 * @param callback
 */
NetSubModule.prototype.request = function(channel, message, callback) {
    this.net.request_to(channel, message, callback, this.nutella.appId, this.nutella.runId);
};



/**
 * Handles requests.
 *
 * @param channel
 * @param callback
 * @param done_callback
 */
NetSubModule.prototype.handle_requests = function(channel, callback, done_callback) {
    this.net.handle_requests_on(channel, callback, this.nutella.appId, this.nutella.runId, done_callback);
};


module.exports = NetSubModule;

},{"./run_net_bin":13,"./util/net":16}],13:[function(require,module,exports){
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
},{"spark-md5":2}],14:[function(require,module,exports){
/**********************
 * Simple MQTT client *
 **********************/

"use strict";

var mqtt_lib = require('./paho/mqttws31');


/**
 * Defines a Simple MQTT client.
 *
 * @param {string} host - the hostname of the broker.
 * @param {function} [err_cb] - optional callback fired whenever an error occurs
 */
var SimpleMQTTClient = function (host, done_cb) {
    // Initializes the object that stores subscriptions
    this.subscriptions = {};
    // Initializes the object that holds the internal client
    this.client = {};
    // Functions backlog
    this.backlog = [];
    // Connect
    this.client = connectBrowser(this.subscriptions, this.backlog, host, done_cb);
};

//
// Helper function that generates a random client ID
//
function generateRandomClientId() {
    var length = 22;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
};

//
// Helper function that connects the MQTT client in the browser
//
function connectBrowser (subscriptions, backlog, host, done_cb) {
    // Create client
    var client = new mqtt_lib.Client(host, Number(1884), generateRandomClientId());
    // Register callback for connection lost
    client.onConnectionLost = function() {
        // TODO try to reconnect
    };
    // Register callback for received message
    client.onMessageArrived = function (message) {
        // Execute all the appropriate callbacks:
        // the ones specific to this channel with a single parameter (message)
        // the ones associated to a wildcard channel, with two parameters (message and channel)
        var cbs = findCallbacks(subscriptions, message.destinationName);
        if (cbs!==undefined) {
            cbs.forEach(function(cb) {
                if (Object.keys(subscriptions).indexOf(message.destinationName)!==-1)
                    cb(message.payloadString);
                else
                    cb(message.payloadString, message.destinationName);
            });
        }
    };
    // Connect
    client.connect({onSuccess: function() {
        // Execute optional done callback passing true
        if (done_cb!==undefined)
            done_cb(true);
        // Execute the backlog of operations performed while the client wasn't connected
        backlog.forEach(function(e) {
            e.op.apply(this, e.params);
        });
    },
        onFailure: function() {
            // Execute optional done callback passing false
            if (done_cb!==undefined)
                done_cb(false);
            else
                console.error('There was a problem initializing nutella.');
        }});
    return client;
}



/**
 * Disconnects from the MQTT client.
 */
SimpleMQTTClient.prototype.disconnect = function () {
    this.client.disconnect();
    this.subscriptions = {};
};



/**
 * Subscribes to a channel and registers a callback.
 *
 * @param {string} channel  - the channel we are subscribing to.
 * @param {callback} callback - A function that is executed every time a message is received on that channel.
 * @param {callback} [done_callback] - A function that is executed once the subscribe operation has completed successfully.
 */
SimpleMQTTClient.prototype.subscribe = function (channel, callback, done_callback) {
    subscribeBrowser(this.client, this.subscriptions, this.backlog, channel, callback, done_callback);
};


//
// Helper function that subscribes to a channel in the browser
//
function subscribeBrowser (client, subscriptions, backlog, channel, callback, done_callback) {
    if ( addToBacklog(client, backlog, subscribeBrowser, [client, subscriptions, backlog, channel, callback, done_callback]) ) return;
    if (subscriptions[channel]===undefined) {
        subscriptions[channel] = [callback];
        client.subscribe(channel, {qos: 0, onSuccess: function() {
            // If there is a done_callback defined, execute it
            if (done_callback!==undefined) done_callback();
        }});
    } else {
        subscriptions[channel].push(callback);
        // If there is a done_callback defined, execute it
        if (done_callback!==undefined) done_callback();
    }
}



/**
 * Unsubscribe from a channel.
 *
 * @param {string} channel  - the channel we are unsubscribing from.
 * @param {function} callback  - the callback we are trying to unregister
 * @param {callback} [done_callback] - A function that is executed once the unsubscribe operation has completed successfully.
 */
SimpleMQTTClient.prototype.unsubscribe = function (channel, callback, done_callback) {
    unsubscribeBrowser(this.client, this.subscriptions, this.backlog, channel, callback, done_callback);
};




//
// Helper function that unsubscribes from a channel in the browser
//
var unsubscribeBrowser = function(client, subscriptions, backlog, channel, callback, done_callback) {
    if ( addToBacklog(client, backlog, unsubscribeBrowser, [client, subscriptions, backlog, channel, callback, done_callback]) ) return;
    if (subscriptions[channel]===undefined)
        return;
    subscriptions[channel].splice(subscriptions[channel].indexOf(callback), 1);
    if (subscriptions[channel].length===0) {
        delete subscriptions[channel];
        client.unsubscribe(channel, {onSuccess : function() {
            // If there is a done_callback defined, execute it
            if (done_callback!==undefined) done_callback();
        }});
    }
};


/**
 * Lists all the channels we are currently subscribed to.
 *
 * @returns {Array} a lists of all the channels we are currently subscribed to.
 */
SimpleMQTTClient.prototype.getSubscriptions = function () {
    return Object.keys(this.subscriptions);
};


/**
 * Publishes a message to a channel.
 *
 * @param {string} channel  - the channel we are publishing to.
 * @param {string} message - the message we are publishing.
 */
SimpleMQTTClient.prototype.publish = function (channel, message) {
    publishBrowser(this.client, this.backlog, channel, message)
};


//
// Helper function that publishes to a channel in the browser
//
var publishBrowser = function (client, backlog, channel, message) {
    if ( addToBacklog(client, backlog, publishBrowser, [client, backlog, channel, message]) ) return;
    message = new mqtt_lib.Message(message);
    message.destinationName = channel;
    client.send(message);
};



/**
 * Returns the client host
 *
 * @return {String}
 */
SimpleMQTTClient.prototype.getHost = function() {
    return this.client._getHost();
}



/**
 * Determines if a channel is wildcard or not.
 *
 * @param channel
 * @return {boolean} true if the channel is a wildcard channel, false otherwise
 */
SimpleMQTTClient.prototype.isChannelWildcard = function(channel) {
    return channel.indexOf('#')>-1 || channel.indexOf('+')>-1 ;
}






//
// Helper function that selects the right callback when a message is received
//
function findCallbacks (subscriptions, channel) {
    // First try to see if a callback for the exact channel exists
    if(Object.keys(subscriptions).indexOf(channel)!==-1)
        return subscriptions[channel];
    // If it doesn't then let's try to see if the channel matches a wildcard callback
    var pattern = matchesWildcard(subscriptions, channel);
    if (pattern!== undefined) {
        return subscriptions[pattern];
    }
    // If there's no exact match or wildcard we have to return undefined
    return undefined;
};


//
// Helper function that tries to match a channel with each subscription
// it returns undefined if no match is found
//
function matchesWildcard (subscriptions, channel) {
    var i;
    var subs = Object.keys(subscriptions);
    for (i=0; i < subs.length; i++) {
        if (matchesFilter(subs[i], channel)) {
            return subs[i];
        }
    }
    return undefined;
};


//
// Helper function that checks a certain channel and see if it matches a wildcard pattern
// Returns true if the channel matches a pattern (including the exact pattern)
//
function matchesFilter (pattern, channel) {
    // If multi-level wildcard is the only character in pattern, then any string will match
    if (pattern==="#") {
        return true;
    }
    // Handle all other multi-level wildcards
    // FROM SPEC: The number sign (‘#’ U+0023) is a wildcard character that matches any number of levels within a topic. The multi-level wildcard represents the parent and any number of child levels. The multi-level wildcard character MUST be specified either on its own or following a topic level separator. In either case it MUST be the last character specified in the Topic Filter
    var p_wo_wildcard = pattern.substring(0, pattern.length-2);
    var str_wo_details = channel.substring(0, pattern.length-2);
    if (pattern.slice(-1)=='#' && p_wo_wildcard==str_wo_details) {
        return true;
    }
    // TODO Handle single-level wildcards (+)
    // FROM SPEC: The single-level wildcard can be used at any level in the Topic Filter, including first and last levels. Where it is used it MUST occupy an entire level of the filter [MQTT-4.7.1-3]. It can be used at more than one level in the Topic Filter and can be used in conjunction with the multilevel wildcard.
    // http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718107
    return false;
};


//
// Helper method that queues operations into the backlog.
// This method is used to make `connect` "synchronous" by
// queueing up operations on the client until it is connected.
//
// @param {string} method  - the method that needs to be added to the backlog
// @param {Array} parameters - parameters to the method being added to the backlog
// @returns {boolean} true if the method was successfully added, false otherwise
//
function addToBacklog (client, backlog, method, parameters) {
    if (!client.isConnected() ) {
        backlog.push({
            op : method,
            params : parameters
        });
        return true;
    }
    return false;
};




//
// Exports SimpleMQTTClient class for other modules
//
module.exports = SimpleMQTTClient;

},{"./paho/mqttws31":15}],15:[function(require,module,exports){
/*******************************************************************************
 * Copyright (c) 2013 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution. 
 *
 * The Eclipse Public License is available at 
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at 
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *    Andrew Banks - initial API and implementation and initial documentation
 *******************************************************************************/


// Only expose a single object name in the global namespace.
// Everything must go through this module. Global Paho.MQTT module
// only has a single public function, client, which returns
// a Paho.MQTT client object given connection details.
 
/**
 * Send and receive messages using web browsers.
 * <p> 
 * This programming interface lets a JavaScript client application use the MQTT V3.1 or
 * V3.1.1 protocol to connect to an MQTT-supporting messaging server.
 *  
 * The function supported includes:
 * <ol>
 * <li>Connecting to and disconnecting from a server. The server is identified by its host name and port number. 
 * <li>Specifying options that relate to the communications link with the server, 
 * for example the frequency of keep-alive heartbeats, and whether SSL/TLS is required.
 * <li>Subscribing to and receiving messages from MQTT Topics.
 * <li>Publishing messages to MQTT Topics.
 * </ol>
 * <p>
 * The API consists of two main objects:
 * <dl>
 * <dt><b>{@link Paho.MQTT.Client}</b></dt>
 * <dd>This contains methods that provide the functionality of the API,
 * including provision of callbacks that notify the application when a message
 * arrives from or is delivered to the messaging server,
 * or when the status of its connection to the messaging server changes.</dd>
 * <dt><b>{@link Paho.MQTT.Message}</b></dt>
 * <dd>This encapsulates the payload of the message along with various attributes
 * associated with its delivery, in particular the destination to which it has
 * been (or is about to be) sent.</dd>
 * </dl> 
 * <p>
 * The programming interface validates parameters passed to it, and will throw
 * an Error containing an error message intended for developer use, if it detects
 * an error with any parameter.
 * <p>
 * Example:
 * 
 * <code><pre>
client = new Paho.MQTT.Client(location.hostname, Number(location.port), "clientId");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({onSuccess:onConnect});

function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("/World");
  message = new Paho.MQTT.Message("Hello");
  message.destinationName = "/World";
  client.send(message); 
};
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0)
	console.log("onConnectionLost:"+responseObject.errorMessage);
};
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
  client.disconnect(); 
};	
 * </pre></code>
 * @namespace Paho.MQTT 
 */

if (typeof Paho === "undefined") {
	Paho = {};
}

Paho.MQTT = (function (global) {

	// Private variables below, these are only visible inside the function closure
	// which is used to define the module. 

	var version = "1.0.1";
	var buildLevel = "2014-11-18T11:57:44Z";
	
	/** 
	 * Unique message type identifiers, with associated
	 * associated integer values.
	 * @private 
	 */
	var MESSAGE_TYPE = {
		CONNECT: 1, 
		CONNACK: 2, 
		PUBLISH: 3,
		PUBACK: 4,
		PUBREC: 5, 
		PUBREL: 6,
		PUBCOMP: 7,
		SUBSCRIBE: 8,
		SUBACK: 9,
		UNSUBSCRIBE: 10,
		UNSUBACK: 11,
		PINGREQ: 12,
		PINGRESP: 13,
		DISCONNECT: 14
	};
	
	// Collection of utility methods used to simplify module code 
	// and promote the DRY pattern.  

	/**
	 * Validate an object's parameter names to ensure they 
	 * match a list of expected variables name for this option
	 * type. Used to ensure option object passed into the API don't
	 * contain erroneous parameters.
	 * @param {Object} obj - User options object
	 * @param {Object} keys - valid keys and types that may exist in obj. 
	 * @throws {Error} Invalid option parameter found. 
	 * @private 
	 */
	var validate = function(obj, keys) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {       		
				if (keys.hasOwnProperty(key)) {
					if (typeof obj[key] !== keys[key])
					   throw new Error(format(ERROR.INVALID_TYPE, [typeof obj[key], key]));
				} else {	
					var errorStr = "Unknown property, " + key + ". Valid properties are:";
					for (var key in keys)
						if (keys.hasOwnProperty(key))
							errorStr = errorStr+" "+key;
					throw new Error(errorStr);
				}
			}
		}
	};

	/**
	 * Return a new function which runs the user function bound
	 * to a fixed scope. 
	 * @param {function} User function
	 * @param {object} Function scope  
	 * @return {function} User function bound to another scope
	 * @private 
	 */
	var scope = function (f, scope) {
		return function () {
			return f.apply(scope, arguments);
		};
	};
	
	/** 
	 * Unique message type identifiers, with associated
	 * associated integer values.
	 * @private 
	 */
	var ERROR = {
		OK: {code:0, text:"AMQJSC0000I OK."},
		CONNECT_TIMEOUT: {code:1, text:"AMQJSC0001E Connect timed out."},
		SUBSCRIBE_TIMEOUT: {code:2, text:"AMQJS0002E Subscribe timed out."}, 
		UNSUBSCRIBE_TIMEOUT: {code:3, text:"AMQJS0003E Unsubscribe timed out."},
		PING_TIMEOUT: {code:4, text:"AMQJS0004E Ping timed out."},
		INTERNAL_ERROR: {code:5, text:"AMQJS0005E Internal error. Error Message: {0}, Stack trace: {1}"},
		CONNACK_RETURNCODE: {code:6, text:"AMQJS0006E Bad Connack return code:{0} {1}."},
		SOCKET_ERROR: {code:7, text:"AMQJS0007E Socket error:{0}."},
		SOCKET_CLOSE: {code:8, text:"AMQJS0008I Socket closed."},
		MALFORMED_UTF: {code:9, text:"AMQJS0009E Malformed UTF data:{0} {1} {2}."},
		UNSUPPORTED: {code:10, text:"AMQJS0010E {0} is not supported by this browser."},
		INVALID_STATE: {code:11, text:"AMQJS0011E Invalid state {0}."},
		INVALID_TYPE: {code:12, text:"AMQJS0012E Invalid type {0} for {1}."},
		INVALID_ARGUMENT: {code:13, text:"AMQJS0013E Invalid argument {0} for {1}."},
		UNSUPPORTED_OPERATION: {code:14, text:"AMQJS0014E Unsupported operation."},
		INVALID_STORED_DATA: {code:15, text:"AMQJS0015E Invalid data in local storage key={0} value={1}."},
		INVALID_MQTT_MESSAGE_TYPE: {code:16, text:"AMQJS0016E Invalid MQTT message type {0}."},
		MALFORMED_UNICODE: {code:17, text:"AMQJS0017E Malformed Unicode string:{0} {1}."},
	};
	
	/** CONNACK RC Meaning. */
	var CONNACK_RC = {
		0:"Connection Accepted",
		1:"Connection Refused: unacceptable protocol version",
		2:"Connection Refused: identifier rejected",
		3:"Connection Refused: server unavailable",
		4:"Connection Refused: bad user name or password",
		5:"Connection Refused: not authorized"
	};

	/**
	 * Format an error message text.
	 * @private
	 * @param {error} ERROR.KEY value above.
	 * @param {substitutions} [array] substituted into the text.
	 * @return the text with the substitutions made.
	 */
	var format = function(error, substitutions) {
		var text = error.text;
		if (substitutions) {
		  var field,start;
		  for (var i=0; i<substitutions.length; i++) {
			field = "{"+i+"}";
			start = text.indexOf(field);
			if(start > 0) {
				var part1 = text.substring(0,start);
				var part2 = text.substring(start+field.length);
				text = part1+substitutions[i]+part2;
			}
		  }
		}
		return text;
	};
	
	//MQTT protocol and version          6    M    Q    I    s    d    p    3
	var MqttProtoIdentifierv3 = [0x00,0x06,0x4d,0x51,0x49,0x73,0x64,0x70,0x03];
	//MQTT proto/version for 311         4    M    Q    T    T    4
	var MqttProtoIdentifierv4 = [0x00,0x04,0x4d,0x51,0x54,0x54,0x04];
	
	/**
	 * Construct an MQTT wire protocol message.
	 * @param type MQTT packet type.
	 * @param options optional wire message attributes.
	 * 
	 * Optional properties
	 * 
	 * messageIdentifier: message ID in the range [0..65535]
	 * payloadMessage:	Application Message - PUBLISH only
	 * connectStrings:	array of 0 or more Strings to be put into the CONNECT payload
	 * topics:			array of strings (SUBSCRIBE, UNSUBSCRIBE)
	 * requestQoS:		array of QoS values [0..2]
	 *  
	 * "Flag" properties 
	 * cleanSession:	true if present / false if absent (CONNECT)
	 * willMessage:  	true if present / false if absent (CONNECT)
	 * isRetained:		true if present / false if absent (CONNECT)
	 * userName:		true if present / false if absent (CONNECT)
	 * password:		true if present / false if absent (CONNECT)
	 * keepAliveInterval:	integer [0..65535]  (CONNECT)
	 *
	 * @private
	 * @ignore
	 */
	var WireMessage = function (type, options) { 	
		this.type = type;
		for (var name in options) {
			if (options.hasOwnProperty(name)) {
				this[name] = options[name];
			}
		}
	};
	
	WireMessage.prototype.encode = function() {
		// Compute the first byte of the fixed header
		var first = ((this.type & 0x0f) << 4);
		
		/*
		 * Now calculate the length of the variable header + payload by adding up the lengths
		 * of all the component parts
		 */

		var remLength = 0;
		var topicStrLength = new Array();
		var destinationNameLength = 0;
		
		// if the message contains a messageIdentifier then we need two bytes for that
		if (this.messageIdentifier != undefined)
			remLength += 2;

		switch(this.type) {
			// If this a Connect then we need to include 12 bytes for its header
			case MESSAGE_TYPE.CONNECT:
				switch(this.mqttVersion) {
					case 3:
						remLength += MqttProtoIdentifierv3.length + 3;
						break;
					case 4:
						remLength += MqttProtoIdentifierv4.length + 3;
						break;
				}

				remLength += UTF8Length(this.clientId) + 2;
				if (this.willMessage != undefined) {
					remLength += UTF8Length(this.willMessage.destinationName) + 2;
					// Will message is always a string, sent as UTF-8 characters with a preceding length.
					var willMessagePayloadBytes = this.willMessage.payloadBytes;
					if (!(willMessagePayloadBytes instanceof Uint8Array))
						willMessagePayloadBytes = new Uint8Array(payloadBytes);
					remLength += willMessagePayloadBytes.byteLength +2;
				}
				if (this.userName != undefined)
					remLength += UTF8Length(this.userName) + 2;	
				if (this.password != undefined)
					remLength += UTF8Length(this.password) + 2;
			break;

			// Subscribe, Unsubscribe can both contain topic strings
			case MESSAGE_TYPE.SUBSCRIBE:	        	
				first |= 0x02; // Qos = 1;
				for ( var i = 0; i < this.topics.length; i++) {
					topicStrLength[i] = UTF8Length(this.topics[i]);
					remLength += topicStrLength[i] + 2;
				}
				remLength += this.requestedQos.length; // 1 byte for each topic's Qos
				// QoS on Subscribe only
				break;

			case MESSAGE_TYPE.UNSUBSCRIBE:
				first |= 0x02; // Qos = 1;
				for ( var i = 0; i < this.topics.length; i++) {
					topicStrLength[i] = UTF8Length(this.topics[i]);
					remLength += topicStrLength[i] + 2;
				}
				break;

			case MESSAGE_TYPE.PUBREL:
				first |= 0x02; // Qos = 1;
				break;

			case MESSAGE_TYPE.PUBLISH:
				if (this.payloadMessage.duplicate) first |= 0x08;
				first  = first |= (this.payloadMessage.qos << 1);
				if (this.payloadMessage.retained) first |= 0x01;
				destinationNameLength = UTF8Length(this.payloadMessage.destinationName);
				remLength += destinationNameLength + 2;	   
				var payloadBytes = this.payloadMessage.payloadBytes;
				remLength += payloadBytes.byteLength;  
				if (payloadBytes instanceof ArrayBuffer)
					payloadBytes = new Uint8Array(payloadBytes);
				else if (!(payloadBytes instanceof Uint8Array))
					payloadBytes = new Uint8Array(payloadBytes.buffer);
				break;

			case MESSAGE_TYPE.DISCONNECT:
				break;

			default:
				;
		}

		// Now we can allocate a buffer for the message

		var mbi = encodeMBI(remLength);  // Convert the length to MQTT MBI format
		var pos = mbi.length + 1;        // Offset of start of variable header
		var buffer = new ArrayBuffer(remLength + pos);
		var byteStream = new Uint8Array(buffer);    // view it as a sequence of bytes

		//Write the fixed header into the buffer
		byteStream[0] = first;
		byteStream.set(mbi,1);

		// If this is a PUBLISH then the variable header starts with a topic
		if (this.type == MESSAGE_TYPE.PUBLISH)
			pos = writeString(this.payloadMessage.destinationName, destinationNameLength, byteStream, pos);
		// If this is a CONNECT then the variable header contains the protocol name/version, flags and keepalive time
		
		else if (this.type == MESSAGE_TYPE.CONNECT) {
			switch (this.mqttVersion) {
				case 3:
					byteStream.set(MqttProtoIdentifierv3, pos);
					pos += MqttProtoIdentifierv3.length;
					break;
				case 4:
					byteStream.set(MqttProtoIdentifierv4, pos);
					pos += MqttProtoIdentifierv4.length;
					break;
			}
			var connectFlags = 0;
			if (this.cleanSession) 
				connectFlags = 0x02;
			if (this.willMessage != undefined ) {
				connectFlags |= 0x04;
				connectFlags |= (this.willMessage.qos<<3);
				if (this.willMessage.retained) {
					connectFlags |= 0x20;
				}
			}
			if (this.userName != undefined)
				connectFlags |= 0x80;
			if (this.password != undefined)
				connectFlags |= 0x40;
			byteStream[pos++] = connectFlags; 
			pos = writeUint16 (this.keepAliveInterval, byteStream, pos);
		}

		// Output the messageIdentifier - if there is one
		if (this.messageIdentifier != undefined)
			pos = writeUint16 (this.messageIdentifier, byteStream, pos);

		switch(this.type) {
			case MESSAGE_TYPE.CONNECT:
				pos = writeString(this.clientId, UTF8Length(this.clientId), byteStream, pos); 
				if (this.willMessage != undefined) {
					pos = writeString(this.willMessage.destinationName, UTF8Length(this.willMessage.destinationName), byteStream, pos);
					pos = writeUint16(willMessagePayloadBytes.byteLength, byteStream, pos);
					byteStream.set(willMessagePayloadBytes, pos);
					pos += willMessagePayloadBytes.byteLength;
					
				}
			if (this.userName != undefined)
				pos = writeString(this.userName, UTF8Length(this.userName), byteStream, pos);
			if (this.password != undefined) 
				pos = writeString(this.password, UTF8Length(this.password), byteStream, pos);
			break;

			case MESSAGE_TYPE.PUBLISH:	
				// PUBLISH has a text or binary payload, if text do not add a 2 byte length field, just the UTF characters.	
				byteStream.set(payloadBytes, pos);
					
				break;

//    	    case MESSAGE_TYPE.PUBREC:	
//    	    case MESSAGE_TYPE.PUBREL:	
//    	    case MESSAGE_TYPE.PUBCOMP:	
//    	    	break;

			case MESSAGE_TYPE.SUBSCRIBE:
				// SUBSCRIBE has a list of topic strings and request QoS
				for (var i=0; i<this.topics.length; i++) {
					pos = writeString(this.topics[i], topicStrLength[i], byteStream, pos);
					byteStream[pos++] = this.requestedQos[i];
				}
				break;

			case MESSAGE_TYPE.UNSUBSCRIBE:	
				// UNSUBSCRIBE has a list of topic strings
				for (var i=0; i<this.topics.length; i++)
					pos = writeString(this.topics[i], topicStrLength[i], byteStream, pos);
				break;

			default:
				// Do nothing.
		}

		return buffer;
	}	

	function decodeMessage(input,pos) {
	    var startingPos = pos;
		var first = input[pos];
		var type = first >> 4;
		var messageInfo = first &= 0x0f;
		pos += 1;
		

		// Decode the remaining length (MBI format)

		var digit;
		var remLength = 0;
		var multiplier = 1;
		do {
			if (pos == input.length) {
			    return [null,startingPos];
			}
			digit = input[pos++];
			remLength += ((digit & 0x7F) * multiplier);
			multiplier *= 128;
		} while ((digit & 0x80) != 0);
		
		var endPos = pos+remLength;
		if (endPos > input.length) {
		    return [null,startingPos];
		}

		var wireMessage = new WireMessage(type);
		switch(type) {
			case MESSAGE_TYPE.CONNACK:
				var connectAcknowledgeFlags = input[pos++];
				if (connectAcknowledgeFlags & 0x01)
					wireMessage.sessionPresent = true;
				wireMessage.returnCode = input[pos++];
				break;
			
			case MESSAGE_TYPE.PUBLISH:     	    	
				var qos = (messageInfo >> 1) & 0x03;
							
				var len = readUint16(input, pos);
				pos += 2;
				var topicName = parseUTF8(input, pos, len);
				pos += len;
				// If QoS 1 or 2 there will be a messageIdentifier
				if (qos > 0) {
					wireMessage.messageIdentifier = readUint16(input, pos);
					pos += 2;
				}
				
				var message = new Paho.MQTT.Message(input.subarray(pos, endPos));
				if ((messageInfo & 0x01) == 0x01) 
					message.retained = true;
				if ((messageInfo & 0x08) == 0x08)
					message.duplicate =  true;
				message.qos = qos;
				message.destinationName = topicName;
				wireMessage.payloadMessage = message;	
				break;
			
			case  MESSAGE_TYPE.PUBACK:
			case  MESSAGE_TYPE.PUBREC:	    
			case  MESSAGE_TYPE.PUBREL:    
			case  MESSAGE_TYPE.PUBCOMP:
			case  MESSAGE_TYPE.UNSUBACK:    	    	
				wireMessage.messageIdentifier = readUint16(input, pos);
				break;
				
			case  MESSAGE_TYPE.SUBACK:
				wireMessage.messageIdentifier = readUint16(input, pos);
				pos += 2;
				wireMessage.returnCode = input.subarray(pos, endPos);	
				break;
		
			default:
				;
		}
				
		return [wireMessage,endPos];	
	}

	function writeUint16(input, buffer, offset) {
		buffer[offset++] = input >> 8;      //MSB
		buffer[offset++] = input % 256;     //LSB 
		return offset;
	}	

	function writeString(input, utf8Length, buffer, offset) {
		offset = writeUint16(utf8Length, buffer, offset);
		stringToUTF8(input, buffer, offset);
		return offset + utf8Length;
	}	

	function readUint16(buffer, offset) {
		return 256*buffer[offset] + buffer[offset+1];
	}	

	/**
	 * Encodes an MQTT Multi-Byte Integer
	 * @private 
	 */
	function encodeMBI(number) {
		var output = new Array(1);
		var numBytes = 0;

		do {
			var digit = number % 128;
			number = number >> 7;
			if (number > 0) {
				digit |= 0x80;
			}
			output[numBytes++] = digit;
		} while ( (number > 0) && (numBytes<4) );

		return output;
	}

	/**
	 * Takes a String and calculates its length in bytes when encoded in UTF8.
	 * @private
	 */
	function UTF8Length(input) {
		var output = 0;
		for (var i = 0; i<input.length; i++) 
		{
			var charCode = input.charCodeAt(i);
				if (charCode > 0x7FF)
				   {
					  // Surrogate pair means its a 4 byte character
					  if (0xD800 <= charCode && charCode <= 0xDBFF)
						{
						  i++;
						  output++;
						}
				   output +=3;
				   }
			else if (charCode > 0x7F)
				output +=2;
			else
				output++;
		} 
		return output;
	}
	
	/**
	 * Takes a String and writes it into an array as UTF8 encoded bytes.
	 * @private
	 */
	function stringToUTF8(input, output, start) {
		var pos = start;
		for (var i = 0; i<input.length; i++) {
			var charCode = input.charCodeAt(i);
			
			// Check for a surrogate pair.
			if (0xD800 <= charCode && charCode <= 0xDBFF) {
				var lowCharCode = input.charCodeAt(++i);
				if (isNaN(lowCharCode)) {
					throw new Error(format(ERROR.MALFORMED_UNICODE, [charCode, lowCharCode]));
				}
				charCode = ((charCode - 0xD800)<<10) + (lowCharCode - 0xDC00) + 0x10000;
			
			}
			
			if (charCode <= 0x7F) {
				output[pos++] = charCode;
			} else if (charCode <= 0x7FF) {
				output[pos++] = charCode>>6  & 0x1F | 0xC0;
				output[pos++] = charCode     & 0x3F | 0x80;
			} else if (charCode <= 0xFFFF) {    				    
				output[pos++] = charCode>>12 & 0x0F | 0xE0;
				output[pos++] = charCode>>6  & 0x3F | 0x80;   
				output[pos++] = charCode     & 0x3F | 0x80;   
			} else {
				output[pos++] = charCode>>18 & 0x07 | 0xF0;
				output[pos++] = charCode>>12 & 0x3F | 0x80;
				output[pos++] = charCode>>6  & 0x3F | 0x80;
				output[pos++] = charCode     & 0x3F | 0x80;
			};
		} 
		return output;
	}
	
	function parseUTF8(input, offset, length) {
		var output = "";
		var utf16;
		var pos = offset;

		while (pos < offset+length)
		{
			var byte1 = input[pos++];
			if (byte1 < 128)
				utf16 = byte1;
			else 
			{
				var byte2 = input[pos++]-128;
				if (byte2 < 0) 
					throw new Error(format(ERROR.MALFORMED_UTF, [byte1.toString(16), byte2.toString(16),""]));
				if (byte1 < 0xE0)             // 2 byte character
					utf16 = 64*(byte1-0xC0) + byte2;
				else 
				{ 
					var byte3 = input[pos++]-128;
					if (byte3 < 0) 
						throw new Error(format(ERROR.MALFORMED_UTF, [byte1.toString(16), byte2.toString(16), byte3.toString(16)]));
					if (byte1 < 0xF0)        // 3 byte character
						utf16 = 4096*(byte1-0xE0) + 64*byte2 + byte3;
								else
								{
								   var byte4 = input[pos++]-128;
								   if (byte4 < 0) 
						throw new Error(format(ERROR.MALFORMED_UTF, [byte1.toString(16), byte2.toString(16), byte3.toString(16), byte4.toString(16)]));
								   if (byte1 < 0xF8)        // 4 byte character 
										   utf16 = 262144*(byte1-0xF0) + 4096*byte2 + 64*byte3 + byte4;
					   else                     // longer encodings are not supported  
						throw new Error(format(ERROR.MALFORMED_UTF, [byte1.toString(16), byte2.toString(16), byte3.toString(16), byte4.toString(16)]));
								}
				}
			}  

				if (utf16 > 0xFFFF)   // 4 byte character - express as a surrogate pair
				  {
					 utf16 -= 0x10000;
					 output += String.fromCharCode(0xD800 + (utf16 >> 10)); // lead character
					 utf16 = 0xDC00 + (utf16 & 0x3FF);  // trail character
				  }
			output += String.fromCharCode(utf16);
		}
		return output;
	}
	
	/** 
	 * Repeat keepalive requests, monitor responses.
	 * @ignore
	 */
	var Pinger = function(client, window, keepAliveInterval) { 
		this._client = client;        	
		this._window = window;
		this._keepAliveInterval = keepAliveInterval*1000;     	
		this.isReset = false;
		
		var pingReq = new WireMessage(MESSAGE_TYPE.PINGREQ).encode(); 
		
		var doTimeout = function (pinger) {
			return function () {
				return doPing.apply(pinger);
			};
		};
		
		/** @ignore */
		var doPing = function() { 
			if (!this.isReset) {
				this._client._trace("Pinger.doPing", "Timed out");
				this._client._disconnected( ERROR.PING_TIMEOUT.code , format(ERROR.PING_TIMEOUT));
			} else {
				this.isReset = false;
				this._client._trace("Pinger.doPing", "send PINGREQ");
				this._client.socket.send(pingReq); 
				this.timeout = this._window.setTimeout(doTimeout(this), this._keepAliveInterval);
			}
		}

		this.reset = function() {
			this.isReset = true;
			this._window.clearTimeout(this.timeout);
			if (this._keepAliveInterval > 0)
				this.timeout = setTimeout(doTimeout(this), this._keepAliveInterval);
		}

		this.cancel = function() {
			this._window.clearTimeout(this.timeout);
		}
	 }; 

	/**
	 * Monitor request completion.
	 * @ignore
	 */
	var Timeout = function(client, window, timeoutSeconds, action, args) {
		this._window = window;
		if (!timeoutSeconds)
			timeoutSeconds = 30;
		
		var doTimeout = function (action, client, args) {
			return function () {
				return action.apply(client, args);
			};
		};
		this.timeout = setTimeout(doTimeout(action, client, args), timeoutSeconds * 1000);
		
		this.cancel = function() {
			this._window.clearTimeout(this.timeout);
		}
	}; 
	
	/*
	 * Internal implementation of the Websockets MQTT V3.1 client.
	 * 
	 * @name Paho.MQTT.ClientImpl @constructor 
	 * @param {String} host the DNS nameof the webSocket host. 
	 * @param {Number} port the port number for that host.
	 * @param {String} clientId the MQ client identifier.
	 */
	var ClientImpl = function (uri, host, port, path, clientId) {
		// Check dependencies are satisfied in this browser.
		if (!("WebSocket" in global && global["WebSocket"] !== null)) {
			throw new Error(format(ERROR.UNSUPPORTED, ["WebSocket"]));
		}
		if (!("localStorage" in global && global["localStorage"] !== null)) {
			throw new Error(format(ERROR.UNSUPPORTED, ["localStorage"]));
		}
		if (!("ArrayBuffer" in global && global["ArrayBuffer"] !== null)) {
			throw new Error(format(ERROR.UNSUPPORTED, ["ArrayBuffer"]));
		}
		this._trace("Paho.MQTT.Client", uri, host, port, path, clientId);

		this.host = host;
		this.port = port;
		this.path = path;
		this.uri = uri;
		this.clientId = clientId;

		// Local storagekeys are qualified with the following string.
		// The conditional inclusion of path in the key is for backward
		// compatibility to when the path was not configurable and assumed to
		// be /mqtt
		this._localKey=host+":"+port+(path!="/mqtt"?":"+path:"")+":"+clientId+":";

		// Create private instance-only message queue
		// Internal queue of messages to be sent, in sending order. 
		this._msg_queue = [];

		// Messages we have sent and are expecting a response for, indexed by their respective message ids. 
		this._sentMessages = {};

		// Messages we have received and acknowleged and are expecting a confirm message for
		// indexed by their respective message ids. 
		this._receivedMessages = {};

		// Internal list of callbacks to be executed when messages
		// have been successfully sent over web socket, e.g. disconnect
		// when it doesn't have to wait for ACK, just message is dispatched.
		this._notify_msg_sent = {};

		// Unique identifier for SEND messages, incrementing
		// counter as messages are sent.
		this._message_identifier = 1;
		
		// Used to determine the transmission sequence of stored sent messages.
		this._sequence = 0;
		

		// Load the local state, if any, from the saved version, only restore state relevant to this client.   	
		for (var key in localStorage)
			if (   key.indexOf("Sent:"+this._localKey) == 0  		    
				|| key.indexOf("Received:"+this._localKey) == 0)
			this.restore(key);
	};

	// Messaging Client public instance members. 
	ClientImpl.prototype.host;
	ClientImpl.prototype.port;
	ClientImpl.prototype.path;
	ClientImpl.prototype.uri;
	ClientImpl.prototype.clientId;

	// Messaging Client private instance members.
	ClientImpl.prototype.socket;
	/* true once we have received an acknowledgement to a CONNECT packet. */
	ClientImpl.prototype.connected = false;
	/* The largest message identifier allowed, may not be larger than 2**16 but 
	 * if set smaller reduces the maximum number of outbound messages allowed.
	 */ 
	ClientImpl.prototype.maxMessageIdentifier = 65536;
	ClientImpl.prototype.connectOptions;
	ClientImpl.prototype.hostIndex;
	ClientImpl.prototype.onConnectionLost;
	ClientImpl.prototype.onMessageDelivered;
	ClientImpl.prototype.onMessageArrived;
	ClientImpl.prototype.traceFunction;
	ClientImpl.prototype._msg_queue = null;
	ClientImpl.prototype._connectTimeout;
	/* The sendPinger monitors how long we allow before we send data to prove to the server that we are alive. */
	ClientImpl.prototype.sendPinger = null;
	/* The receivePinger monitors how long we allow before we require evidence that the server is alive. */
	ClientImpl.prototype.receivePinger = null;
	
	ClientImpl.prototype.receiveBuffer = null;
	
	ClientImpl.prototype._traceBuffer = null;
	ClientImpl.prototype._MAX_TRACE_ENTRIES = 100;

	ClientImpl.prototype.connect = function (connectOptions) {
		var connectOptionsMasked = this._traceMask(connectOptions, "password"); 
		this._trace("Client.connect", connectOptionsMasked, this.socket, this.connected);
		
		if (this.connected) 
			throw new Error(format(ERROR.INVALID_STATE, ["already connected"]));
		if (this.socket)
			throw new Error(format(ERROR.INVALID_STATE, ["already connected"]));
		
		this.connectOptions = connectOptions;
		
		if (connectOptions.uris) {
			this.hostIndex = 0;
			this._doConnect(connectOptions.uris[0]);  
		} else {
			this._doConnect(this.uri);  		
		}
		
	};

	ClientImpl.prototype.subscribe = function (filter, subscribeOptions) {
		this._trace("Client.subscribe", filter, subscribeOptions);
			  
		if (!this.connected)
			throw new Error(format(ERROR.INVALID_STATE, ["not connected"]));
		
		var wireMessage = new WireMessage(MESSAGE_TYPE.SUBSCRIBE);
		wireMessage.topics=[filter];
		if (subscribeOptions.qos != undefined)
			wireMessage.requestedQos = [subscribeOptions.qos];
		else 
			wireMessage.requestedQos = [0];
		
		if (subscribeOptions.onSuccess) {
			wireMessage.onSuccess = function(grantedQos) {subscribeOptions.onSuccess({invocationContext:subscribeOptions.invocationContext,grantedQos:grantedQos});};
		}

		if (subscribeOptions.onFailure) {
			wireMessage.onFailure = function(errorCode) {subscribeOptions.onFailure({invocationContext:subscribeOptions.invocationContext,errorCode:errorCode});};
		}

		if (subscribeOptions.timeout) {
			wireMessage.timeOut = new Timeout(this, window, subscribeOptions.timeout, subscribeOptions.onFailure
					, [{invocationContext:subscribeOptions.invocationContext, 
						errorCode:ERROR.SUBSCRIBE_TIMEOUT.code, 
						errorMessage:format(ERROR.SUBSCRIBE_TIMEOUT)}]);
		}
		
		// All subscriptions return a SUBACK. 
		this._requires_ack(wireMessage);
		this._schedule_message(wireMessage);
	};

	/** @ignore */
	ClientImpl.prototype.unsubscribe = function(filter, unsubscribeOptions) {  
		this._trace("Client.unsubscribe", filter, unsubscribeOptions);
		
		if (!this.connected)
		   throw new Error(format(ERROR.INVALID_STATE, ["not connected"]));
		
		var wireMessage = new WireMessage(MESSAGE_TYPE.UNSUBSCRIBE);
		wireMessage.topics = [filter];
		
		if (unsubscribeOptions.onSuccess) {
			wireMessage.callback = function() {unsubscribeOptions.onSuccess({invocationContext:unsubscribeOptions.invocationContext});};
		}
		if (unsubscribeOptions.timeout) {
			wireMessage.timeOut = new Timeout(this, window, unsubscribeOptions.timeout, unsubscribeOptions.onFailure
					, [{invocationContext:unsubscribeOptions.invocationContext,
						errorCode:ERROR.UNSUBSCRIBE_TIMEOUT.code,
						errorMessage:format(ERROR.UNSUBSCRIBE_TIMEOUT)}]);
		}
	 
		// All unsubscribes return a SUBACK.         
		this._requires_ack(wireMessage);
		this._schedule_message(wireMessage);
	};
	 
	ClientImpl.prototype.send = function (message) {
		this._trace("Client.send", message);

		if (!this.connected)
		   throw new Error(format(ERROR.INVALID_STATE, ["not connected"]));
		
		wireMessage = new WireMessage(MESSAGE_TYPE.PUBLISH);
		wireMessage.payloadMessage = message;
		
		if (message.qos > 0)
			this._requires_ack(wireMessage);
		else if (this.onMessageDelivered)
			this._notify_msg_sent[wireMessage] = this.onMessageDelivered(wireMessage.payloadMessage);
		this._schedule_message(wireMessage);
	};
	
	ClientImpl.prototype.disconnect = function () {
		this._trace("Client.disconnect");

		if (!this.socket)
			throw new Error(format(ERROR.INVALID_STATE, ["not connecting or connected"]));
		
		wireMessage = new WireMessage(MESSAGE_TYPE.DISCONNECT);

		// Run the disconnected call back as soon as the message has been sent,
		// in case of a failure later on in the disconnect processing.
		// as a consequence, the _disconected call back may be run several times.
		this._notify_msg_sent[wireMessage] = scope(this._disconnected, this);

		this._schedule_message(wireMessage);
	};
	
	ClientImpl.prototype.getTraceLog = function () {
		if ( this._traceBuffer !== null ) {
			this._trace("Client.getTraceLog", new Date());
			this._trace("Client.getTraceLog in flight messages", this._sentMessages.length);
			for (var key in this._sentMessages)
				this._trace("_sentMessages ",key, this._sentMessages[key]);
			for (var key in this._receivedMessages)
				this._trace("_receivedMessages ",key, this._receivedMessages[key]);
			
			return this._traceBuffer;
		}
	};
	
	ClientImpl.prototype.startTrace = function () {
		if ( this._traceBuffer === null ) {
			this._traceBuffer = [];
		}
		this._trace("Client.startTrace", new Date(), version);
	};
	
	ClientImpl.prototype.stopTrace = function () {
		delete this._traceBuffer;
	};

	ClientImpl.prototype._doConnect = function (wsurl) { 	        
		// When the socket is open, this client will send the CONNECT WireMessage using the saved parameters. 
		if (this.connectOptions.useSSL) {
		    var uriParts = wsurl.split(":");
		    uriParts[0] = "wss";
		    wsurl = uriParts.join(":");
		}
		this.connected = false;
		if (this.connectOptions.mqttVersion < 4) {
			this.socket = new WebSocket(wsurl, ["mqttv3.1"]);
		} else {
			this.socket = new WebSocket(wsurl, ["mqtt"]);
		}
		this.socket.binaryType = 'arraybuffer';
		
		this.socket.onopen = scope(this._on_socket_open, this);
		this.socket.onmessage = scope(this._on_socket_message, this);
		this.socket.onerror = scope(this._on_socket_error, this);
		this.socket.onclose = scope(this._on_socket_close, this);
		
		this.sendPinger = new Pinger(this, window, this.connectOptions.keepAliveInterval);
		this.receivePinger = new Pinger(this, window, this.connectOptions.keepAliveInterval);
		
		this._connectTimeout = new Timeout(this, window, this.connectOptions.timeout, this._disconnected,  [ERROR.CONNECT_TIMEOUT.code, format(ERROR.CONNECT_TIMEOUT)]);
	};

	
	// Schedule a new message to be sent over the WebSockets
	// connection. CONNECT messages cause WebSocket connection
	// to be started. All other messages are queued internally
	// until this has happened. When WS connection starts, process
	// all outstanding messages. 
	ClientImpl.prototype._schedule_message = function (message) {
		this._msg_queue.push(message);
		// Process outstanding messages in the queue if we have an  open socket, and have received CONNACK. 
		if (this.connected) {
			this._process_queue();
		}
	};

	ClientImpl.prototype.store = function(prefix, wireMessage) {
		var storedMessage = {type:wireMessage.type, messageIdentifier:wireMessage.messageIdentifier, version:1};
		
		switch(wireMessage.type) {
		  case MESSAGE_TYPE.PUBLISH:
			  if(wireMessage.pubRecReceived)
				  storedMessage.pubRecReceived = true;
			  
			  // Convert the payload to a hex string.
			  storedMessage.payloadMessage = {};
			  var hex = "";
			  var messageBytes = wireMessage.payloadMessage.payloadBytes;
			  for (var i=0; i<messageBytes.length; i++) {
				if (messageBytes[i] <= 0xF)
				  hex = hex+"0"+messageBytes[i].toString(16);
				else 
				  hex = hex+messageBytes[i].toString(16);
			  }
			  storedMessage.payloadMessage.payloadHex = hex;
			  
			  storedMessage.payloadMessage.qos = wireMessage.payloadMessage.qos;
			  storedMessage.payloadMessage.destinationName = wireMessage.payloadMessage.destinationName;
			  if (wireMessage.payloadMessage.duplicate) 
				  storedMessage.payloadMessage.duplicate = true;
			  if (wireMessage.payloadMessage.retained) 
				  storedMessage.payloadMessage.retained = true;	   
			  
			  // Add a sequence number to sent messages.
			  if ( prefix.indexOf("Sent:") == 0 ) {
				  if ( wireMessage.sequence === undefined )
					  wireMessage.sequence = ++this._sequence;
				  storedMessage.sequence = wireMessage.sequence;
			  }
			  break;    
			  
			default:
				throw Error(format(ERROR.INVALID_STORED_DATA, [key, storedMessage]));
		}
		localStorage.setItem(prefix+this._localKey+wireMessage.messageIdentifier, JSON.stringify(storedMessage));
	};
	
	ClientImpl.prototype.restore = function(key) {    	
		var value = localStorage.getItem(key);
		var storedMessage = JSON.parse(value);
		
		var wireMessage = new WireMessage(storedMessage.type, storedMessage);
		
		switch(storedMessage.type) {
		  case MESSAGE_TYPE.PUBLISH:
			  // Replace the payload message with a Message object.
			  var hex = storedMessage.payloadMessage.payloadHex;
			  var buffer = new ArrayBuffer((hex.length)/2);
			  var byteStream = new Uint8Array(buffer); 
			  var i = 0;
			  while (hex.length >= 2) { 
				  var x = parseInt(hex.substring(0, 2), 16);
				  hex = hex.substring(2, hex.length);
				  byteStream[i++] = x;
			  }
			  var payloadMessage = new Paho.MQTT.Message(byteStream);
			  
			  payloadMessage.qos = storedMessage.payloadMessage.qos;
			  payloadMessage.destinationName = storedMessage.payloadMessage.destinationName;
			  if (storedMessage.payloadMessage.duplicate) 
				  payloadMessage.duplicate = true;
			  if (storedMessage.payloadMessage.retained) 
				  payloadMessage.retained = true;	 
			  wireMessage.payloadMessage = payloadMessage;
			  
			  break;    
			  
			default:
			  throw Error(format(ERROR.INVALID_STORED_DATA, [key, value]));
		}
							
		if (key.indexOf("Sent:"+this._localKey) == 0) {
			wireMessage.payloadMessage.duplicate = true;
			this._sentMessages[wireMessage.messageIdentifier] = wireMessage;    		    
		} else if (key.indexOf("Received:"+this._localKey) == 0) {
			this._receivedMessages[wireMessage.messageIdentifier] = wireMessage;
		}
	};
	
	ClientImpl.prototype._process_queue = function () {
		var message = null;
		// Process messages in order they were added
		var fifo = this._msg_queue.reverse();

		// Send all queued messages down socket connection
		while ((message = fifo.pop())) {
			this._socket_send(message);
			// Notify listeners that message was successfully sent
			if (this._notify_msg_sent[message]) {
				this._notify_msg_sent[message]();
				delete this._notify_msg_sent[message];
			}
		}
	};

	/**
	 * Expect an ACK response for this message. Add message to the set of in progress
	 * messages and set an unused identifier in this message.
	 * @ignore
	 */
	ClientImpl.prototype._requires_ack = function (wireMessage) {
		var messageCount = Object.keys(this._sentMessages).length;
		if (messageCount > this.maxMessageIdentifier)
			throw Error ("Too many messages:"+messageCount);

		while(this._sentMessages[this._message_identifier] !== undefined) {
			this._message_identifier++;
		}
		wireMessage.messageIdentifier = this._message_identifier;
		this._sentMessages[wireMessage.messageIdentifier] = wireMessage;
		if (wireMessage.type === MESSAGE_TYPE.PUBLISH) {
			this.store("Sent:", wireMessage);
		}
		if (this._message_identifier === this.maxMessageIdentifier) {
			this._message_identifier = 1;
		}
	};

	/** 
	 * Called when the underlying websocket has been opened.
	 * @ignore
	 */
	ClientImpl.prototype._on_socket_open = function () {      
		// Create the CONNECT message object.
		var wireMessage = new WireMessage(MESSAGE_TYPE.CONNECT, this.connectOptions); 
		wireMessage.clientId = this.clientId;
		this._socket_send(wireMessage);
	};

	/** 
	 * Called when the underlying websocket has received a complete packet.
	 * @ignore
	 */
	ClientImpl.prototype._on_socket_message = function (event) {
		this._trace("Client._on_socket_message", event.data);
		// Reset the receive ping timer, we now have evidence the server is alive.
		this.receivePinger.reset();
		var messages = this._deframeMessages(event.data);
		for (var i = 0; i < messages.length; i+=1) {
		    this._handleMessage(messages[i]);
		}
	}
	
	ClientImpl.prototype._deframeMessages = function(data) {
		var byteArray = new Uint8Array(data);
	    if (this.receiveBuffer) {
	        var newData = new Uint8Array(this.receiveBuffer.length+byteArray.length);
	        newData.set(this.receiveBuffer);
	        newData.set(byteArray,this.receiveBuffer.length);
	        byteArray = newData;
	        delete this.receiveBuffer;
	    }
		try {
		    var offset = 0;
		    var messages = [];
		    while(offset < byteArray.length) {
		        var result = decodeMessage(byteArray,offset);
		        var wireMessage = result[0];
		        offset = result[1];
		        if (wireMessage !== null) {
		            messages.push(wireMessage);
		        } else {
		            break;
		        }
		    }
		    if (offset < byteArray.length) {
		    	this.receiveBuffer = byteArray.subarray(offset);
		    }
		} catch (error) {
			this._disconnected(ERROR.INTERNAL_ERROR.code , format(ERROR.INTERNAL_ERROR, [error.message,error.stack.toString()]));
			return;
		}
		return messages;
	}
	
	ClientImpl.prototype._handleMessage = function(wireMessage) {
		
		this._trace("Client._handleMessage", wireMessage);

		try {
			switch(wireMessage.type) {
			case MESSAGE_TYPE.CONNACK:
				this._connectTimeout.cancel();
				
				// If we have started using clean session then clear up the local state.
				if (this.connectOptions.cleanSession) {
					for (var key in this._sentMessages) {	    		
						var sentMessage = this._sentMessages[key];
						localStorage.removeItem("Sent:"+this._localKey+sentMessage.messageIdentifier);
					}
					this._sentMessages = {};

					for (var key in this._receivedMessages) {
						var receivedMessage = this._receivedMessages[key];
						localStorage.removeItem("Received:"+this._localKey+receivedMessage.messageIdentifier);
					}
					this._receivedMessages = {};
				}
				// Client connected and ready for business.
				if (wireMessage.returnCode === 0) {
					this.connected = true;
					// Jump to the end of the list of uris and stop looking for a good host.
					if (this.connectOptions.uris)
						this.hostIndex = this.connectOptions.uris.length;
				} else {
					this._disconnected(ERROR.CONNACK_RETURNCODE.code , format(ERROR.CONNACK_RETURNCODE, [wireMessage.returnCode, CONNACK_RC[wireMessage.returnCode]]));
					break;
				}
				
				// Resend messages.
				var sequencedMessages = new Array();
				for (var msgId in this._sentMessages) {
					if (this._sentMessages.hasOwnProperty(msgId))
						sequencedMessages.push(this._sentMessages[msgId]);
				}
		  
				// Sort sentMessages into the original sent order.
				var sequencedMessages = sequencedMessages.sort(function(a,b) {return a.sequence - b.sequence;} );
				for (var i=0, len=sequencedMessages.length; i<len; i++) {
					var sentMessage = sequencedMessages[i];
					if (sentMessage.type == MESSAGE_TYPE.PUBLISH && sentMessage.pubRecReceived) {
						var pubRelMessage = new WireMessage(MESSAGE_TYPE.PUBREL, {messageIdentifier:sentMessage.messageIdentifier});
						this._schedule_message(pubRelMessage);
					} else {
						this._schedule_message(sentMessage);
					};
				}

				// Execute the connectOptions.onSuccess callback if there is one.
				if (this.connectOptions.onSuccess) {
					this.connectOptions.onSuccess({invocationContext:this.connectOptions.invocationContext});
				}

				// Process all queued messages now that the connection is established. 
				this._process_queue();
				break;
		
			case MESSAGE_TYPE.PUBLISH:
				this._receivePublish(wireMessage);
				break;

			case MESSAGE_TYPE.PUBACK:
				var sentMessage = this._sentMessages[wireMessage.messageIdentifier];
				 // If this is a re flow of a PUBACK after we have restarted receivedMessage will not exist.
				if (sentMessage) {
					delete this._sentMessages[wireMessage.messageIdentifier];
					localStorage.removeItem("Sent:"+this._localKey+wireMessage.messageIdentifier);
					if (this.onMessageDelivered)
						this.onMessageDelivered(sentMessage.payloadMessage);
				}
				break;
			
			case MESSAGE_TYPE.PUBREC:
				var sentMessage = this._sentMessages[wireMessage.messageIdentifier];
				// If this is a re flow of a PUBREC after we have restarted receivedMessage will not exist.
				if (sentMessage) {
					sentMessage.pubRecReceived = true;
					var pubRelMessage = new WireMessage(MESSAGE_TYPE.PUBREL, {messageIdentifier:wireMessage.messageIdentifier});
					this.store("Sent:", sentMessage);
					this._schedule_message(pubRelMessage);
				}
				break;
								
			case MESSAGE_TYPE.PUBREL:
				var receivedMessage = this._receivedMessages[wireMessage.messageIdentifier];
				localStorage.removeItem("Received:"+this._localKey+wireMessage.messageIdentifier);
				// If this is a re flow of a PUBREL after we have restarted receivedMessage will not exist.
				if (receivedMessage) {
					this._receiveMessage(receivedMessage);
					delete this._receivedMessages[wireMessage.messageIdentifier];
				}
				// Always flow PubComp, we may have previously flowed PubComp but the server lost it and restarted.
				var pubCompMessage = new WireMessage(MESSAGE_TYPE.PUBCOMP, {messageIdentifier:wireMessage.messageIdentifier});
				this._schedule_message(pubCompMessage);                    
				break;

			case MESSAGE_TYPE.PUBCOMP: 
				var sentMessage = this._sentMessages[wireMessage.messageIdentifier];
				delete this._sentMessages[wireMessage.messageIdentifier];
				localStorage.removeItem("Sent:"+this._localKey+wireMessage.messageIdentifier);
				if (this.onMessageDelivered)
					this.onMessageDelivered(sentMessage.payloadMessage);
				break;
				
			case MESSAGE_TYPE.SUBACK:
				var sentMessage = this._sentMessages[wireMessage.messageIdentifier];
				if (sentMessage) {
					if(sentMessage.timeOut)
						sentMessage.timeOut.cancel();
					wireMessage.returnCode.indexOf = Array.prototype.indexOf;
					if (wireMessage.returnCode.indexOf(0x80) !== -1) {
						if (sentMessage.onFailure) {
							sentMessage.onFailure(wireMessage.returnCode);
						} 
					} else if (sentMessage.onSuccess) {
						sentMessage.onSuccess(wireMessage.returnCode);
					}
					delete this._sentMessages[wireMessage.messageIdentifier];
				}
				break;
				
			case MESSAGE_TYPE.UNSUBACK:
				var sentMessage = this._sentMessages[wireMessage.messageIdentifier];
				if (sentMessage) { 
					if (sentMessage.timeOut)
						sentMessage.timeOut.cancel();
					if (sentMessage.callback) {
						sentMessage.callback();
					}
					delete this._sentMessages[wireMessage.messageIdentifier];
				}

				break;
				
			case MESSAGE_TYPE.PINGRESP:
				/* The sendPinger or receivePinger may have sent a ping, the receivePinger has already been reset. */
				this.sendPinger.reset();
				break;
				
			case MESSAGE_TYPE.DISCONNECT:
				// Clients do not expect to receive disconnect packets.
				this._disconnected(ERROR.INVALID_MQTT_MESSAGE_TYPE.code , format(ERROR.INVALID_MQTT_MESSAGE_TYPE, [wireMessage.type]));
				break;

			default:
				this._disconnected(ERROR.INVALID_MQTT_MESSAGE_TYPE.code , format(ERROR.INVALID_MQTT_MESSAGE_TYPE, [wireMessage.type]));
			};
		} catch (error) {
			this._disconnected(ERROR.INTERNAL_ERROR.code , format(ERROR.INTERNAL_ERROR, [error.message,error.stack.toString()]));
			return;
		}
	};
	
	/** @ignore */
	ClientImpl.prototype._on_socket_error = function (error) {
		this._disconnected(ERROR.SOCKET_ERROR.code , format(ERROR.SOCKET_ERROR, [error.data]));
	};

	/** @ignore */
	ClientImpl.prototype._on_socket_close = function () {
		this._disconnected(ERROR.SOCKET_CLOSE.code , format(ERROR.SOCKET_CLOSE));
	};

	/** @ignore */
	ClientImpl.prototype._socket_send = function (wireMessage) {
		
		if (wireMessage.type == 1) {
			var wireMessageMasked = this._traceMask(wireMessage, "password"); 
			this._trace("Client._socket_send", wireMessageMasked);
		}
		else this._trace("Client._socket_send", wireMessage);
		
		this.socket.send(wireMessage.encode());
		/* We have proved to the server we are alive. */
		this.sendPinger.reset();
	};
	
	/** @ignore */
	ClientImpl.prototype._receivePublish = function (wireMessage) {
		switch(wireMessage.payloadMessage.qos) {
			case "undefined":
			case 0:
				this._receiveMessage(wireMessage);
				break;

			case 1:
				var pubAckMessage = new WireMessage(MESSAGE_TYPE.PUBACK, {messageIdentifier:wireMessage.messageIdentifier});
				this._schedule_message(pubAckMessage);
				this._receiveMessage(wireMessage);
				break;

			case 2:
				this._receivedMessages[wireMessage.messageIdentifier] = wireMessage;
				this.store("Received:", wireMessage);
				var pubRecMessage = new WireMessage(MESSAGE_TYPE.PUBREC, {messageIdentifier:wireMessage.messageIdentifier});
				this._schedule_message(pubRecMessage);

				break;

			default:
				throw Error("Invaild qos="+wireMmessage.payloadMessage.qos);
		};
	};

	/** @ignore */
	ClientImpl.prototype._receiveMessage = function (wireMessage) {
		if (this.onMessageArrived) {
			this.onMessageArrived(wireMessage.payloadMessage);
		}
	};

	/**
	 * Client has disconnected either at its own request or because the server
	 * or network disconnected it. Remove all non-durable state.
	 * @param {errorCode} [number] the error number.
	 * @param {errorText} [string] the error text.
	 * @ignore
	 */
	ClientImpl.prototype._disconnected = function (errorCode, errorText) {
		this._trace("Client._disconnected", errorCode, errorText);
		
		this.sendPinger.cancel();
		this.receivePinger.cancel();
		if (this._connectTimeout)
			this._connectTimeout.cancel();
		// Clear message buffers.
		this._msg_queue = [];
		this._notify_msg_sent = {};
	   
		if (this.socket) {
			// Cancel all socket callbacks so that they cannot be driven again by this socket.
			this.socket.onopen = null;
			this.socket.onmessage = null;
			this.socket.onerror = null;
			this.socket.onclose = null;
			if (this.socket.readyState === 1)
				this.socket.close();
			delete this.socket;           
		}
		
		if (this.connectOptions.uris && this.hostIndex < this.connectOptions.uris.length-1) {
			// Try the next host.
			this.hostIndex++;
			this._doConnect(this.connectOptions.uris[this.hostIndex]);
		
		} else {
		
			if (errorCode === undefined) {
				errorCode = ERROR.OK.code;
				errorText = format(ERROR.OK);
			}
			
			// Run any application callbacks last as they may attempt to reconnect and hence create a new socket.
			if (this.connected) {
				this.connected = false;
				// Execute the connectionLostCallback if there is one, and we were connected.       
				if (this.onConnectionLost)
					this.onConnectionLost({errorCode:errorCode, errorMessage:errorText});      	
			} else {
				// Otherwise we never had a connection, so indicate that the connect has failed.
				if (this.connectOptions.mqttVersion === 4 && this.connectOptions.mqttVersionExplicit === false) {
					this._trace("Failed to connect V4, dropping back to V3")
					this.connectOptions.mqttVersion = 3;
					if (this.connectOptions.uris) {
						this.hostIndex = 0;
						this._doConnect(this.connectOptions.uris[0]);  
					} else {
						this._doConnect(this.uri);
					}	
				} else if(this.connectOptions.onFailure) {
					this.connectOptions.onFailure({invocationContext:this.connectOptions.invocationContext, errorCode:errorCode, errorMessage:errorText});
				}
			}
		}
	};

	/** @ignore */
	ClientImpl.prototype._trace = function () {
		// Pass trace message back to client's callback function
		if (this.traceFunction) {
			for (var i in arguments)
			{	
				if (typeof arguments[i] !== "undefined")
					arguments[i] = JSON.stringify(arguments[i]);
			}
			var record = Array.prototype.slice.call(arguments).join("");
			this.traceFunction ({severity: "Debug", message: record	});
		}

		//buffer style trace
		if ( this._traceBuffer !== null ) {  
			for (var i = 0, max = arguments.length; i < max; i++) {
				if ( this._traceBuffer.length == this._MAX_TRACE_ENTRIES ) {    
					this._traceBuffer.shift();              
				}
				if (i === 0) this._traceBuffer.push(arguments[i]);
				else if (typeof arguments[i] === "undefined" ) this._traceBuffer.push(arguments[i]);
				else this._traceBuffer.push("  "+JSON.stringify(arguments[i]));
		   };
		};
	};
	
	/** @ignore */
	ClientImpl.prototype._traceMask = function (traceObject, masked) {
		var traceObjectMasked = {};
		for (var attr in traceObject) {
			if (traceObject.hasOwnProperty(attr)) {
				if (attr == masked) 
					traceObjectMasked[attr] = "******";
				else
					traceObjectMasked[attr] = traceObject[attr];
			} 
		}
		return traceObjectMasked;
	};

	// ------------------------------------------------------------------------
	// Public Programming interface.
	// ------------------------------------------------------------------------
	
	/** 
	 * The JavaScript application communicates to the server using a {@link Paho.MQTT.Client} object. 
	 * <p>
	 * Most applications will create just one Client object and then call its connect() method,
	 * however applications can create more than one Client object if they wish. 
	 * In this case the combination of host, port and clientId attributes must be different for each Client object.
	 * <p>
	 * The send, subscribe and unsubscribe methods are implemented as asynchronous JavaScript methods 
	 * (even though the underlying protocol exchange might be synchronous in nature). 
	 * This means they signal their completion by calling back to the application, 
	 * via Success or Failure callback functions provided by the application on the method in question. 
	 * Such callbacks are called at most once per method invocation and do not persist beyond the lifetime 
	 * of the script that made the invocation.
	 * <p>
	 * In contrast there are some callback functions, most notably <i>onMessageArrived</i>, 
	 * that are defined on the {@link Paho.MQTT.Client} object.  
	 * These may get called multiple times, and aren't directly related to specific method invocations made by the client. 
	 *
	 * @name Paho.MQTT.Client    
	 * 
	 * @constructor
	 *  
	 * @param {string} host - the address of the messaging server, as a fully qualified WebSocket URI, as a DNS name or dotted decimal IP address.
	 * @param {number} port - the port number to connect to - only required if host is not a URI
	 * @param {string} path - the path on the host to connect to - only used if host is not a URI. Default: '/mqtt'.
	 * @param {string} clientId - the Messaging client identifier, between 1 and 23 characters in length.
	 * 
	 * @property {string} host - <i>read only</i> the server's DNS hostname or dotted decimal IP address.
	 * @property {number} port - <i>read only</i> the server's port.
	 * @property {string} path - <i>read only</i> the server's path.
	 * @property {string} clientId - <i>read only</i> used when connecting to the server.
	 * @property {function} onConnectionLost - called when a connection has been lost. 
	 *                            after a connect() method has succeeded.
	 *                            Establish the call back used when a connection has been lost. The connection may be
	 *                            lost because the client initiates a disconnect or because the server or network 
	 *                            cause the client to be disconnected. The disconnect call back may be called without 
	 *                            the connectionComplete call back being invoked if, for example the client fails to 
	 *                            connect.
	 *                            A single response object parameter is passed to the onConnectionLost callback containing the following fields:
	 *                            <ol>   
	 *                            <li>errorCode
	 *                            <li>errorMessage       
	 *                            </ol>
	 * @property {function} onMessageDelivered called when a message has been delivered. 
	 *                            All processing that this Client will ever do has been completed. So, for example,
	 *                            in the case of a Qos=2 message sent by this client, the PubComp flow has been received from the server
	 *                            and the message has been removed from persistent storage before this callback is invoked. 
	 *                            Parameters passed to the onMessageDelivered callback are:
	 *                            <ol>   
	 *                            <li>{@link Paho.MQTT.Message} that was delivered.
	 *                            </ol>    
	 * @property {function} onMessageArrived called when a message has arrived in this Paho.MQTT.client. 
	 *                            Parameters passed to the onMessageArrived callback are:
	 *                            <ol>   
	 *                            <li>{@link Paho.MQTT.Message} that has arrived.
	 *                            </ol>    
	 */
	var Client = function (host, port, path, clientId) {
	    
	    var uri;
	    
		if (typeof host !== "string")
			throw new Error(format(ERROR.INVALID_TYPE, [typeof host, "host"]));
	    
	    if (arguments.length == 2) {
	        // host: must be full ws:// uri
	        // port: clientId
	        clientId = port;
	        uri = host;
	        var match = uri.match(/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/);
	        if (match) {
	            host = match[4]||match[2];
	            port = parseInt(match[7]);
	            path = match[8];
	        } else {
	            throw new Error(format(ERROR.INVALID_ARGUMENT,[host,"host"]));
	        }
	    } else {
	        if (arguments.length == 3) {
				clientId = path;
				path = "/mqtt";
			}
			if (typeof port !== "number" || port < 0)
				throw new Error(format(ERROR.INVALID_TYPE, [typeof port, "port"]));
			if (typeof path !== "string")
				throw new Error(format(ERROR.INVALID_TYPE, [typeof path, "path"]));
			
			var ipv6AddSBracket = (host.indexOf(":") != -1 && host.slice(0,1) != "[" && host.slice(-1) != "]");
			uri = "ws://"+(ipv6AddSBracket?"["+host+"]":host)+":"+port+path;
		}

		var clientIdLength = 0;
		for (var i = 0; i<clientId.length; i++) {
			var charCode = clientId.charCodeAt(i);                   
			if (0xD800 <= charCode && charCode <= 0xDBFF)  {    			
				 i++; // Surrogate pair.
			}   		   
			clientIdLength++;
		}     	   	
		if (typeof clientId !== "string" || clientIdLength > 65535)
			throw new Error(format(ERROR.INVALID_ARGUMENT, [clientId, "clientId"])); 
		
		var client = new ClientImpl(uri, host, port, path, clientId);
		this._getHost =  function() { return host; };
		this._setHost = function() { throw new Error(format(ERROR.UNSUPPORTED_OPERATION)); };
			
		this._getPort = function() { return port; };
		this._setPort = function() { throw new Error(format(ERROR.UNSUPPORTED_OPERATION)); };

		this._getPath = function() { return path; };
		this._setPath = function() { throw new Error(format(ERROR.UNSUPPORTED_OPERATION)); };

		this._getURI = function() { return uri; };
		this._setURI = function() { throw new Error(format(ERROR.UNSUPPORTED_OPERATION)); };
		
		this._getClientId = function() { return client.clientId; };
		this._setClientId = function() { throw new Error(format(ERROR.UNSUPPORTED_OPERATION)); };
		
		this._getOnConnectionLost = function() { return client.onConnectionLost; };
		this._setOnConnectionLost = function(newOnConnectionLost) { 
			if (typeof newOnConnectionLost === "function")
				client.onConnectionLost = newOnConnectionLost;
			else 
				throw new Error(format(ERROR.INVALID_TYPE, [typeof newOnConnectionLost, "onConnectionLost"]));
		};

		this._getOnMessageDelivered = function() { return client.onMessageDelivered; };
		this._setOnMessageDelivered = function(newOnMessageDelivered) { 
			if (typeof newOnMessageDelivered === "function")
				client.onMessageDelivered = newOnMessageDelivered;
			else 
				throw new Error(format(ERROR.INVALID_TYPE, [typeof newOnMessageDelivered, "onMessageDelivered"]));
		};
	   
		this._getOnMessageArrived = function() { return client.onMessageArrived; };
		this._setOnMessageArrived = function(newOnMessageArrived) { 
			if (typeof newOnMessageArrived === "function")
				client.onMessageArrived = newOnMessageArrived;
			else 
				throw new Error(format(ERROR.INVALID_TYPE, [typeof newOnMessageArrived, "onMessageArrived"]));
		};

		this._getTrace = function() { return client.traceFunction; };
		this._setTrace = function(trace) {
			if(typeof trace === "function"){
				client.traceFunction = trace;
			}else{
				throw new Error(format(ERROR.INVALID_TYPE, [typeof trace, "onTrace"]));
			}
		};
		
		/** 
		 * Connect this Messaging client to its server. 
		 * 
		 * @name Paho.MQTT.Client#connect
		 * @function
		 * @param {Object} connectOptions - attributes used with the connection. 
		 * @param {number} connectOptions.timeout - If the connect has not succeeded within this 
		 *                    number of seconds, it is deemed to have failed.
		 *                    The default is 30 seconds.
		 * @param {string} connectOptions.userName - Authentication username for this connection.
		 * @param {string} connectOptions.password - Authentication password for this connection.
		 * @param {Paho.MQTT.Message} connectOptions.willMessage - sent by the server when the client
		 *                    disconnects abnormally.
		 * @param {Number} connectOptions.keepAliveInterval - the server disconnects this client if
		 *                    there is no activity for this number of seconds.
		 *                    The default value of 60 seconds is assumed if not set.
		 * @param {boolean} connectOptions.cleanSession - if true(default) the client and server 
		 *                    persistent state is deleted on successful connect.
		 * @param {boolean} connectOptions.useSSL - if present and true, use an SSL Websocket connection.
		 * @param {object} connectOptions.invocationContext - passed to the onSuccess callback or onFailure callback.
		 * @param {function} connectOptions.onSuccess - called when the connect acknowledgement 
		 *                    has been received from the server.
		 * A single response object parameter is passed to the onSuccess callback containing the following fields:
		 * <ol>
		 * <li>invocationContext as passed in to the onSuccess method in the connectOptions.       
		 * </ol>
		 * @config {function} [onFailure] called when the connect request has failed or timed out.
		 * A single response object parameter is passed to the onFailure callback containing the following fields:
		 * <ol>
		 * <li>invocationContext as passed in to the onFailure method in the connectOptions.       
		 * <li>errorCode a number indicating the nature of the error.
		 * <li>errorMessage text describing the error.      
		 * </ol>
		 * @config {Array} [hosts] If present this contains either a set of hostnames or fully qualified
		 * WebSocket URIs (ws://example.com:1883/mqtt), that are tried in order in place 
		 * of the host and port paramater on the construtor. The hosts are tried one at at time in order until
		 * one of then succeeds.
		 * @config {Array} [ports] If present the set of ports matching the hosts. If hosts contains URIs, this property
		 * is not used.
		 * @throws {InvalidState} if the client is not in disconnected state. The client must have received connectionLost
		 * or disconnected before calling connect for a second or subsequent time.
		 */
		this.connect = function (connectOptions) {
			connectOptions = connectOptions || {} ;
			validate(connectOptions,  {timeout:"number",
									   userName:"string", 
									   password:"string", 
									   willMessage:"object", 
									   keepAliveInterval:"number", 
									   cleanSession:"boolean", 
									   useSSL:"boolean",
									   invocationContext:"object", 
									   onSuccess:"function", 
									   onFailure:"function",
									   hosts:"object",
									   ports:"object",
									   mqttVersion:"number"});
			
			// If no keep alive interval is set, assume 60 seconds.
			if (connectOptions.keepAliveInterval === undefined)
				connectOptions.keepAliveInterval = 60;

			if (connectOptions.mqttVersion > 4 || connectOptions.mqttVersion < 3) {
				throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.mqttVersion, "connectOptions.mqttVersion"]));
			}

			if (connectOptions.mqttVersion === undefined) {
				connectOptions.mqttVersionExplicit = false;
				connectOptions.mqttVersion = 4;
			} else {
				connectOptions.mqttVersionExplicit = true;
			}

			//Check that if password is set, so is username
			if (connectOptions.password === undefined && connectOptions.userName !== undefined)
				throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.password, "connectOptions.password"]))

			if (connectOptions.willMessage) {
				if (!(connectOptions.willMessage instanceof Message))
					throw new Error(format(ERROR.INVALID_TYPE, [connectOptions.willMessage, "connectOptions.willMessage"]));
				// The will message must have a payload that can be represented as a string.
				// Cause the willMessage to throw an exception if this is not the case.
				connectOptions.willMessage.stringPayload;
				
				if (typeof connectOptions.willMessage.destinationName === "undefined")
					throw new Error(format(ERROR.INVALID_TYPE, [typeof connectOptions.willMessage.destinationName, "connectOptions.willMessage.destinationName"]));
			}
			if (typeof connectOptions.cleanSession === "undefined")
				connectOptions.cleanSession = true;
			if (connectOptions.hosts) {
			    
				if (!(connectOptions.hosts instanceof Array) )
					throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.hosts, "connectOptions.hosts"]));
				if (connectOptions.hosts.length <1 )
					throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.hosts, "connectOptions.hosts"]));
				
				var usingURIs = false;
				for (var i = 0; i<connectOptions.hosts.length; i++) {
					if (typeof connectOptions.hosts[i] !== "string")
						throw new Error(format(ERROR.INVALID_TYPE, [typeof connectOptions.hosts[i], "connectOptions.hosts["+i+"]"]));
					if (/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/.test(connectOptions.hosts[i])) {
						if (i == 0) {
							usingURIs = true;
						} else if (!usingURIs) {
							throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.hosts[i], "connectOptions.hosts["+i+"]"]));
						}
					} else if (usingURIs) {
						throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.hosts[i], "connectOptions.hosts["+i+"]"]));
					}
				}
				
				if (!usingURIs) {
					if (!connectOptions.ports)
						throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.ports, "connectOptions.ports"]));
					if (!(connectOptions.ports instanceof Array) )
						throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.ports, "connectOptions.ports"]));
					if (connectOptions.hosts.length != connectOptions.ports.length)
						throw new Error(format(ERROR.INVALID_ARGUMENT, [connectOptions.ports, "connectOptions.ports"]));
					
					connectOptions.uris = [];
					
					for (var i = 0; i<connectOptions.hosts.length; i++) {
						if (typeof connectOptions.ports[i] !== "number" || connectOptions.ports[i] < 0)
							throw new Error(format(ERROR.INVALID_TYPE, [typeof connectOptions.ports[i], "connectOptions.ports["+i+"]"]));
						var host = connectOptions.hosts[i];
						var port = connectOptions.ports[i];
						
						var ipv6 = (host.indexOf(":") != -1);
						uri = "ws://"+(ipv6?"["+host+"]":host)+":"+port+path;
						connectOptions.uris.push(uri);
					}
				} else {
					connectOptions.uris = connectOptions.hosts;
				}
			}
			
			client.connect(connectOptions);
		};
	 
		/** 
		 * Subscribe for messages, request receipt of a copy of messages sent to the destinations described by the filter.
		 * 
		 * @name Paho.MQTT.Client#subscribe
		 * @function
		 * @param {string} filter describing the destinations to receive messages from.
		 * <br>
		 * @param {object} subscribeOptions - used to control the subscription
		 *
		 * @param {number} subscribeOptions.qos - the maiximum qos of any publications sent 
		 *                                  as a result of making this subscription.
		 * @param {object} subscribeOptions.invocationContext - passed to the onSuccess callback 
		 *                                  or onFailure callback.
		 * @param {function} subscribeOptions.onSuccess - called when the subscribe acknowledgement
		 *                                  has been received from the server.
		 *                                  A single response object parameter is passed to the onSuccess callback containing the following fields:
		 *                                  <ol>
		 *                                  <li>invocationContext if set in the subscribeOptions.       
		 *                                  </ol>
		 * @param {function} subscribeOptions.onFailure - called when the subscribe request has failed or timed out.
		 *                                  A single response object parameter is passed to the onFailure callback containing the following fields:
		 *                                  <ol>
		 *                                  <li>invocationContext - if set in the subscribeOptions.       
		 *                                  <li>errorCode - a number indicating the nature of the error.
		 *                                  <li>errorMessage - text describing the error.      
		 *                                  </ol>
		 * @param {number} subscribeOptions.timeout - which, if present, determines the number of
		 *                                  seconds after which the onFailure calback is called.
		 *                                  The presence of a timeout does not prevent the onSuccess
		 *                                  callback from being called when the subscribe completes.         
		 * @throws {InvalidState} if the client is not in connected state.
		 */
		this.subscribe = function (filter, subscribeOptions) {
			if (typeof filter !== "string")
				throw new Error("Invalid argument:"+filter);
			subscribeOptions = subscribeOptions || {} ;
			validate(subscribeOptions,  {qos:"number", 
										 invocationContext:"object", 
										 onSuccess:"function", 
										 onFailure:"function",
										 timeout:"number"
										});
			if (subscribeOptions.timeout && !subscribeOptions.onFailure)
				throw new Error("subscribeOptions.timeout specified with no onFailure callback.");
			if (typeof subscribeOptions.qos !== "undefined" 
				&& !(subscribeOptions.qos === 0 || subscribeOptions.qos === 1 || subscribeOptions.qos === 2 ))
				throw new Error(format(ERROR.INVALID_ARGUMENT, [subscribeOptions.qos, "subscribeOptions.qos"]));
			client.subscribe(filter, subscribeOptions);
		};

		/**
		 * Unsubscribe for messages, stop receiving messages sent to destinations described by the filter.
		 * 
		 * @name Paho.MQTT.Client#unsubscribe
		 * @function
		 * @param {string} filter - describing the destinations to receive messages from.
		 * @param {object} unsubscribeOptions - used to control the subscription
		 * @param {object} unsubscribeOptions.invocationContext - passed to the onSuccess callback 
		                                      or onFailure callback.
		 * @param {function} unsubscribeOptions.onSuccess - called when the unsubscribe acknowledgement has been received from the server.
		 *                                    A single response object parameter is passed to the 
		 *                                    onSuccess callback containing the following fields:
		 *                                    <ol>
		 *                                    <li>invocationContext - if set in the unsubscribeOptions.     
		 *                                    </ol>
		 * @param {function} unsubscribeOptions.onFailure called when the unsubscribe request has failed or timed out.
		 *                                    A single response object parameter is passed to the onFailure callback containing the following fields:
		 *                                    <ol>
		 *                                    <li>invocationContext - if set in the unsubscribeOptions.       
		 *                                    <li>errorCode - a number indicating the nature of the error.
		 *                                    <li>errorMessage - text describing the error.      
		 *                                    </ol>
		 * @param {number} unsubscribeOptions.timeout - which, if present, determines the number of seconds
		 *                                    after which the onFailure callback is called. The presence of
		 *                                    a timeout does not prevent the onSuccess callback from being
		 *                                    called when the unsubscribe completes
		 * @throws {InvalidState} if the client is not in connected state.
		 */
		this.unsubscribe = function (filter, unsubscribeOptions) {
			if (typeof filter !== "string")
				throw new Error("Invalid argument:"+filter);
			unsubscribeOptions = unsubscribeOptions || {} ;
			validate(unsubscribeOptions,  {invocationContext:"object", 
										   onSuccess:"function", 
										   onFailure:"function",
										   timeout:"number"
										  });
			if (unsubscribeOptions.timeout && !unsubscribeOptions.onFailure)
				throw new Error("unsubscribeOptions.timeout specified with no onFailure callback.");
			client.unsubscribe(filter, unsubscribeOptions);
		};

		/**
		 * Send a message to the consumers of the destination in the Message.
		 * 
		 * @name Paho.MQTT.Client#send
		 * @function 
		 * @param {string|Paho.MQTT.Message} topic - <b>mandatory</b> The name of the destination to which the message is to be sent. 
		 * 					   - If it is the only parameter, used as Paho.MQTT.Message object.
		 * @param {String|ArrayBuffer} payload - The message data to be sent. 
		 * @param {number} qos The Quality of Service used to deliver the message.
		 * 		<dl>
		 * 			<dt>0 Best effort (default).
		 *     			<dt>1 At least once.
		 *     			<dt>2 Exactly once.     
		 * 		</dl>
		 * @param {Boolean} retained If true, the message is to be retained by the server and delivered 
		 *                     to both current and future subscriptions.
		 *                     If false the server only delivers the message to current subscribers, this is the default for new Messages. 
		 *                     A received message has the retained boolean set to true if the message was published 
		 *                     with the retained boolean set to true
		 *                     and the subscrption was made after the message has been published. 
		 * @throws {InvalidState} if the client is not connected.
		 */   
		this.send = function (topic,payload,qos,retained) {   
			var message ;  
			
			if(arguments.length == 0){
				throw new Error("Invalid argument."+"length");

			}else if(arguments.length == 1) {

				if (!(topic instanceof Message) && (typeof topic !== "string"))
					throw new Error("Invalid argument:"+ typeof topic);

				message = topic;
				if (typeof message.destinationName === "undefined")
					throw new Error(format(ERROR.INVALID_ARGUMENT,[message.destinationName,"Message.destinationName"]));
				client.send(message); 

			}else {
				//parameter checking in Message object 
				message = new Message(payload);
				message.destinationName = topic;
				if(arguments.length >= 3)
					message.qos = qos;
				if(arguments.length >= 4)
					message.retained = retained;
				client.send(message); 
			}
		};
		
		/** 
		 * Normal disconnect of this Messaging client from its server.
		 * 
		 * @name Paho.MQTT.Client#disconnect
		 * @function
		 * @throws {InvalidState} if the client is already disconnected.     
		 */
		this.disconnect = function () {
			client.disconnect();
		};
		
		/** 
		 * Get the contents of the trace log.
		 * 
		 * @name Paho.MQTT.Client#getTraceLog
		 * @function
		 * @return {Object[]} tracebuffer containing the time ordered trace records.
		 */
		this.getTraceLog = function () {
			return client.getTraceLog();
		}
		
		/** 
		 * Start tracing.
		 * 
		 * @name Paho.MQTT.Client#startTrace
		 * @function
		 */
		this.startTrace = function () {
			client.startTrace();
		};
		
		/** 
		 * Stop tracing.
		 * 
		 * @name Paho.MQTT.Client#stopTrace
		 * @function
		 */
		this.stopTrace = function () {
			client.stopTrace();
		};

		this.isConnected = function() {
			return client.connected;
		};
	};

	Client.prototype = {
		get host() { return this._getHost(); },
		set host(newHost) { this._setHost(newHost); },
			
		get port() { return this._getPort(); },
		set port(newPort) { this._setPort(newPort); },

		get path() { return this._getPath(); },
		set path(newPath) { this._setPath(newPath); },
			
		get clientId() { return this._getClientId(); },
		set clientId(newClientId) { this._setClientId(newClientId); },

		get onConnectionLost() { return this._getOnConnectionLost(); },
		set onConnectionLost(newOnConnectionLost) { this._setOnConnectionLost(newOnConnectionLost); },

		get onMessageDelivered() { return this._getOnMessageDelivered(); },
		set onMessageDelivered(newOnMessageDelivered) { this._setOnMessageDelivered(newOnMessageDelivered); },
		
		get onMessageArrived() { return this._getOnMessageArrived(); },
		set onMessageArrived(newOnMessageArrived) { this._setOnMessageArrived(newOnMessageArrived); },

		get trace() { return this._getTrace(); },
		set trace(newTraceFunction) { this._setTrace(newTraceFunction); }	

	};
	
	/** 
	 * An application message, sent or received.
	 * <p>
	 * All attributes may be null, which implies the default values.
	 * 
	 * @name Paho.MQTT.Message
	 * @constructor
	 * @param {String|ArrayBuffer} payload The message data to be sent.
	 * <p>
	 * @property {string} payloadString <i>read only</i> The payload as a string if the payload consists of valid UTF-8 characters.
	 * @property {ArrayBuffer} payloadBytes <i>read only</i> The payload as an ArrayBuffer.
	 * <p>
	 * @property {string} destinationName <b>mandatory</b> The name of the destination to which the message is to be sent
	 *                    (for messages about to be sent) or the name of the destination from which the message has been received.
	 *                    (for messages received by the onMessage function).
	 * <p>
	 * @property {number} qos The Quality of Service used to deliver the message.
	 * <dl>
	 *     <dt>0 Best effort (default).
	 *     <dt>1 At least once.
	 *     <dt>2 Exactly once.     
	 * </dl>
	 * <p>
	 * @property {Boolean} retained If true, the message is to be retained by the server and delivered 
	 *                     to both current and future subscriptions.
	 *                     If false the server only delivers the message to current subscribers, this is the default for new Messages. 
	 *                     A received message has the retained boolean set to true if the message was published 
	 *                     with the retained boolean set to true
	 *                     and the subscrption was made after the message has been published. 
	 * <p>
	 * @property {Boolean} duplicate <i>read only</i> If true, this message might be a duplicate of one which has already been received. 
	 *                     This is only set on messages received from the server.
	 *                     
	 */
	var Message = function (newPayload) {  
		var payload;
		if (   typeof newPayload === "string" 
			|| newPayload instanceof ArrayBuffer
			|| newPayload instanceof Int8Array
			|| newPayload instanceof Uint8Array
			|| newPayload instanceof Int16Array
			|| newPayload instanceof Uint16Array
			|| newPayload instanceof Int32Array
			|| newPayload instanceof Uint32Array
			|| newPayload instanceof Float32Array
			|| newPayload instanceof Float64Array
		   ) {
			payload = newPayload;
		} else {
			throw (format(ERROR.INVALID_ARGUMENT, [newPayload, "newPayload"]));
		}

		this._getPayloadString = function () {
			if (typeof payload === "string")
				return payload;
			else
				return parseUTF8(payload, 0, payload.length); 
		};

		this._getPayloadBytes = function() {
			if (typeof payload === "string") {
				var buffer = new ArrayBuffer(UTF8Length(payload));
				var byteStream = new Uint8Array(buffer); 
				stringToUTF8(payload, byteStream, 0);

				return byteStream;
			} else {
				return payload;
			};
		};

		var destinationName = undefined;
		this._getDestinationName = function() { return destinationName; };
		this._setDestinationName = function(newDestinationName) { 
			if (typeof newDestinationName === "string")
				destinationName = newDestinationName;
			else 
				throw new Error(format(ERROR.INVALID_ARGUMENT, [newDestinationName, "newDestinationName"]));
		};
				
		var qos = 0;
		this._getQos = function() { return qos; };
		this._setQos = function(newQos) { 
			if (newQos === 0 || newQos === 1 || newQos === 2 )
				qos = newQos;
			else 
				throw new Error("Invalid argument:"+newQos);
		};

		var retained = false;
		this._getRetained = function() { return retained; };
		this._setRetained = function(newRetained) { 
			if (typeof newRetained === "boolean")
				retained = newRetained;
			else 
				throw new Error(format(ERROR.INVALID_ARGUMENT, [newRetained, "newRetained"]));
		};
		
		var duplicate = false;
		this._getDuplicate = function() { return duplicate; };
		this._setDuplicate = function(newDuplicate) { duplicate = newDuplicate; };
	};
	
	Message.prototype = {
		get payloadString() { return this._getPayloadString(); },
		get payloadBytes() { return this._getPayloadBytes(); },
		
		get destinationName() { return this._getDestinationName(); },
		set destinationName(newDestinationName) { this._setDestinationName(newDestinationName); },
		
		get qos() { return this._getQos(); },
		set qos(newQos) { this._setQos(newQos); },

		get retained() { return this._getRetained(); },
		set retained(newRetained) { this._setRetained(newRetained); },

		get duplicate() { return this._getDuplicate(); },
		set duplicate(newDuplicate) { this._setDuplicate(newDuplicate); }
	};
	   
	// Module contents.
	return {
		Client: Client,
		Message: Message
	};
})(window);
module.exports=Paho.MQTT;
},{}],16:[function(require,module,exports){
/**
 * Network APIs abstraction
 */


var AbstractNet = function(main_nutella) {
    this.subscriptions = [];
    this.callbacks = [];
    this.nutella = main_nutella;
};


/**
 * This callback is fired whenever a message is received by the subscribe
 *
 * @callback subscribeCallback
 * @param {string} message - the received message. Messages that are not JSON are discarded
 * @param {string} [channel] - the channel the message was received on (optional, only for wildcard subscriptions)
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 */

/**
 * Subscribes to a channel or to a set of channels
 *
 * @param {string} channel - the channel or filter we are subscribing to. Can contain wildcard(s)
 * @param {subscribeCallback} callback - fired whenever a message is received
 * @param {string|undefined} appId - used to pad channels
 * @param {string|undefined} runId - used to pad channels
 * @param {function} done_callback - fired whenever the subscribe is successful
 */
AbstractNet.prototype.subscribe_to = function(channel, callback, appId, runId, done_callback) {
    // Pad channel
    var padded_channel = this.pad_channel(channel, appId, runId);
    // Maintain unique subscriptions
    if(this.subscriptions.indexOf(padded_channel)>-1)
        throw 'You can`t subscribe twice to the same channel`';
    // Depending on what type of channel we are subscribing to (wildcard or simple)
    // register a different kind of callback
    var mqtt_cb;
    if(this.nutella.mqtt_client.isChannelWildcard(padded_channel))
        mqtt_cb = function(mqtt_message, mqtt_channel) {
            try {
                var f = JSON.parse(mqtt_message);
                if(f.type==='publish')
                    callback(f.payload, this.un_pad_channel(mqtt_channel, appId, runId), f.from);
            } catch(e) {
                if (e instanceof SyntaxError) {
                    // Message is not JSON, drop it
                } else {
                    // Bubble up whatever exception is thrown
                    throw e;
                }
            }
        };
    else
        mqtt_cb = function(mqtt_message) {
            try {
                var f = JSON.parse(mqtt_message);
                if(f.type==='publish')
                    callback(f.payload, f.from);
            } catch(e) {
                if (e instanceof SyntaxError) {
                    // Message is not JSON, drop it
                } else {
                    // Bubble up whatever exception is thrown
                    throw e;
                }
            }
        };
    // Add to subscriptions, save mqtt callback and subscribe
    this.subscriptions.push(padded_channel);
    this.callbacks.push(mqtt_cb);
    this.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.publish_to('subscriptions', {type: 'subscribe', channel:  padded_channel}, appId, runId);
};


/**
 * Unsubscribes from a channel or a set of channels
 *
 * @param {string} channel - we want to unsubscribe from. Can contain wildcard(s)
 * @param {string|undefined} appId - used to pad channels
 * @param {string|undefined} runId - used to pad channels
 * @param {function} done_callback - fired whenever the subscribe is successful
 */
AbstractNet.prototype.unsubscribe_from = function(channel, appId, runId, done_callback ) {
    // Pad channel
    var padded_channel = this.pad_channel(channel, appId, runId);
    var idx = this.subscriptions.indexOf(padded_channel);
    // If we are not subscribed to this channel, return (no error is given)
    if(idx===-1) return;
    // Fetch the mqtt_callback associated with this channel/subscription
    var mqtt_cb = this.callbacks[idx];
    // Remove from subscriptions, callbacks and unsubscribe
    this.subscriptions.splice(idx, 1);
    this.callbacks.splice(idx, 1);
    this.nutella.mqtt_client.unsubscribe(padded_channel, mqtt_cb, done_callback);
};


/**
 * Publishes a message to a channel
 *
 * @param {String} channel - the channel we want to publish the message to. *CANNOT* contain wildcard(s)!
 * @param {Object} message - the message we are publishing. This can be any JS variable, even undefined.
 * @param {String|undefined} appId - used to pad the channels
 * @param {String|undefined} runId - used to pad the channels
 */
AbstractNet.prototype.publish_to = function(channel, message, appId, runId) {
    // Pad channel
    var padded_channel = this.pad_channel(channel, appId, runId);
    // Throw exception if trying to publish something that is not JSON
    try {
        var m = this.prepare_message_for_publish(message);
        this.nutella.mqtt_client.publish(padded_channel, m);
    } catch(e) {
        console.error('Error: you are trying to publish something that is not JSON');
        console.error(e.message);
    }
};


/**
 * This callback is fired whenever a response to a request is received
 *
 * @callback requestCallback
 * @param {string} response - the body of the response
 */

/**
 * Performs an asynchronous request
 *
 * @param {string} channel - the channel we want to make the request to. *CANNOT* contain wildcard(s)!
 * @param {string} message - the body of the request. This can be any JS variable, even undefined.
 * @param {requestCallback} callback - the callback that is fired whenever a response is received
 * @param {string|undefined} appId - used to pad channels
 * @param {string|undefined} runId - used to pad channels
 */
AbstractNet.prototype.request_to = function( channel, message, callback, appId, runId ) {
    // Save nutella reference
    var nut = this.nutella;
    // Pad channel
    var padded_channel = this.pad_channel(channel, appId, runId);
    // Prepare message
    var m = this.prepare_message_for_request(message);
    //Prepare callback
    var mqtt_cb = function(mqtt_message) {
        var f = JSON.parse(mqtt_message);
        if (f.id===m.id && f.type==='response') {
            callback(f.payload);
            nut.mqtt_client.unsubscribe(padded_channel, mqtt_cb);
        }
    };
    // Subscribe
    this.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, function() {
        // Publish message
        nut.mqtt_client.publish( padded_channel, m.message );
    });

};


/**
 * This callback is fired whenever a request is received that needs to be handled
 *
 * @callback handleCallback
 * @param {string} request - the body of the received request (payload). Messages that are not JSON are discarded.
 * @param {Object} from - the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
 * @return {Object} The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
 */

/**
 * Handles requests on a certain channel or a certain set of channels
 *
 * @param {string} channel - the channel we want to listen for requests on. Can contain wildcard(s).
 * @param {handleCallback} callback - fired whenever a message is received
 * @param {string|undefined} appId - used to pad channels
 * @param {string|undefined} runId - used to pad channels
 * @param {function} done_callback - fired whenever we are ready to handle requests
 */
AbstractNet.prototype.handle_requests_on = function( channel, callback, appId, runId, done_callback) {
    // Save nutella reference
    var nut = this.nutella;
    var abstract_net = this;
    // Pad channel
    var padded_channel = this.pad_channel(channel, appId, runId);
    var mqtt_cb = function(request) {
        try {
            // Extract nutella fields
            var f = JSON.parse(request);
            // Only handle requests that have proper id set
            if(f.type!=='request' || f.id===undefined) return;
            // Execute callback and send response
            var m = abstract_net.prepare_message_for_response(callback(f.payload, f.from), f.id);
            nut.mqtt_client.publish( padded_channel, m );
        } catch(e) {
            if (e instanceof SyntaxError) {
                // Message is not JSON, drop it
            } else {
                // Bubble up whatever exception is thrown
                throw e;
            }
        }
    };
    // Subscribe to the channel
    this.nutella.mqtt_client.subscribe(padded_channel, mqtt_cb, done_callback);
    // Notify subscription
    this.publish_to('subscriptions', {type: 'handle_requests', channel:  padded_channel}, appId, runId);
};



/**
 * Pads the channel with app_id and run_id
 *
 * @param channel
 * @param app_id
 * @param run_id
 * @return {string} the padded channel
 */
AbstractNet.prototype.pad_channel = function(channel, app_id, run_id) {
    if (run_id!==undefined && app_id===undefined)
        throw 'If the run_id is specified, app_id needs to also be specified';
    if (app_id===undefined && run_id===undefined)
        return '/nutella/' + channel;
    if (app_id!==undefined && run_id===undefined)
        return '/nutella/apps/' + app_id + '/' + channel;
    return '/nutella/apps/' + app_id + '/runs/' + run_id + '/' + channel;
};


/**
 * Un-pads the channel with app_id and run_id
 *
 * @param channel
 * @param app_id
 * @param run_id
 * @return {string} the un-padded channel
 */
AbstractNet.prototype.un_pad_channel = function(channel, app_id, run_id) {
    if (run_id!==undefined && app_id===undefined)
        throw 'If the run_id is specified, app_id needs to also be specified';
    if (app_id===undefined && run_id===undefined)
        return channel.replace('/nutella/', '');
    if (app_id!==undefined && run_id===undefined)
        return channel.replace("/nutella/apps/" + app_id + "/", '');
    return channel.replace("/nutella/apps/" + app_id + "/runs/" + run_id + "/", '');
};


/**
 * Assembles the unique ID of the component, starting from app_id, run_id, component_id and resource_id
 *
 * @return {Object} an object containing the unique ID of the component sending the message
 */
AbstractNet.prototype.assemble_from = function() {
    var from = {};
    // Set type, run_id and app_id whenever appropriate
    if(this.nutella.runId===undefined) {
        if(this.nutella.appId===undefined) {
            from.type = 'framework';
        } else {
            from.type = 'app';
            from.app_id = this.nutella.appId;
        }
    } else {
        from.type = 'run';
        from.app_id = this.nutella.appId;
        from.run_id = this.nutella.runId;
    }
    // Set the component_id
    from.component_id = this.nutella.componentId;
    // Set resource_id, if defined
    if (this.nutella.resourceId!==undefined)
        from.resource_id = this.nutella.resourceId;
    return from;
};


/**
 * Prepares a message for a publish
 *
 * @param {Object} message - the message content
 * @return {string} the serialized message, ready to be shipped over the net
 */
AbstractNet.prototype.prepare_message_for_publish = function (message) {
    if(message===undefined)
        return JSON.stringify({type: 'publish', from: this.assemble_from()});
    return JSON.stringify({type: 'publish', from: this.assemble_from(), payload: message});
};


/**
 * Prepares a message for a request
 *
 * @param {Object} message - the message content
 * @return {Object} the serialized response, ready to be shipped over the net and the id of the response
 */
AbstractNet.prototype.prepare_message_for_request = function (message) {
    var id = Math.floor((Math.random() * 100000) + 1).toString();
    var m = {};
    m.id = id;
    if(message===undefined)
        m.message = JSON.stringify({id: id, type: 'request', from: this.assemble_from()});
    else
        m.message = JSON.stringify({id: id, type: 'request', from: this.assemble_from(), payload: message});
    return m;
};


/**
 * Prepares a message for a response
 *
 * @param {Object} response - the response content
 * @param {string} id - the original request id
 * @return {string} the serialized message, ready to be shipped over the net
 */
AbstractNet.prototype.prepare_message_for_response = function (response, id) {
    if(response===undefined)
        return JSON.stringify({id: id, type: 'response', from: this.assemble_from()});
    return JSON.stringify({id: id, type: 'response', from: this.assemble_from(), payload: response});
};



// Export module
module.exports = AbstractNet;
},{}],17:[function(require,module,exports){
module.exports.version = '0.6.1';
},{}]},{},[1])(1)
});
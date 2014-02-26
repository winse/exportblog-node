var _ = require('underscore');
var fs = require("fs");

var site = {};

/**
 * Plug in the API
 */
fs.readdirSync(__dirname).forEach(
    function (name) {
        var s = name.match("^config\.(.*?)\.js$");
        if (s) {
            site[s[1]] = require('./' + name);
        }
    }
);

module.exports = site;
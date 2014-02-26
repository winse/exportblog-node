var $ = require("cheerio");


var _default = (function () {

    var self = {},
        options = {
            "gds": false,
            "url": '',
            "folder": "./_posts",
            "charset": "GBK"
        };

    for (var key in options) {
        if (!/^_/.test(key)) // _开头的内部使用
            self[key] = options[key];
    }

    self.list = function (data) {
    }

    self.next = function ($html) {
    }

    self.raw = function ($html) {
    }

    return self;

})();

module.exports = _default;
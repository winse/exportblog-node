var util = require("util");
var http = require("http");
var fs = require("fs");
var url = require('url');

var $ = require("cheerio");
var _ = require("underscore");

var markdown = require("./md.js");
var req = require("./request.js");

var defaultOptions = {
    "debug": false,
    "folder": "."
}

var page = exports.page = function (link, opt) {

    var options = _.extend(defaultOptions, opt);

    req.request(
        link,
        function (bh) {
            var $main = $(bh).find("#main");

            if (options.debug) {
                console.log("处于debug模式！！");
                fs.writeFile("test.html", $main.html());
                return;
            }

            var res = markdown.makeMd($main, link);

            var path = url.parse(link),
                hostname = path.hostname,
                pathname = path.path;

            var filename = res.date + "-" + hostname.replace(/\./g, "-") + pathname.replace(/[/?=\\]/g, "-") + ".md"
            fs.writeFile(options.folder + "/" + filename, res.blog);

            console.log("完成任务, 写到文件： " + filename);
        }
    );

}

function pageDebug() {
    defaultOptions.debug = true;
    page("http://winse.iteye.com/blog/1155829")
}

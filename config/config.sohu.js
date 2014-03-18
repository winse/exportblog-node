var $ = require("cheerio");
var _ = require("underscore");

var dynamicJs = require("./block-javascript-parser")

var sohu = (function () {

    var self = {},
        options = {},
        _ebi
        ;

    self.match = function (url) {
        var ms = url.match(/(http:\/\/)?([^.]*)\.(blog\.sohu\.com)/);
        return ms && ms[2];
    }

    self.initialize = function (username, folder) {
        options = _.extend(
            options,
            {
                "username": username,
                "url": "http://" + username + ".blog.sohu.com/entry/",
                "gds": true,
                "folder": folder || "D:/winsegit/winse.github.com/sohu/_posts",
                "charset": "GBK",
                "gzip": true
            });

        for (var key in options) {
            if (!/^_/.test(key)) // _开头的内部使用
                self[key] = options[key];
        }
    }

    var nextFetchListPage = (function () {
        var current_page = 1;

        // FIXME 会一直到max+1页！然后报错！
        return function () {
            var pageURL = "http://" + options.username + ".blog.sohu.com/action/v_frag-ebi_" + _ebi + "-pg_" + current_page + "/entry/";
            current_page++;
            return pageURL;
        };
    })();

    self.list = function (html) {
        var $html = $(html);
        var urls = $html.find("div.newBlog-list-title a[href]");
        if (urls.length > 0) {
            return urls.map(function (index, value) {
                return $(value).attr("href");
            });
        }

        return false;
    }

    self.firstListPage = function (html) {
        var js = $(html).find("html script").first().text();
        var blogArguments = dynamicJs(js);

        _ebi = blogArguments["_ebi"];

        return nextFetchListPage();
    }

    self.next = function (html) {
        return nextFetchListPage();
    }

    self.raw = function (html) {

        var $html = $(html);
        var $main = $html.find("#entry");

        var content = $main.find("#main-content div[style]").html();
        var title = $main.find(".newBlog-title h2 span").text();
        var publish = $main.find(".newBlog-top-opration span.date").first().text();
        var categories = $main.find(".newBlog-title .newBlog-title-sort a").map(function (index, value) {
            return $(value).text();
        });

        return {
            "content": content,
            "title": title,
            "publishTime": new Date(publish),
            "categories": categories.toArray()
        }

    }

    return self;

})();

module.exports = sohu;
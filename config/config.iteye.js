var $ = require("cheerio");
var _ = require("underscore");

module.exports = (function () {

    var self = {},
        options = {};

    self.match = function (url) {
        var ms = url.match(/(http:\/\/)?([^.]*)\.(iteye\.com)/);
        return ms && ms[2];
    }

    self.initialize = function (username, folder) {
        var url = "http://" + username + ".iteye.com";
        options = _.extend(
            options,
            {
                "url": url,
                "firstListPageURL": url,
                "gds": true,
                "folder": folder || "D:/winsegit/winse.github.com/ext/iteye/_posts"
            });

        for (var key in options) {
            if (!/^_/.test(key)) // _开头的内部使用
                self[key] = options[key];
        }
    }

    self.list = function (html) {
        var $html = $(html);
        var urls = $html.find("#main .blog_main .blog_title h3 a[href]");
        if (urls.length > 0) {
            return urls.map(function (index, value) {
                return self.url + $(value).attr("href");
            });
        }

        return false;
    }

    self.next = function (html) {
        var $html = $(html);
        var $nextPage = $html.find("#main .pagination a.next_page");
        if ($nextPage.length > 0) {
            return self.url + $nextPage.attr("href");
        }

        return false;
    }

    self.raw = function (html) {
        var $html = $(html);
        var $main = $html.find("#main");

        var content = $main.find("#blog_content").html();
        var title = $main.find(".blog_title h3 a").text();
        var publish = $main.find(".blog_bottom > ul > li").first().text();
        var categories = $main.find(".blog_title .blog_categories li").map(function (index, value) {
            return $(value).text();
        });

        return {
            "content": content,
            "title": title,
            "publishTime": (function () { // FIXME 不是日期格式，转换会出错。如**1 小时前**
                var d = new Date(publish);
                return isNaN(d.getTime()) ? new Date() : d;
            })(),
            "categories": categories.toArray()
        }
    }

    return self;

})();

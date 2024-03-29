var $ = require("cheerio");
var _ = require("underscore");

module.exports = (function () {

    var self = {},
        options = {};

    self.match = function (url) {
        var ms = url.match(/(http:\/\/)?([^.]*)\.(logdown\.com)/);
        return ms && ms[2];
    }

    self.initialize = function (username, folder) {
        var url = "http://" + username + ".logdown.com";
        options = _.extend(
            options,
            {
                "url": url,
                "firstListPageURL": url + "/archives",
                "gds": false,
                "folder": folder || "D:/winsegit/winse.github.com/ext/logdown/_posts"
            });

        for (var key in options) {
            if (!/^_/.test(key)) // _开头的内部使用
                self[key] = options[key];
        }
    }

    // XXX 不同的模板，获取方式不同！！
    self.list = function (html) {
        var $html = $(html);
        var urls = $html.find("div.article ul.archive-list li.archive a[href]");
        if (urls.length > 0) {
            return urls.map(function (index, value) {
                return $(value).attr("href");
            });
        }

        return false;
    }

    // XXX 暂时用的模板就只有一页的！等以后遇到了再改！
    self.next = function (html) {
        return false;
    }

    self.raw = function (html) {
        var $html = $(html);
        var $main = $html.find("div.content");

        var $article = $main.find(".article")/*.clone()*/;
        $article.contents().filter(".article-navigation, .social-share").remove();
        var content = $article.html().trim();

        var title = $main.find(".title h2 a").text().trim();
        var publish = $main.find(".metadata ul li").first().text().trim();
        var categories = $main.find(".tags li a[href]").map(function (index, value) {
            return $(value).text().trim();
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

var $ = require("cheerio");

module.exports = (function () {

    var self = {},
        options = {
            "url": "http://winseliu.logdown.com/",
            "firstListPageURL": "http://winseliu.logdown.com/archives",
            "gds": false,
            "folder": "D:/winsegit/winse.github.com/logdown/_posts"
        };

    for (var key in options) {
        if (!/^_/.test(key)) // _开头的内部使用
            self[key] = options[key];
    }

    // 不同的模板，获取方式不同！！
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

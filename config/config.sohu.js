var $ = require("cheerio");


var sohu = (function () {

    var m = 1;
    var entryPage = function () {
        return "http://winsefirst.blog.sohu.com/action/v_frag-ebi_1c77ca4892-pg_" + m + "/entry/";
    }

    var self = {},
        options = {
            "gds": false,
            "url": entryPage(),
            "folder": "D:/winsegit/winse.github.com/sohu/_posts",
            "charset": "GBK",
            "gzip": true
        };

    for (var key in options) {
        if (!/^_/.test(key)) // _开头的内部使用
            self[key] = options[key];
    }

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

    self.next = function ($html) {
        m++;
        return entryPage();
    }

    self.raw = function ($html) {

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
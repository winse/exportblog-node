var $ = require("cheerio");

module.exports = (function () {

    var username = "winse";
    var self = {},
        options = {
            "url": "http://" + username + ".iteye.com",
            "firstListPageURL": "http://" + username + ".iteye.com",
            "gds": true, // 文件名根据标题翻译成英文形式， 或者直接使用url链接作为文件名。 高大上的简写 ^_^
            "folder": "D:/winsegit/winse.github.com/iteye/_posts"
        };

    for (var key in options) {
        if (!/^_/.test(key)) // _开头的内部使用
            self[key] = options[key];
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
            "publishTime": new Date(publish),
            "categories": categories.toArray()
        }
    }

    return self;

})();

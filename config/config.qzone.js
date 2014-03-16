var $ = require("cheerio")
var dynamicJs = require("./block-javascript-parser")

module.exports = (function () {

    var qq = "10226799";
    var nextFetchListPage = (function () {
        var pos = 0;
        var defaultNum = 50;

        return function (n) {
            var num = n || defaultNum;

            var pageURL = "http://b1.qzone.qq.com/cgi-bin/blognew/get_abs?hostUin=" + qq + "&blogType=0&cateName=&cateHex=&statYear=&reqInfo=1&pos=" + pos + "&num=" + num + "&sortType=0&absType=0&source=0";
            pos += num;
            return pageURL;
        };
    })();

    var self = {},
        options = {
            "url": "http://user.qzone.qq.com/" + qq + "/",
            "firstListPageURL": nextFetchListPage(),
            "gds": true,
            "folder": "D:/winsegit/winse.github.com/qzone" + qq + "/_posts",
            "charset": "GBK"
        };

    for (var key in options) {
        if (!/^_/.test(key)) // _开头的内部使用
            self[key] = options[key];
    }

    self.list = function (json) {
        var sandbox = dynamicJs("var blogs; function _Callback(json){blogs = json}; " + json);
        var blogs = sandbox.blogs;
        var list = blogs.data.list;
        if (list && list.length > 0) {
            return $(list).map(function (index, blog) {
                return "http://b1.qzone.qq.com/cgi-bin/blognew/blog_output_data?uin=" + qq + "&blogid=" + blog.blogId + "&mode=2&numperpage=15&dprefix=&ref=qzone&page=1";
            });
        }

        return false;
    }

    self.next = function (html) {
        return nextFetchListPage();
    }

    self.raw = function (html) {
        var $html = $(html);
        var content = $html.find("#blogDetailDiv").html();

        var $info = $html.find("#app_mod script").filter(function (index, data) {
            return $(data).html().indexOf("var g_oBlogData =  ") > 0
        });
        var blogJson = $info.html();
        var sandbox = dynamicJs(blogJson);

        var title = sandbox.g_oBlogData.data.title;
        var publish = new Date(sandbox.g_oBlogData.data.pubtime * 1000);
        var categories = sandbox.g_oBlogData.data.category;

        return {
            "content": content,
            "title": title,
            "publishTime": publish,
            "categories": categories
        }
    }

    return self;

})();
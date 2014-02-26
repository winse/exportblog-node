var $ = require("cheerio");

var vm = require("vm");
function dynamicJs(js) {
    var sandbox = {};
    vm.runInNewContext(js, sandbox);
    return sandbox;
}

module.exports = (function () {

    var pos = 0;

    function lists(num) {
        var listUrl = "http://b1.qzone.qq.com/cgi-bin/blognew/get_abs?hostUin=251788991&blogType=0&cateName=&cateHex=&statYear=&reqInfo=1&pos=" + pos + "&num=" + num + "&sortType=0&absType=0&source=0";
        pos += num;
        return listUrl;
    }

    var self = {},
        options = {
            "gds": true,
            "url": lists(50),
            "folder": "D:/winsegit/winse.github.com/qzone/_posts",
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
                return "http://b1.qzone.qq.com/cgi-bin/blognew/blog_output_data?uin=251788991&blogid=" + blog.blogId + "&mode=2&numperpage=15&dprefix=&ref=qzone&page=1";
            });
        }

        return false;
    }

    self.next = function ($html) {
        return lists(50);
    }

    self.raw = function ($html) {
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
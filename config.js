var url = require("url");
var $ = require("cheerio");

var req = require("./request");

// https://github.com/shinemoon/shinemoon.github.io/blob/master/_posts/filename_change.py
var filename_en = function (detail, link, callback) {
    console.log("获取标题翻译");

    var q = encodeURIComponent(detail.title.replace(/[[\]【】]/g, ''));
    req.direct(
        "http://translate.google.cn/translate_a/t?client=t&sl=zh-CN&tl=en&hl=en&sc=2&ie=UTF-8&oe=UTF-8&oc=1&otf=2&srcrom=1&ssel=4&tsel=6&q=" + q
        ,
        function (buff) {
            var transfer = buff.toString();
            // 非贪婪匹配
            var enMsg = transfer.match(/^[[]{1,}[[](.*?)[\]]/)[1];
            var enName = JSON.parse("[" + enMsg + "]")[0];
            enName = enName.replace(/["'“”‘’\\,，?？。.()&:：~！!^]/g, '')
                .replace("_", "-").replace(/\s+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
                .toLowerCase();
            // 多个连续 - 替换为一个
            enName = enName.replace(/-+/g, "-");

            var filename = detail.date + "-" + enName + ".md"
            callback && callback(filename);
        }
    );
}

var filename = function (detail, link, callback) {
    var path = url.parse(link),
        hostname = path.hostname,
        pathname = path.path;

    var filename = detail.date + "-" + hostname.replace(/\./g, "-") + pathname.replace(/[/?=\\&]/g, "-") + ".md"
    callback(filename);
}

var elements =
    {
        "iteye": (function () {

            var self = {},
                options = {
                    // TODO
                    "_filename_en": false,
                    "url": "http://winse.iteye.com", //列表的第一页 http://{0}.iteye.com/
                    "gen": "D:/winsegit/winse.github.com/iteye/_posts"
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

            self.export = options._filename_en ? filename_en : filename;

            self.detail = function ($html) {
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

        })(),

        "sina": {
            "site": "http://blog.sina.com.cn/{0}"
        },

        "sohu": {
            "site": "http://{0}.blog.sohu.com/entry/"
        },

        "qzone": (function () {

            var pos = 0;

            function lists(num) {
                var listUrl = "http://b1.qzone.qq.com/cgi-bin/blognew/get_abs?hostUin=251788991&blogType=0&cateName=&cateHex=&statYear=&reqInfo=1&pos=" + pos + "&num=" + num + "&sortType=0&absType=0&source=0";
                pos += num;
                return listUrl;
            }

            var self = {},
                options = {
                    "_filename_en": true,
                    "url": lists(50),
                    "gen": "D:/winsegit/winse.github.com/qzone/_posts",
                    "charset": "GBK"
                };

            for (var key in options) {
                if (!/^_/.test(key)) // _开头的内部使用
                    self[key] = options[key];
            }

            var vm = require("vm");

            function dynamicJs(js) {
                var sandbox = {};
                vm.runInNewContext(js, sandbox);
                return sandbox;
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

            self.export = options._filename_en ? filename_en : filename;

            self.detail = function ($html) {
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

        })(),

        "163": {
            "site": "http://{0}.blog.163.com/blog/"
        },

        "oschina": {
            "site": "http://my.oschina.net/{0}"
        },

        "51CTO": {
            "site": "http://{0}.blog.51cto.com/",
            "charset": "gb2312"
        }
    }
    ;

module.exports = elements;
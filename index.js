var fs = require("fs");

var $ = require("cheerio");
var _ = require("underscore");

var req = require("./request.js");
var onePage = require("./page.js");

var genFolder = "D:/winsegit/winse.github.com/iteye/_posts";
var gotList = function (blog) {

    var pageList = function (url) {
        req.request(
            url,
            function (content) {
                console.log("blogs page @ : " + url);

                var $content = $(content);
                var urls = $content.find("#main .blog_main .blog_title h3 a[href]")

                if (urls.length <= 0) {
                    console.log("查询不到对应文章，获取内容为： ");
                    console.log(content);
                    return;
                }

                urls.each(function (index, value) {
                    onePage.page(blog + $(value).attr("href"), {"folder": genFolder});
                });

                var $nextPage = $content.find("#main .pagination a.next_page");
                if ($nextPage.length > 0) {
                    pageList(blog + $nextPage.attr("href"));
                }
            }
        );
    }

    pageList(blog);
}

fs.mkdir(genFolder);
gotList("http://winse.iteye.com");

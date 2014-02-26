var fs = require("fs");
var path = require("path");

var iconv = require('iconv-lite');

var markdown = require("./md.js");
var req = require("./request.js");

var mkdirs = function (fold, callback) {

    var pf = path.dirname(fold);
    fs.exists(pf, function (exists) {
        var create = function () {
            fs.mkdir(fold, callback);
        }

        if (exists) {
            create();
        } else
            mkdirs(pf, create);
    })

}

function html_encode(str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    return s;
}

function html_decode(str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    return s;
}

var page = exports.page = function (link, opt) {

    var options = opt;
    var folder = options.folder;
    var site = options.site;

    req.request(
        link,
        function (buff, callback) {
            var html = site.charset ? iconv.decode(buff, site.charset) : buff.toString();
            html = html_decode(html);

            var detail = markdown.makeMd(html, link, site);

            site.export(detail, link, function (filename) {
                mkdirs(folder, function () {
                    fs.writeFile(folder + "/" + filename, detail.blog);

                    console.log("完成任务, 写到文件： " + filename);
                    callback && callback();
                });
            });

        }
    );

}


////////////////////////////////
//
// / FIXME 稳定后删除！ debug operates
//
////////////////////////////////

var util = require("util");
var http = require("http");
var url = require('url');

var $ = require("cheerio");

function pageDebug() {

    var q = "中华";
    var cn2En = "http://translate.google.cn/translate_a/t?client=t&sl=zh-CN&tl=en&hl=en&sc=2&ie=UTF-8&oe=UTF-8&oc=1&otf=2&srcrom=1&ssel=4&tsel=6&q=" + q

    var qzone = "http://b1.qzone.qq.com/cgi-bin/blognew/get_abs?hostUin=251788991&blogType=0&cateName=&cateHex=&statYear=&reqInfo=1&pos=0&num=50&sortType=0&absType=0&source=0"
    req.request(
        qzone
        ,
        function (bh) {
            console.log("处于debug模式！！");
            //fs.writeFile("test.html", bh);
            console.log(bh.toString())
        }
    );
}

function qzoneTest() {
    var llink = "http://b1.qzone.qq.com/cgi-bin/blognew/blog_output_data?uin=251788991&blogid=1315976007&mode=2&numperpage=15&dprefix=&inCharset=utf-8&outCharset=utf-8&ref=qzone&page=1";
    req.request(
        llink,
        function (bh) {
            var $html = $(bh.toString());
            console.log(markdown.toMarkdown($html.find("#blogDetailDiv").html()));

            var $info = $html.find("#app_mod script").filter(function (index, data) {
                return $(data).html().indexOf("var g_oBlogData =  ") > 0
            });
            var blogJson = $info.html();

            var vm = require("vm");
            var sandbox = {};
            vm.runInNewContext(blogJson, sandbox);

            debug(sandbox.g_oBlogData)
            debug(sandbox.g_oBlogData.data.blogid)

            var pubDate = new Date(sandbox.g_oBlogData.data.pubtime * 1000);
            debug(pubDate.getFullYear() + "-" + (pubDate.getMonth() + 1) + "-" + pubDate.getDate())

            debug(sandbox.g_oBlogData.data.category)
            debug(sandbox.g_oBlogData.data.title)
        }
    )
}

function debug(info) {
    console.log(util.inspect(info));
}

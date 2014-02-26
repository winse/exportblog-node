var fs = require("fs");
var path = require("path");
var url = require("url");
var zlib = require("zlib");

var iconv = require('iconv-lite');
var $ = require("cheerio");

function mkdirs(fold, callback) {

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
    if (str.length == 0) return "";

    var s = str.replace(/&/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    return s;
}

function html_decode(str) {
    if (str.length == 0) return "";

    var s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    return s;
}

var paper = require("./paper.js");
var RequestPool = require("./RequestPool.js"),
    request = RequestPool.create("ExportBlog");

function translate(title, callback) {
    var q = encodeURIComponent(title.replace(/[[\]【】]/g, ''));

    RequestPool.create().submit
    (
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

            callback && callback(enName);
        }
    );
}

function blog(site) {

    var self = {};

    var fetch = function (link, op) {

        request.submit(
            link,
            function (buff, nextCallback) {
                var process = function (realBuff) {
                    var charset = site.charset;
                    var data = charset ? iconv.decode(realBuff, charset) : realBuff.toString();
                    data = html_decode(data);

                    op && op(data, nextCallback);
                }

                site.gzip ?
                    zlib.gunzip(buff, function (err, realBuff) {
                        err ? process(buff) : process(realBuff) ;
                    })
                    :
                    (function () {
                        process(buff);
                    })();

            }
        );

    }

    // https://github.com/shinemoon/shinemoon.github.io/blob/master/_posts/filename_change.py
    var filename = function (detail, link, callback) {
        site.gds ?
            translate(detail.title, function (enName) {
                var filename = detail.date + "-" + enName + ".md"
                callback && callback(filename);
            })
            :
            (function () {
                var path = url.parse(link),
                    hostname = path.hostname,
                    pathname = path.path;

                var filename = detail.date + "-" + hostname.replace(/\./g, "-") + pathname.replace(/[/?=\\&]/g, "-") + ".md"
                callback && callback(filename);
            })();
    }


    var save = function (folder, filename, data, finishCallback) {
        var persist = function () {
            fs.writeFile(folder + "/" + filename, data);

            console.log("完成任务, 写到文件： " + filename);
            finishCallback && finishCallback();
        }

        // 创建目录，然后写入文件
        mkdirs(folder, persist);
    }

    var page = function (link) {

        fetch(link,
            function (html, nextCallback) {
                var detail = paper.make(site.raw($(html)));
                filename(detail, link, function (name) {
                    var content = detail.blog + "\n\n* * * \n[【原文地址】](" + link + ")\n";
                    save(site.folder, name, content, nextCallback);
                })
            }
        )

    }

    var exportAll = function () {

        var exportOneAll = function (url) {
            fetch(
                url,
                function (html, finishCallback) {
                    console.log("blogs list @ : " + url);

                    var $links = site.list(html);

                    if (!$links) {
                        console.log("查询不到对应文章，或者日志已经全部导出！当前内容为： ");
                        console.log(html);
                        return;
                    }

                    $links.each(function (index, link) {
                        page(link);
                    });

                    var nextPageUrl = site.next(html);
                    if (nextPageUrl) {
                        exportOneAll(nextPageUrl);
                    }
                }
            );
        }

        exportOneAll(site.url);
    }

    self.export = page;
    self.exportAll = exportAll;

    return self;

}

module.exports = blog;
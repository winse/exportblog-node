var fs = require("fs");

var $ = require("cheerio");
var _ = require("underscore");
var iconv = require('iconv-lite');

var req = require("./request.js");
var onePage = require("./page.js");
var configs = require("./config.js");

var exportAll = function (site) {

    var exportOneAll = function (url) {
        req.request(
            url,
            function (buff, callback) {
                var html = site.charset ? iconv.decode(buff, site.charset) : buff.toString();

                console.log("blogs list @ : " + url);

                var $links = site.list(html);

                if (!$links) {
                    console.log("查询不到对应文章，或者日志已经全部导出！当前内容为： ");
                    console.log(html);
                    return;
                }

                $links.each(function (index, value) {
                    onePage.page(value, {"site": site, "folder": site.gen});
                });

                var nextPage = site.next(html);
                if (nextPage) {
                    exportOneAll(nextPage);
                }
            }
        );
    }

    exportOneAll(site.url);
}


exportAll(configs.qzone);

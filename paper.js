var util = require("util");
var fs = require("fs");

var $ = Cheerio = require("cheerio");
var _ = require('underscore');

// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
var whitespace = "[\\x20\\t\\r\\n\\f]",
// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g");

var core_trim = "".trim;
// Use native String.trim function wherever possible
Cheerio.trim = core_trim && !core_trim.call("\uFEFF\xA0") ?
    function (text) {
        return text == null ?
            "" :
            core_trim.call(text);
    } :
    // Otherwise use our own trimming functionality
    function (text) {
        return text == null ?
            "" :
            ( text + "" ).replace(rtrim, "");
    };

Cheerio.isArray = util.isArray;

Cheerio.prototype.index = function (item) {
    return _.indexOf(this, item);
}

Cheerio.prototype.unwrap = function () {
    return $(this).parent().filter(":not(body)").each(function () {
        $(this).replaceWith(this.contents());
    }).end();
};

function date(pubDate) {
    return dateformat(pubDate, "%Y-%m-%d");
}

function time(pubDate) {
    return dateformat(pubDate, "%Y-%m-%d %H:%M");
}

function dateformat(date, style) {

    return style.replace(/%[YmdHMs]{1}/g, function (m) {

        var t;
        switch (m) {
            case '%Y' :
                return date.getFullYear();
            case '%m' :
                t = date.getMonth() + 1;
                break;
            case '%d' :
                t = date.getDate();
                break;
            case '%H' :
                t = date.getHours();
                break;
            case '%M' :
                t = date.getMinutes();
                break;
            case '%s' :
                t = date.getSeconds();
                break;
            default:
                throw "不可能到达的代码位置";
        }
        return ("0" + t).slice(-2);

    });
}

var Markdown = require('./to-markdown/src/to-markdown');
var converter = new Markdown.converter({
    "jquery": $,
    "elements": [ // for iteye
        {
            selector: 'div.quote_div',
            replacement: function (innerHtml, el) {
                return ">" + innerHtml + "\n";
            }
        },
        {
            selector: 'figure, figcaption',
            replacement: function(innerHtml, el){
                return innerHtml;
            }
        },
        {
            selector: 'wbr',
            replacement: function(innerHtml, el){
                return innerHtml;
            }
        },
        {
            selector: 'font',
            replacement: function(innerHtml, el){
                return innerHtml;
            }
        }

    ]
});

///////////////////////////
//
// / 生成Markdown内容
//
//////////////////////////

function toMarkdown(data) {
    return converter.makeMd(data);
}

function makeMd(detail) {

    var body = toMarkdown(detail.content);
    var title = detail.title.replace(/"/g, "''");
    var publishTime = detail.publishTime;
    var categories = detail.categories;

    var header = [
        "---" ,
        "layout: post",
        "title: \"" + title + "\"",
        "time: " + time(publishTime) + "",
        "comments: true",
        "tags: " + JSON.stringify(categories) + "",
        "---",
        "",
        ""
    ];

    return {
        "date": date(publishTime),
        "title": title,
        "blog": header.join("\n") + body
    }
}

exports.make = makeMd;
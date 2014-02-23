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

Cheerio.isArray = function(arr){
    return arr && typeof arr === "array";
}

Cheerio.prototype.index = function (item) {
    return _.indexOf(this, item);
}

Cheerio.prototype.unwrap = function () {
    return $(this).parent().filter(":not(body)").each(function () {
        $(this).replaceWith(this.contents());
    }).end();
};

var Markdown = require('./to-markdown/src/to-markdown'),
    converter = new Markdown.converter({
        "jquery": $,
        "elements": [ // for iteye
            {
                selector: 'div.quote_div',
                replacement: function (innerHtml, el) {
                    return ">" + innerHtml + "\n";
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

var makeMd = exports.makeMd = function ($main, link) {

    var content = $main.find("#blog_content").html();
    var body = toMarkdown(content);

    //title
    var title = $main.find(".blog_title h3 a").text();

    var publishTime = $main.find(".blog_bottom > ul > li").first().text();

    var categories = $main.find(".blog_title .blog_categories li").map(function (index, value) {
        return $(value).text()
    }).toArray();

    var header = [
        "---" ,
        "layout: post",
        "title: \"" + title.replace(/"/g, "''") + "\"",
        "date: " + publishTime + "",
        "comments: true",
        "categories: " + JSON.stringify(categories) + "",
        "---",
        "",
        "[【原文地址】](" + link + ")",
        "" // 与body间增加一空行
    ];

    return {
        "date": publishTime.split(" ")[0],
        "blog": header.join("\n") + body
    }
}

function toMarkdownDebug() {
    fs.readFile("test.html", function (error, data) {
        var content = data.toString();
        console.log(toMarkdown(content));
    })
}
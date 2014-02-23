var http = require("http");

var BufferHelper = require('bufferhelper');

var _request = function (link, callback) {
    http.get(
        link,
        function (resp) {
            var bh = new BufferHelper();
            resp.on('data', function (chunk) {
                bh.concat(chunk);
            });

            resp.on(
                "end",
                function () {
                    callback(bh.toBuffer().toString());
                }
            );

        }
    ).on(
        "error",
        function (e) {
            console.log("获取" + link + "文章报错了，重新加入队列重试！", e);
            add(link, callback);
        }
    );
}

// 参考jquery.ba-jqmp.js
var quene = [];
var delay = 1500; //1s
var stop = true;
var batch = 1;

function size() {
    return quene.length;
}

var start = function () {

    (function loopy() {

        if (!stop && !size()) {
            stop = true;
            console.log("请求全部完成！");
            return;
        }

        stop = false;

        var tasks = quene.splice(0, batch);
        for (var i in tasks) {
            var task = tasks[i];
            _request(
                task.link,
                function (data) {
                    task.callback && task.callback(data);
                    console.log("\t\t\\- 还剩余任务： " + size());
                }
            );
        }

        if (typeof delay === 'number' && delay >= 0) {
            setTimeout(loopy, delay);
        }

    })();

}

var add = function (link, callback) {
    quene.push({"link": link, "callback": callback});
    stop && start();
}

// http://cnodejs.org/topic/5087a1f565e98a980977ade8
// iteye 不能访问太频繁！否则会重定向， 报connreset error
exports.request = function (link, callback) {
    add(link, callback);
}
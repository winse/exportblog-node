var http = require("http");
var url = require("url");

var BufferHelper = require('bufferhelper');

function request_pool(name) {

    var self = {},
        quene = [], // 参考jquery.ba-jqmp.js

        batch = 1, // 每次时间间隔点执行的任务数
        delay = 2000, //1.5s

        stop = true;

    function submit(link, op) {
        var task = {"link": link, "op": op};
        quene.push(task);
        stop && start();
    }

    function requestAsync(link, op) {
//        console.log("开始请求： " + link);

        /*var options = url.parse(link);
        options.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.102 Safari/537.36"
        }*/

        http.get(link,
            function (resp) {
                var bh = new BufferHelper();
                resp.on('data', function (chunk) {
                    bh.concat(chunk);
                });

                resp.on(
                    "end",
                    function () {
                        op && op(bh.toBuffer());
                    }
                );

            }).on("error", function (e) {
                console.error("@" + name + " 获取[ " + link + " ]请求报错了，重新加入队列重试！", e);

                submit(link, op);
            });
    }

    function size() {
        return quene.length;
    }

    function start() {

        (function loopy() {

            if (!stop && !size()) {
                stop = true;
                console.log("@" + name + " 请求全部完成！");
                return;
            }

            stop = false;

            var tasks = quene.splice(0, batch);
            for (var i in tasks) {
                var task = tasks[i];

                requestAsync(
                    task.link,
                    function (data) {

                        if (task.op) {
                            var finishCallback = function () {
                                console.log("\t\t\\- @" + name + " 还剩余任务： " + size());

                            }
                            task.op(data, finishCallback);
                        }

                    }
                );
            }

            if (typeof delay === 'number' && delay >= 0) {
                setTimeout(loopy, delay);
            }

        })();

    }

    self.submit = submit;

    return self;

}

exports.create = function (name) {
    return new request_pool(name ? name : "<_<_<");
}
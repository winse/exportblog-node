var vm = require("vm");

function dynamicJs(js) {
    var sandbox = {};
    vm.runInNewContext(js, sandbox);
    return sandbox;
}

module.exports = dynamicJs;

var Blog = require("./blog.js");
var site = require("./config/site.js");

var blog = new Blog(site.sohu);
blog.exportAll();
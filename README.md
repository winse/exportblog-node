
## 功能:

把日志导出为Markdown格式的本地文件。

## 支持导出的博客：

 * Iteye √
 * qzone √
 * sohu √
 * logdown(已实现主题its-compiling) √

## 使用

```cmd
D:\winsegit\exportblog-node>bin\exportblog.cmd -h

  Usage: exportblog [options] [folder]

```

## 注意点：

sohu的列表页使用了GZIP，但是获取日志的页面又不用！

## TODO

V0.1
 * pre带title的处理 ×（各家处理都不同，Delayed）
 * 添加commander功能，实现导出特定用户的blog

v0.2
 * table解析

v0.2-Ext
 * 弄点好玩的东西，分析词汇
    * 每年/月的文章数
    * 写过多少字
    * 每年/月的高频词是什么

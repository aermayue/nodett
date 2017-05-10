/**
 * Created by WindsorChen on 2016/10/9.
 */
var fs = require("fs");
var zlib = require('zlib');

// 解压 input.txt.gz 文件为 input.txt
fs.createReadStream('input.txt.gz')
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream('input1.txt'));

console.log("文件解压完成。");
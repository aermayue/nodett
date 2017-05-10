/**
 * Created by WindsorChen on 2016/10/8.
 *
 * 创建buffer、读buffer、写buffer
 * 来源于：http://blog.fens.me/nodejs-buffer/
 */
//var b = new Buffer(6);
//console.log(b.length);
//b.writeUIntBE(0x1234567890ab, 0, 6);
var colors = require( "colors");
console.log('~~~~~~~~~~~~~~~~~创建buffer类~~~~~~~~~~~~~~~~~~'.red);
var a = new Buffer(0);
console.log(a);
var a2 = new Buffer(0);
console.log(a2);
var a10 = new Buffer(10);
console.log(a10);
//数组
var b = new Buffer(['a','b',12]);
console.log(b);
//字符编码
var b2 = new Buffer('你好','utf-8');
console.log(b2);

//buffer类的辅助操作
// 支持的编码
console.log('~~~~~~~~~~~~~~~~~buffer支持的编码~~~~~~~~~~~~~~~~~~'.red);
console.log(Buffer.isEncoding('utf-8'));
console.log(Buffer.isEncoding('binary'));
console.log(Buffer.isEncoding('ascii'));
console.log(Buffer.isEncoding('ucs2'));
console.log(Buffer.isEncoding('base64'));
console.log(Buffer.isEncoding('hex'));
//不支持的编码
console.log(Buffer.isEncoding('gbk'));
console.log(Buffer.isEncoding('gb2312'));

//2) Buffer检查，很多时候我们需要判断数据的类型，对应后续的操作。
console.log('~~~~~~~~~~~~~~~~~buffer检查~~~~~~~~~~~~~~~~~~'.red);
// 是Buffer类
console.log(Buffer.isBuffer(new Buffer('a')));
// 不是Buffer
console.log(Buffer.isBuffer('adfd'));
console.log(Buffer.isBuffer('\u00bd\u00bd'));

//字符串的字节长度，由于字符串编码不同，所以字符串长度和字节长度有时是不一样的
console.log('~~~~~~~~~~~~~~~~~字符串编码不同，字符串长度和字节长度不一样~~~~~~~~~~~~~~~~~~'.red);
var str2 = '粉丝日志';
console.log(str2 + ": " + str2.length + " characters, " + Buffer.byteLength(str2, 'utf8') + " bytes");
console.log(str2 + ": " + str2.length + " characters, " + Buffer.byteLength(str2, 'ascii') + " bytes");

// Buffer的连接，用于连接Buffer的数组
console.log('~~~~~~~~~~~~~~~~~Buffer.concat~~~~~~~~~~~~~~~~~~'.red);
var b1 = new Buffer("abcd");
var b2 = new Buffer("1234");
var b3 = Buffer.concat([b1,b2],8);
console.log(b3.toString());
console.log(b3.toString('hex'));
var b4 = Buffer.concat([b1,b2],32);
console.log(b4.toString());
console.log(b4.toString('hex'));//16进制输出

// Buffer的比较，用于Buffer的内容排序，按字符串的顺序
console.log('~~~~~~~~~~~~~~~~~Buffer.compare[按字符串的顺序]~~~~~~~~~~~~~~~~~~'.red);
var a1 = new Buffer('10');
var a2 = new Buffer('50');
var a3 = new Buffer('123');
// a1小于a2
console.log(Buffer.compare(a1,a2));
// a2大于a3
console.log(Buffer.compare(a2,a3));
// a1,a2,a3排序输出
console.log([a1,a2,a3].sort(Buffer.compare));
// a1,a2,a3排序输出，以utf-8的编码输出
console.log([a1,a2,a3].sort(Buffer.compare).toString());
/****
 * buffer写入
 */
console.log('~~~~~~~~~~~~~~~~~下面是buffer写入操作[Buffer.write]~~~~~~~~~~~~~~~~~~'.red);
var buf = new Buffer(64);
var len1 = buf.write('从开始写入');
console.log(len1 + " bytes: " + buf.toString('utf8', 0, len1));
len1 = buf.write('重新写入');//这将会覆盖之前的写入内存
console.log('len1:'+len1 + " bytes: " + buf.toString('utf8', 0, len1));
var len2 = buf.write('\u00bd + \u00bc = \u00be',len1);
console.log('len2:'+len2 + " bytes: " + buf.toString('utf8', 0, len1+len2));
var len3 = buf.write('从第30位写入', 30);
console.log('len3:'+len3 + " bytes: " + buf.toString('utf8', 0, 30+len3));
console.log('总长度：'+buf.length + " bytes: " + buf.toString('utf8', 0, buf.length));
// 继续写入Buffer，偏移30+len3
var len4 = buf.write('写入的数据长度超过Buffer的总长度！',30+len3);
// 超过Buffer空间的数据，没有被写入到Buffer中
console.log('len4:'+buf.length + " bytes: " + buf.toString('utf8', 0, buf.length));
console.log('~~~~~~~~~~~~~~~~~上面是buffer写入操作[结束]~~~~~~~~~~~~~~~~~~'.red);
/*
* Node.js的节点的缓冲区，根据读写整数的范围，提供了不同宽度的支持，
* 使从1到8个字节（8位、16位、32位）的整数、浮点数(float)、双精度浮点数(double)可以被访问，
* 分别对应不同的writeXXX()函数，使用方法与buf.write()类似。
* */

//buffer类的写入辅助函数
console.log('~~~~~~~~~~~~~~~~~Buffer.copy~~~~~~~~~~~~~~~~~~'.red);
// buf.copy(targetBuffer[, targetStart][, sourceStart][, sourceEnd])
// 新建两个Buffer实例
var buf1 = new Buffer(26);
var buf2 = new Buffer(26);
// 分别向2个实例中写入数据
for (var i = 0 ; i < 26 ; i++) {
    buf1[i] = i + 97; // 97是ASCII的a
    buf2[i] = 50; // 50是ASCII的2
}
// 把buf1的内存复制给buf2
buf1.copy(buf2, 5, 0, 10); // 从buf2的第5个字节位置开始插入，复制buf1的从0-10字节的数据到buf2中
console.log(buf2.toString('ascii', 0, 25)); // 输入buf2的0-25字节
// 新建Buffer实例，长度20节节  buf.fill(value[, offset][, end])
console.log('~~~~~~~~~~~~~~~~~Buffer.fill~~~~~~~~~~~~~~~~~~'.red);
var buf = new Buffer(20);
// 向Buffer中填充数据 buf.fill
buf.fill("h");
console.log(buf);
console.log("buf:"+buf.toString());
// 清空Buffer中的数据
buf.fill();
console.log("buf:"+buf.toString());
console.log('~~~~~~~~~~~~~~~~~Buffer.slice[新生成的buf2是buf1的一个切片]~~~~~~~~~~~~~~~~~~'.red);
//buffer 裁剪
var buf1 = new Buffer(26);
for (var i = 0 ; i < 26 ; i++) {
    buf1[i] = i + 97;
}
// 从剪切buf1中的0-3的位置的字节，新生成的buf2是buf1的一个切片。
var buf2 = buf1.slice(0, 3);
console.log(buf2.toString('ascii', 0, buf2.length));
// 当修改buf1时，buf2同时也会发生改变
buf1[0] = 33;
console.log(buf2.toString('ascii', 0, buf2.length));

/*
* buffer的读取
* 我们可以通过readXXX()函数获得对应该写入时编码的索引值，再转换原始值取出，
* 有这种方法操作中文字符就会变得麻烦，最常用的读取Buffer的方法，其实就是toString()。
* */
console.log('~~~~~~~~~~~~~~~~~Buffer的读取-toString~~~~~~~~~~~~~~~~~~'.red);
var buf = new Buffer(10);
for (var i = 0 ; i < 10 ; i++) {
    buf[i] = i + 97;
}
console.log(buf.length + " bytes: " + buf.toString('utf-8'));
// 读取数据
for (var ii = 0; ii < buf.length; ii++) {
    var ch = buf.readUInt8(ii); // 获得ASCII索引
    //var ch = buf.readUInt16BE(ii);
    console.log(ch + ":"+ String.fromCharCode(ch));
}
//写入中文数据，以readXXX进行读取，会3个字节来表示一个中文字。
console.log('~~~~~~~~~~~~~~~~~[写入中文数据，以readXXX进行读取，会3个字节来表示一个中文字]~~~~~~~~~~~~~~~~~~'.red);
var buf = new Buffer(10);
buf.write('abcd');
buf.write('数据',4);
for (var i = 0; i < buf.length; i++) {
    console.log(buf.readUInt8(i));
}
console.log("buffer :"+buf);// 默认调用了toString()的函数
console.log("utf-8  :"+buf.toString('utf-8'));
console.log("ascii  :"+buf.toString('ascii'));//有乱码，中文不能被正确解析
console.log("hex    :"+buf.toString('hex')); //16进制
//会直接转换成json对象
console.log('~~~~~~~~~~~~~~~~~[buf.toJSON()|会直接转换成json对象]~~~~~~~~~~~~~~~~~~'.red);
var buf = new Buffer('test');
console.log(buf.toJSON());

//请问如何把一个数字如21.生成一个4个byte的小尾段buffer。如把21 变成Buffer           buf.writeUInt32LE(value, offset[, noAssert])
/*
* Buffer的性能测试
*
* 1、，每二次循环就要重新申请一次内存池的空间
* 2、对于这类的需求来说，提前生成一个大的Buffer实例进行存储，要比每次生成小的Buffer实例高效的多，能提升一个数量级的计算效率。所以，理解并用好Buffer是非常重要的！！
* 3、String对字符串的连接操作，要远快于Buffer的连接操作。所以我们在保存字符串的时候，该用string还是要用string。
* 那么只有在保存非utf-8的字符串以及二进制数据的情况，我们才用Buffer。
*
* */
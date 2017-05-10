/**
 * Created by WindsorChen on 2017/5/4.
 */
//events 模块只提供了一个对象： events.EventEmitter。EventEmitter 的核心就是事件触发与事件监听器功能的封装。

/**
// 引入 events 模块
var events = require('events');
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();

// 创建事件处理程序
var connectHandler = function connected() {
    console.log('连接成功。');

    // 触发 data_received 事件
    eventEmitter.emit('data_received');
}

// 绑定 connection 事件处理程序
eventEmitter.on('connection', connectHandler);

// 使用匿名函数绑定 data_received 事件
eventEmitter.on('data_received', function(){
    console.log('数据接收成功。');
});

// 触发 connection 事件
eventEmitter.emit('connection');

console.log("程序执行完毕。");**/

var EventEmitter  = require('events').EventEmitter;
var event = new EventEmitter();
event.on('some_event',function () {
   console.log('some event 事件触发');
});
setTimeout(function () {
    event.emit('some_event');
},1000);

//EventEmitter 的每个事件由一个事件名和若干个参数组成，事件名是一个字符串，通常表达一定的语义。对于每个事件，EventEmitter 支持 若干个事件监听器。
var EventEmitter = require('events').EventEmitter;
var event1 = new EventEmitter();
var listener1 = function (arg1,arg2) {
    console.log('listening:s_event1',arg1,arg2);
};
var listener2 = function (arg1,arg2) {
    console.log('listening:s_event2',arg1,arg2);
};
event1.on('s_event',listener1);
event1.on('s_event',listener2);
event1.emit('s_event',1,2);
console.log(EventEmitter.listenerCount(event1,'s_event')+' 个监听事件');
event1.removeListener('s_event',listener1);
console.log(EventEmitter.listenerCount(event1,'s_event')+' 个监听事件');
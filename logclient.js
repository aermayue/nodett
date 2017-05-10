/**
 * Created by WindsorChen on 2017/5/8.
 */
var net = require('net');
var tcp_port = 6140;

var client = new net.Socket();
client.connect(tcp_port, '127.0.0.1', function() {
    console.log('Connected');
    //client.write('Hello, server! Love, Client.');
    client.write('1234Cehehe.');
    client.end();
});

client.on('data', function(data) {
    console.log(data.toString());
    client.end();
});
client.on('end', function() {
    console.log('断开与服务器的连接');
});

client.on('close', function() {
    console.log('Connection closed');
});


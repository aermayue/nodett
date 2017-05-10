/**
 * NodeJS logserver proxy
 * 
 * @Author gently
 * @Version 1.2
 * @Date 2013.04.18
 *
 **/

var _VER = "1.2";
var net=require("net"),fs=require("fs"),dgram = require("dgram");
var util=require("util"),d=require("domain").create();
const TCP_PORT = process.argv[2] || 9010;
const UDP_PORT = 1+1*TCP_PORT;
const L_FPREFIX = __dirname+"/data/misslog_";
var worker_incr = 0;//全局自增值，为worker编号
var worker_keys = []; //真正的worker keys map
var workers = {},writer_cache=[],_fp=null,_lastmin=0;

d.run(function(){
	if(!fs.existsSync(__dirname+"/data/")){
		fs.mkdirSync(__dirname+"/data/",0777);
	}
	
	/****UDP 协议支持
	var udp_serv = dgram.createSocket("udp4");
	udp_serv.on("message", function (udp_msg, rinfo){
		if( workers.length > 0 ){
			var rnd = Math.floor( Math.random() * workers.length );
			workers[rnd].write(udp_msg);
		}
	});
	
	udp_serv.on("listening", function(){
		var address = udp_serv.address();
		util.log("logproxy udp start.bind at " + address.address + ":" + address.port);
	});
	udp_serv.on("error",function(err){
		util.log("udp serv error.");
		console.log(err);
	});
	udp_serv.bind(UDP_PORT);*/
	
	var tcp_serv = net.createServer(function(tcp_sock){
		/*tcp_sock.on("connect",function(){
			
		});*/
		tcp_sock.is_worker = 0; //标记是否worker，以便知道是谁断开了连接
		tcp_sock.half_buff = null; //暂存分包时的部分数据
		tcp_sock.on("data",function(dat){
			console.log(dat[4]);//这里面是十进制
			console.log("Receive client:"+dat.toString());
			if(dat.length > 4 && dat[0] == 0x7B && dat[1] == 0x22 && dat[dat.length-1] == 0x7D){
				var obj = {};
				try{
					obj=JSON.parse(dat.toString());
				}catch(e){}
				
				//{"cmd":"addwork","ip":"workerIP","port":端口数值}
				if( obj.cmd == "addwork" ){//增加worker
					var wk_port = parseInt(obj.port,10);
					if( !net.isIPv4(obj.ip) || !isFinite( wk_port ) || wk_port > 65535 || wk_port < 1 ){
						util.log("wrong ip address or port");
						return tcp_sock.destroy();
					}
					worker_sock=net.createConnection(wk_port,obj.ip,function(){//连接到worker's socket
						worker_incr++;
						util.log("add a worker["+worker_incr+"] ok via '"+obj.ip+":"+wk_port+"'.");
						//worker_sock.write('{"wkid":'+worker_incr+'}');
						worker_sock.wkid = worker_incr;
						workers[worker_incr] = worker_sock;
						worker_keys = Object.keys(workers);
						tcp_sock.write('{"wkid":'+worker_incr+'}');
						tcp_sock.is_worker = 1;
						//tcp_sock.destroy();
					});
					worker_sock.on("error",function(err){
						util.log("worker sock err.");
						console.error(err);
					});
					worker_sock.on("close",function(){
						if( this.wkid in workers ){
							delete workers[this.wkid];
							worker_keys = Object.keys(workers);
						}
						util.log("worker "+this.wkid+" closed.");
					});
				}
			}else{
				
				if( Buffer.isBuffer( this.half_buff ) ){
					dat = Buffer.concat([this.half_buff,dat]);
					this.half_buff=null;
				}
				if( dat.length < 6 ){
					this.half_buff = dat;
					return;
				}
				if( dat[4] != 0x43 ){
					util.log("packet format wrong 1.");
					this.half_buff = null;
					return;
				}
				//包格式：包长（4字节,此4Byte计算在内,小端）+ ‘C’（1byte）+ ServerNameLen(1byte) + ServerNameLen
				var _packlen = dat.readUInt32LE(0);
				console.log('_packlen:'+_packlen);
				console.log('dat.length:'+dat.length);
				if( _packlen < 6 ){
					util.log("read pklen low than 6B");
					this.half_buff = null;
					return;
				}
				if( dat.length < _packlen ){
					this.half_buff = dat;
					return;
				}else if( dat.length == _packlen ){//正好的情况，单独处理以期提高效率
					writer_cache.push(dat);
				}else{
					var _stpos = 0;
					while( _stpos < dat.length ){
						var tmp_pack = dat.slice(_stpos,Math.min(_stpos+_packlen,dat.length));
						
						if(tmp_pack.length > 4 && tmp_pack[4] != 0x43 ){
							util.log("packet format wrong 2.");
							console.log(tmp_pack.toString());
							break;
						}
						if( tmp_pack.length < _packlen ){
							this.half_buff = tmp_pack;
							break;
						}
						writer_cache.push(tmp_pack);
						_stpos += _packlen;
						if( _stpos + 4 > dat.length ){
							_packlen = 4;//使用一个不准确的值，触发上面的break
						}else{
							_packlen = dat.readUInt32LE(_stpos);
						}
					}
				}
				console("worker_keys.length:"+worker_keys.length);
				if( worker_keys.length > 0 ){//有worker连接存在
					while(writer_cache.length>0){
						var rnd = worker_keys.length > 1 ? Math.floor(Math.random() * worker_keys.length) : 0;
						workers[worker_keys[rnd]].write(writer_cache.shift());
					}
				}else{
					writer();
				}
			}
		});
		tcp_sock.on("error",function(err){
			util.log("tcp socket err.");
			console.log(err);
		});
		tcp_sock.on("close",function(){
			//util.log("tcp_sock close,conn:"+tcp_serv.getConnections+",wkr:"+tcp_sock.is_worker);
			util.log("tcp_sock close,conn:"+tcp_serv.connections+",wkr:"+tcp_sock.is_worker);
		});
	}).listen(TCP_PORT,function(){util.log("logproxy v"+_VER+" tcp server start.listenning at port "+TCP_PORT)});
	
	process.on("SIGINT",function(){//按ctrl+C
		util.log("process exit...");
		end_clean(0);
	});
	
	process.on("SIGTERM",function(){//kill掉了
		util.log("process killed...");
		end_clean(0);
	});
	process.on("SIGQUIT",function(){//终止进程
		util.log("process quit...");
		end_clean(0);
	});
	
	/*
	process.on("uncaughtException",function(err){
		util.log("uncaughtException "+err);
	});*/
	
	process.on("SIGUSR2",function(){
		console.log(worker_incr);
		console.log(worker_keys);
		console.log(workers);
	});
});

d.on('error', function(er){
	util.log('Caught error!');
  console.error(er);
});

//进程退出时的扫尾工作
function end_clean(code){
	code = code || 0;
	/*for( var k in workers ){
		workers[k].write('{"cmd":"exit"}');
	}*/
	if( writer_cache.length > 0 ){
		console.log( "the writer is busy,try again later." );
		writer();
		return null;
	}
	process.exit(code);
}

function writer(){
	var time= Math.floor((new Date()).getTime()/600000)*600;//10分钟一个文件
	if( !_fp ){
		_lastmin=time;
		_fp=fs.openSync( L_FPREFIX+time, "w" );
	}
	if(writer_cache.length > 0){
		var _dat = writer_cache.shift();
		if( writer_cache.length > 0 ){
			process.nextTick(writer);
		}
		if(Buffer.isBuffer(_dat) && ( _dat.length > 6 ) ){
			var pack_len = _dat.readUInt32LE(0);
			var flag_len = _dat.readUInt8(5);
			var payload = _dat.toString('ascii',6+flag_len,pack_len);
			//var body_start = payload.indexOf("(");//以第一个括号
			//var func=payload.substr(0,body_start);
			//console.log(payload);
			fs.writeSync(_fp,payload+"\n");
		}
	}
	if( _lastmin != time){
		fs.closeSync(_fp);
		_fp=null;
	}
}
var express=require('express')
    , app = express()
    , uuid= require('uuid')
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , clients={},socketid;

app.use(express.static(__dirname+'/public'));

server.listen(8000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
app.get('/mb',function(req,res){
    res.sendfile(__dirname+'/mb.html');
});
function gameStatus(socket,status){
    socket&&socket.emit('status',status);
}
var game=io.of('/game').on('connection',function(socket){
    var newId=uuid.v4();
    socket.set('game',newId,function(){
        clients[newId]={pc:socket,status:1};
        socket.emit('user',{id:newId});
    }).on('over',function(data){
        socket.get('game',function(err,name){
            clients[name].status=3;
            gameStatus(clients[name].mb,{status:3});
        });
    }).on('disconnect', function () {
        socket.get('game',function(err,name){
            delete clients[name];
        });
    });
});
var mb=io.of('/mb').on('connection',function(socket){
    socket.on('setGameBody',function(name){
        socket.set('game',name,function(){
            if(clients[name]&&!clients[name].mb){
                clients[name].mb=socket;
                socket.emit('isReandy',{success:true,status:clients[name].status});
            }else{
                socket.emit('isReandy',{success:false});
            }
        })
    }).on('start',function(data){
        socket.get('game',function(err,name){
            if(clients[name]){
                clients[name].pc&&clients[name].pc.emit('start',{success:true});
                clients[name].status=2;
            }
        })
    }).on('restart',function(data){
        socket.get('game',function(err,name){
            if(clients[name]){
                clients[name].pc&&clients[name].pc.emit('restart',{success:true});
                clients[name].status=1;
            }
        })
    }).on('keycontrol',function(data){
        socket.get('game',function(err,name){
            clients[name] && clients[name].pc&&clients[name].pc.emit('keys',data);
        });
    }).on('disconnect', function () {
        //经测试，安卓端微信打开后的页面断开连接的时间不是真实的断开时间，ios无此问题。
        socket.get('game',function(err,name){
            clients[name] && clients[name].mb &&clients[name].mb.id==socket.id && delete clients[name].mb;
        });
    });
});
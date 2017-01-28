var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server running on port 3000...');

app.get('/',function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    //io.sockets.emit('connectedUser',{userNew:});

    //Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username),1);
        updateUsernames();
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets connected', connections.length);
        io.sockets.emit('disconnectedUser',{userNm:socket.username});
    });

    //Send Message
    socket.on('send message', function(data){
        io.sockets.emit('new message',{msg:data, user:socket.username});
    });

    //New User
    socket.on('new user',function(data, callback){
        if(users.indexOf(data) != -1){
            callback({isValid: false});
        }
        else{
            callback({isValid: true});
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
        }
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});

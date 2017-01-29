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
        var time = DisplayCurrentTime();
        io.sockets.emit('new message',{msg:data, user:socket.username,sentBytime:time});
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
            myUsers();
        }
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }

    function myUsers(){
        io.sockets.emit('my users', {userNew:socket.username});
    }

    function DisplayCurrentTime() {
        var date = new Date();
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        //var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        time = hours + ":" + minutes + " " + am_pm;
        return time;
    };
});

// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'static/index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

//---------------------------------------------------------------------------------------------------------------------//

io.on('connection', function(socket) {

    var roomcode = -1;

    //==============================
    // Local Communication via sockets
    //==============================
    
    socket.on('test-client', function(data) {
        console.log('server got: ' + data);
    });

    socket.on('newRoom', function() {
        let code = Math.floor(Math.random() * 100);
        roomcode = 'room_'+ code;
        // join room
        socket.join(roomcode);
        // send roomcode to client
        socket.emit('player1-joined', roomcode);
    });

    socket.on('joinRoom', function(data) {
        roomcode = data;
        let actualRoom = io.nsps['/'].adapter.rooms[roomcode];
        if (!actualRoom) {
            socket.emit('err', 'Sorry, that room does not exist');
        }
        else if (actualRoom.length != 1) {
            socket.emit('err', 'Sorry, that room is full');
        }
        else {
            socket.join(roomcode);
            socket.emit('player2-joined', {});
        }
    });

    socket.on('game-button', function(data) {
        console.log('recieved game-button');
        // this code isn't working
        socket.broadcast.to(roomcode).emit('game-data', data);
        console.log(roomcode);
    });

    //====================================
    // Recieving Inter-Server Communication
    //====================================

    socket.on('game-data', function(data) {
        console.log('recieved game-data');
        console.log('opponent picked ' + data);
    });

});

setInterval(function() {
    io.sockets.emit('test-server', 'this is from server');
}, 1000);



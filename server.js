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

var p1socketID = -1;
var p2socketID = -2;
var roomcode = -1;
var message = 'hi';
var reciever = ' ';

io.on('connect', onConnect);

function onConnect (socket) {

    //==============================
    // Local Communication via sockets
    //==============================
    
    socket.on('test-client', function(data) {
        console.log('server got: ' + data);
    });

    socket.on('message', function(data){
        //message = data.message;
        reciever = (data.player == p1socketID)? p2socketID : p1socketID;
        socket.to(reciever).emit('test-server', 'the other player sent: ' + data.message);
    });

    socket.on('newRoom', function() {

        // test code
        p1socketID = socket.id;
        console.log('NEWROOM: player 1 ID: ' + p1socketID);
        console.log('NEWROOM: player 2 ID: ' + p2socketID);


        let code = Math.floor(Math.random() * 100);
        roomcode = 'room_'+ code;
        // join room
        socket.join(roomcode);
        // send roomcode to client
        socket.emit('player1-joined', roomcode);
    });

    socket.on('joinRoom', function(data) {

        // test code
        p2socketID = socket.id;
        console.log('JOINROOM: player 2 ID: ' + p2socketID);
        console.log('JOINROOM: player 1 ID: ' + p1socketID);

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
            // this isn't working
            //io.sockets.emit('alert', 'inter-server communication works');
        }
    });

    socket.on('alert', function(data) {
        console.log('other server recieved: ' + data);
    });
    
    socket.on('game-button', function(data) {
        console.log('recieved game-button');
        // this code isn't working
        io.sockets.emit('game-data', data);
        console.log(roomcode);
    });

    //====================================
    // Recieving Inter-Server Communication
    //====================================

    // socket.on('game-data', function(data) {
    //     console.log('recieved game-data');
    //     console.log('opponent picked ' + data);
    // });

}

//====================================
// Sending Inter-Server Communication
//====================================

setInterval(function() {
    //io.sockets.emit('test-server', message);
}, 1000);



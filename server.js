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

// store connected players on server
var p1socketID = -1;
var p2socketID = -2;
var reciever = ' ';

// to make sure too many people don't join same game
var roomcode = -1;

io.on('connect', onConnect);

function onConnect (socket) {

    //==============================
    // Handle Messages From Client
    //==============================
    
    // test that server can recieve data from client
    socket.on('test-client', function(data) {
        console.log('server got: ' + data);
    });

    // test that server can recieve data from 1 client and send it to other client
    socket.on('message', function(data){
        //message = data.message;
        reciever = (data.player == p1socketID)? p2socketID : p1socketID;
        socket.to(reciever).emit('test-server', 'the other player sent: ' + data.message);
    });

    // player1 creates the room
    socket.on('newRoom', function() {

        // store player1 socketID on server for future direct communication
        p1socketID = socket.id;
        
        // generate random room code
        let code = Math.floor(Math.random() * 100);
        roomcode = 'room_'+ code;

        // join room
        socket.join(roomcode);

        // send roomcode to client
        socket.emit('player1-joined', roomcode);
    });


    // player2 joins the room
    socket.on('joinRoom', function(data) {

        // store player2 socketID on server for future direct communication
        p2socketID = socket.id;

        // get roomcode
        roomcode = data;

        // find room using room code
        let actualRoom = io.nsps['/'].adapter.rooms[roomcode];
        if (!actualRoom) {
            socket.emit('err', 'Sorry, that room does not exist');
        }
        else if (actualRoom.length != 1) {
            socket.emit('err', 'Sorry, that room is full');
        }
        else {
            // join room and notify client
            socket.join(roomcode);
            socket.emit('player2-joined', {});
        }
    });

}

// setInterval(function() {
//     //if I ever have to send a continuous loop of messages
//     //io.sockets.emit('test-server', message);
// }, 1000);



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

//==============================
// Server variables
//==============================

// store connected players on server
var p1socketID = -1;
var p2socketID = -2;
//var recieverID = ' ';

// rooms make sure too many people don't join game
var numrooms = 0;
var roomcode = -1;

// store ships
var p1ships = null;
var p2ships = null;

// store guesses
var p1guesses = null;
var p2guesses = null;

//==============================
// Handle Messages From Client
//==============================

io.on('connect', function (socket) {

    // test that server can recieve data from client
    socket.on('server-log', function(data) {
        console.log('server got: ' + data);
    });

    // TOOK OUT 'message'
    // test that server can recieve data from 1 client and send it to other client
    // socket.on('message', function(data){
    //     //message = data.message;
    //     let recieverID = (data.player == p1socketID)? p2socketID : p1socketID;
    //     socket.to(recieverID).emit('client-log', 'the other player sent: ' + data.message);
    // });

    //==============================
    // Creating and Joining Room
    //==============================

    // player1 creates the room
    socket.on('newRoom', function() {

        // store player1 socketID on server for future direct communication
        p1socketID = socket.id;
        
        // generate room code
        roomcode = 'room_'+ ++numrooms;

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
            socket.emit('player2-joined', roomcode);
        }
    });

    //==============================
    // Playing
    //==============================

    socket.on('guesses-ships', function(data) {
    
        console.log('server got guesses and ships');

        if (data.player == p1socketID) {
            p1ships = data.ships;
            p1guesses = data.guesses;
        } 

        else {
            p2ships = data.ships;
            p2guesses = data.guesses;
        }

        // perform check and return answers
        if (p1ships != null && p1guesses != null && p2ships != null && p2guesses != null) {

            let p1answers = returnAnswers(p2ships, p1guesses); // answers to p1's guesses
            let p2answers = returnAnswers(p1ships, p2guesses); // answers to p1's guesses

            // send hits and misses to player1
            io.to(p1socketID).emit('your-answers', {
                hits: p1answers.hits,
                misses: p1answers.misses,
            });
            io.to(p1socketID).emit('opponent-answers', {
                hits: p2answers.hits,
                misses: p2answers.misses,
            });

            console.log('sent messages to player 1');

            // send hits and misses to player 2
            io.to(p2socketID).emit('your-answers', {
                hits: p2answers.hits,
                misses: p2answers.misses,
            });
            io.to(p2socketID).emit('opponent-answers', {
                hits: p1answers.hits,
                misses: p1answers.misses,
            });

            console.log('sent messages to player 2');

            // reset everything
            p1ships = null;
            p2ships = null;
            p1guesses = null;
            p2guesses = null;
        }
    });

});

//==============================
// Server Checks Guesses
//==============================

function returnAnswers(ships, guesses) {
    let hits = [];
    let misses = [];
    for (let i = 0; i < guesses.length; i++) {
        let guess = guesses[i];
        // includes is not working
        if (ships.includes(guess)) {
            hits.push(guess);
        }
        else {
            misses.push(guess);
        }
    }
    return {
        hits: hits,
        misses: misses
    };
}








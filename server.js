/**
 * server.js for Gati_BattleShips_2
 * 
 * Handles:
 * - routing, serving files, 
 * - communication to/from clients (using socket.io), putting clients in rooms
 * - checking guesses sent by clients
 */

// Dependencies
var express = require('express');
var app = express();

var path = require('path');

var http = require('http');
var server = http.Server(app);

var socketIO = require('socket.io');
var io = socketIO(server);

// set port
var port = process.env.PORT || 5000; // lets server run depending on the environment port

// get html file
app.use('/static', express.static(__dirname + '/static'));

// Routing, sending html file to browser
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'static/index.html'));
});

// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port 5000');
});

//---------------------------------------------------------------------------------------------------------------------//

//==============================
// Server variables
//==============================

// rooms make sure too many people don't join game
var numrooms = 0;

// to access their specific game variables, p1 is index 0 and p2 is index 1
var p1 = 0;
var p2 = 1;

// store connected players on server
var pSocketIDs = [];

// store ships
var pShips = [];

// store guesses
var pGuesses = [];

//==============================
// Handle Messages From Client
//==============================

io.on('connect', function (socket) {

    // to access their specific game variables, this is the same for each connected pair of sockets
    let roomnum = -1;

    // initial message from client
    socket.on('server-log', function(data) {
        console.log('server got: ' + data);
    });

    //==============================
    // Creating and Joining Room
    //==============================

    // player1 creates the room
    socket.on('newRoom', function() {

        // get room number then increment numrooms to generate new numrooms for each new game
        roomnum = numrooms++;

        // generate room code
        let roomcode = 'room_'+ roomnum;

        // create room variables for the game
        pSocketIDs[roomnum] = [];
        pShips[roomnum] = [];
        pGuesses[roomnum] = [];

        // create room variables for player1
        pSocketIDs[roomnum].push(socket.id);
        pShips[roomnum].push(null);
        pGuesses[roomnum].push(null);

        // join room
        socket.join(roomcode);

        // send roomcode to client
        socket.emit('player1-joined', roomcode);
    });


    // player2 joins the room
    socket.on('joinRoom', function(data) {

        // get room number
        roomnum = parseInt(data.substring(5));

        // get roomcode
        let roomcode = data;

        // find room using room code
        let actualRoom = io.nsps['/'].adapter.rooms[roomcode];
        
        // if room has not been created or nobody is in room, send error message
        if (!actualRoom) {
            socket.emit('err', 'Sorry, that room does not exist');
        }
        else if (actualRoom.length != 1) {
            socket.emit('err', 'Sorry, that room is full');
        }
        else { // can join game

            // create room variables for player2
            pSocketIDs[roomnum].push(socket.id);
            pShips[roomnum].push(null);
            pGuesses[roomnum].push(null);

            // join room
            socket.join(roomcode);

            // notify client
            socket.emit('player2-joined', roomcode);
        }
    });

    //==============================
    // Handling Recieving Guesses
    //==============================

    socket.on('guesses-ships', function(data) {

        if (data.player == pSocketIDs[roomnum][p1]) { // is player1
            pShips[roomnum][p1] = data.ships;
            pGuesses[roomnum][p1] = data.guesses;
        } 

        else { // is player2
            pShips[roomnum][p2] = data.ships;
            pGuesses[roomnum][p2] = data.guesses;
        }

        // perform check and return answers
        if (pShips[roomnum][p1] != null && pShips[roomnum][p2] != null && pGuesses[roomnum][p1] != null && pGuesses[roomnum][p2] != null) {

            let p1answers = returnAnswers(pShips[roomnum][p2], pGuesses[roomnum][p1]); // answers to p1's guesses
            let p2answers = returnAnswers(pShips[roomnum][p1], pGuesses[roomnum][p2]); // answers to p2's guesses

            // send hits and misses to player1
            io.to(pSocketIDs[roomnum][p1]).emit('your-answers', {
                hits: p1answers.hits,
                misses: p1answers.misses,
            });
            io.to(pSocketIDs[roomnum][p1]).emit('opponent-answers', {
                hits: p2answers.hits,
                misses: p2answers.misses,
            });

            // send hits and misses to player 2
            io.to(pSocketIDs[roomnum][p2]).emit('your-answers', {
                hits: p2answers.hits,
                misses: p2answers.misses,
            });
            io.to(pSocketIDs[roomnum][p2]).emit('opponent-answers', {
                hits: p1answers.hits,
                misses: p1answers.misses,
            });

            // reset vars
            pShips[roomnum][p1] = null;
            pShips[roomnum][p2] = null;
            pGuesses[roomnum][p1] = null
            pGuesses[roomnum][p2] = null
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








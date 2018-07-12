var socket = io();

//==============================
// Game Variables
//==============================

var sessionID;

var guesses = [];
var myShips = [];

// game state variables
//var isPlacingShip = false;
var canPlay = false;


//==============================
// Handle messages from Sever
//==============================

// get sessionID, print it to console, and alert server that client joined
socket.on('connect', function() {
    sessionID = socket.io.engine.id;

    // testing code
    console.log('client-side sessionID: ' + sessionID);
    socket.emit('server-log', 'I am client ' + sessionID);
});

// testing code
// recieve message from server and print it out to console
socket.on('client-log', function(data) {
    console.log('client got: ' + data);
});

//==============================
// Handle messages from Sever - Creating and Joining Room
//==============================

// recieve roomcode and alert user, setUp new board 
socket.on('player1-joined', function(data) {
    alert('Tell your opponent to join: ' + data);
    console.log('player1 joined');
    startSetUpBoard();
});

// setUp new board
socket.on('player2-joined', function(data) {
    startSetUpBoard();
    console.log('player2 joined');
});

// error, send alert with error message to user
socket.on('err', function(data) {
    alert(data);
});

//==============================
// Interactions with html page - Creating and Joining Room
//==============================

// when html page loaded
$(document).ready(function() {

    // when new button clicked, tell server user wants to create new room
    $('#new').on('click', function() {
        socket.emit('newRoom', {});
    });

     // when join button clicked, tell server user wants to join room
    $('#join').on('click', function() {
        var roomcode = $('#roomcode').val();
        if(!roomcode) {
            alert('Please enter your room code!')
            return;
        }
        socket.emit('joinRoom', roomcode);
    });

});

//==============================
// Handle messages from Sever - Playing
//==============================

socket.on('your-answers', function(data) {
    console.log('got my answers');
    console.log('my hits: ' + data.hits);
    console.log('my misses: ' + data.misses);

});


socket.on('opponent-answers', function(data) {
    console.log('got opponent answers');
    console.log('opponent hits: ' + data.hits);
    console.log('opponent misses: ' + data.misses);
});


//==============================
// Interactions with html page - Playing
//==============================

// removes elements of menu and calls function to create new board
function startSetUpBoard() {
    $('#menu').remove();
    // add buttons here
    createOppoBoard();
    createMyBoard();
    canPlay = true;
}

//==============================
// Interactions with html page - MyBoard and Hits
//============================== 

// dynamically generates buttons + header
function createMyBoard() {
    
    $('#myBoard').append($('<h3/>', {
        text: 'Me',
    }));
    
    for (let i = 1; i <= 8; i++) {
        //let chr = String.fromCharCode(65 + i);
        for(let j = 1; j <= 8; j++) {
            var button = $('<button/>', {
                text: i + '' + j,
                id: 'm_' + i + '' + j,
                disabled: false,
                width: window.innerWidth/8.5,
                height: 25,
            });

            $('#myBoard').append(button);
        }
        $('#myBoard').append($('<br/>'));
    }

    // for now use default board
    myShips = [16, 17, 18, 21, 22, 23, 44, 47, 54, 57, 64, 67, 72, 73, 74];
}

//==============================
// Interactions with html page - OppoBoard and Guesses
//==============================

// dynamically generates buttons + header
function createOppoBoard() {

    $('#oppoBoard').append($('<h4/>', {
        text: 'Status: ',
        id: 'status',
    }));

    $('#oppoBoard').append($('<h3/>', {
        text: 'Opponent',
    }));

    for (let i = 1; i <= 8; i++) {
        //let chr = String.fromCharCode(65 + i);
        for(let j = 1; j <= 8; j++) {
            var button = $('<button/>', {
                text: i + '' + j,
                id: 'o_' + i + '' + j,
                disabled: false,
                width: window.innerWidth/8.5,
                height: 25,
            }).click(clickOppoBoardButton);
    
            $('#oppoBoard').append(button);
        }
        $('#oppoBoard').append($('<br/>'));
    }
}

// called on click by all buttons generated in create board
function clickOppoBoardButton(event) {
    if (canPlay) {
        index = parseInt(event.target.id.substring(2));
        event.target.disabled = true;
        event.target.style.background = '#000000';
        addGuesses(index);
    }
}

// add all guesses to guesses[] and when get 5 guesses, sort and send to server
function addGuesses(guess) {
    guesses.push(guess);
    if (guesses.length == 5) {

        canPlay = false;
        $('#status').text('Waiting for results...');

        guesses.sort(function(a, b) {return a-b});
        socket.emit('guesses-ships', {
            guesses: guesses,
            ships: myShips,
            player: sessionID
        });
    }
}
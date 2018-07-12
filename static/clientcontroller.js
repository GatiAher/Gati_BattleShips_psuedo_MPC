
var socket = io();
var sessionID;

//==============================
// Handle messages from Sever
//==============================

// get sessionID, print it to console, and alert server that client joined
socket.on('connect', function() {
    sessionID = socket.io.engine.id;
    console.log('client-side sessionID: ' + sessionID);
    socket.emit('test-client', 'I am client ' + sessionID);
});

// recieve message from server and print it out to console
socket.on('test-server', function(data) {
    console.log('client got: ' + data);
});

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
// Interactions with html page
//==============================

// removes elements of menu and calls function to create new board
function startSetUpBoard() {
    $('#menu').remove();
    // add buttons here
    createBoard();
}

// dynamically generates buttons
function createBoard() {
    for(let i = 1; i <= 10; i++) {
        var button = $('<button/>', {
            text: i,
            id: 'b_' + i,
            class: 'oppoBoard',
        }).click(clickGameButton);

        $('#myBoard').append(button);
    }
}

// called on click by all buttons generated in create board
function clickGameButton(event) {
    index = event.target.id.substring(2);
    socket.emit('message', {
        message: index,
        player: sessionID
    });
}

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
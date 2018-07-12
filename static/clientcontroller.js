
var socket = io();
var sessionID;

//==============================
// Communication via sockets
//==============================

socket.on('connect', function() {
    sessionID = socket.io.engine.id;
    console.log('client-side sessionID: ' + sessionID);
});

// recieve message from server
socket.on('test-server', function(data) {
    console.log('client got: ' + data);
});

// send message to server
socket.emit('test-client', 'this is from client');

// recieve roomcode
socket.on('player1-joined', function(data) {
    // now I want to add a new element that displays text and get rid of other 3 buttons
    startSetUpBoard();
    alert('Tell your opponent to join room ' + data);
    console.log('player1 joined');
});

socket.on('player2-joined', function(data) {
    // now I want to add a new element that displays text and get rid of other 3 buttons
    startSetUpBoard();
    console.log('player2 joined');
});

socket.on('err', function(data) {
    alert(data);
});

//==============================
// Interactions with html page
//==============================

function startSetUpBoard() {
    $('.join').remove();
    // add buttons here
    createBoard();
}

// so jquery creates an array of buttons?
function createBoard() {
    for(let i = 1; i <= 10; i++) {
        var button = $('<button/>', {
            text: 'button',
            id: 'b_' + i,
        }).click(clickGameButton);

        $('#myBoard').append(button);
    }
}

function clickGameButton(event) {
    index = event.target.id.substring(2);
    socket.emit('game-button', index);
    // testing
    socket.emit('message', {
        message: index,
        player: sessionID
    });
}


$(document).ready(function() {

    $('#new').on('click', function() {
        socket.emit('newRoom', {});
    });

    $('#join').on('click', function() {
        var roomcode = $('#roomcode').val();
        if(!roomcode) {
            alert('Please enter your room code!')
            return;
        }
        socket.emit('joinRoom', roomcode);
    });


});
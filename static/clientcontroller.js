
var socket = io();
var roomcode;

//==============================
// Communication via sockets
//==============================

// recieve message from server
socket.on('test-server', function(data) {
    console.log('client got: ' + data);
});

// send message to server
socket.emit('test-client', 'this is from client');

// recieve roomcode
socket.on('player1-joined', function(data) {
    startSetUpBoard();
    alert('Tell your opponent to join room ' + data);
    console.log('player1 joined');
    // now I want to add a new element that displays text and get rid of other 3 buttons
});

socket.on('player2-joined', function(data) {
    startSetUpBoard();
    console.log('player2 joined');
    // now I want to add a new element that displays text and get rid of other 3 buttons
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
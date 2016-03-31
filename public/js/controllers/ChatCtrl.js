angular.module('ChatCtrl', []).controller('ChatController', function($scope) {

	$scope.tagline = 'The square root of life is pi!';

	var socket = io();
    // on connection to server, ask for user's name with an anonymous callback
    socket.on('connect', function(){
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        socket.emit('adduser', prompt("What's your name?"));
    });

    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function (username, data) {
        $('#chat_messages').append('<li class="list-group-item"><b>'+username + ':</b> ' + data + '</li>');
    });

    // when the client clicks SEND
        $('#btn-chat').click( function() {
            var message = $('#btn-input').val();
            $('#btn-input').val('');
            // tell server to execute 'sendchat' and send along one parameter
            socket.emit('sendchat', message);
        });

        // when the client hits ENTER on their keyboard
        /*$('#btn-input').keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
                $('#btn-chat').focus().click();
            }
        });*/

});
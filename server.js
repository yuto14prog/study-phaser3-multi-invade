var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketio = require('socket.io');
var io = socketio(server);

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
  };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete players[socket.id];
    io.emit('disconnected', socket.id); //'disconnect' is a reserved event name -> 'disconnected'
  });

  socket.on('playerMovement', (movementData) => {
    players[socket.id].x = movementData.x
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    socket.broadcast.emit('playerMoved', players[socket.id]);
  })
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});
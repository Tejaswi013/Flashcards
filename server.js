// const express = require('express');
// const app = express();
// const path = require('path');
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);

// const PORT = 3000;

// // app.use(express.static('public')); // your HTML/JS files go in 'public'

// app.use(express.static(path.join(__dirname, 'public')));


// let players = {};

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('joinGame', (name) => {
//     players[socket.id] = { name, score: 0 };
//     io.emit('updatePlayers', players);
//   });

//   socket.on('submitAnswer', ({ playerId, isCorrect }) => {
//     if (players[playerId]) {
//       if (isCorrect) players[playerId].score += 1;
//       io.emit('updatePlayers', players);
//     }
//   });

//   socket.on('disconnect', () => {
//     delete players[socket.id];
//     io.emit('updatePlayers', players);
//   });
// });

// http.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Serve your main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'flashcards.html'));
});

const players = {};

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  // Listen for player joining with their name
  socket.on('player-join', (name) => {
    players[socket.id] = { name, score: 0 };
    console.log(`${name} joined the game.`);
  });

  // Listen for answers and update scores
  socket.on('answer', (isCorrect) => {
    if (isCorrect && players[socket.id]) {
      players[socket.id].score += 1;
    }
  });

  // Listen for game end event to broadcast players and scores
  socket.on('end-game', () => {
    // Emit 'game-over' event with all players and their scores
    io.emit('game-over', players);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    if (players[socket.id]) {
      console.log(`${players[socket.id].name} disconnected.`);
      delete players[socket.id];
    }
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

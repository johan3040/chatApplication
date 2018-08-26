
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SocketHandler = require('./SocketHandler.js');

app.use(express.static('../public'));

app.get('/', (req, res)=>{
  res.sendFile(__dirname + './../public/index.html');
  res.end();
});

io.on('connection', SocketHandler);

http.listen(8000, ()=>{
  console.log('listening on *:8000');
});
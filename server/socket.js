// import express from 'express';
// import http from 'http';
// import socket from 'socket.io';
//
// const app = express();
// const server = http.Server(app);
// const io = socket(server);
// server.listen(1337);

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected to client!');
    socket.on('msg', (data) => { console.log('Message obtained ', data); });
    socket.emit('msg', { hello: 'world' });
    socket.on('cmd', (data) => {
      console.log(data);
    });
  });
};

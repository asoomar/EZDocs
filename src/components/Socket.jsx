import http from 'http';
import express from 'express';
import socketio from 'socket.io';
import React from 'react';

const app = express();
const server = http.Server(app);
const io = socketio(server);

class Socket extends React.Component {
  componentDidMount() {
    const socket = io('http://localhost:8080');
    socket.on('connect', () => { console.log('ws connect'); });
    socket.on('disconnect', () => { console.log('ws disconnect'); });
    socket.on('msg', (data) => {
      console.log('ws msg:', data);
      socket.emit('cmd', { foo: 123 });
    });
  }
}

export default Socket;
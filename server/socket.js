// import express from 'express';
// import http from 'http';
// import socket from 'socket.io';
//
// const app = express();
// const server = http.Server(app);
// const io = socket(server);
// server.listen(1337);

module.exports = (io) => {
  let collaborating = [];
  //{docId: id, currentCollabs: [user1, user2, ...]}
  io.on('connection', (socket) => {
    console.log('Connected to client!');

    socket.on('joinRoom', (data) => {
      socket.join(data.docId);
      let docOpen = false;
      collaborating.forEach((doc) => {
        if (doc.docId === data.docId) {
          docOpen = true;
          if (doc.currentCollabs) {
            doc.currentCollabs.push(data.user);
          } else {
            doc.currentCollabs = [doc.user];
          }
          console.log('User joined room: ');
          console.log(doc.currentCollabs);
        }
      });
      if (docOpen === false) {
        collaborating.push({ docId: data.docId, currentCollabs: [data.user] });
      }
    });

    socket.on('leaveRoom', (data) => {
      socket.leave(data.docId);
      collaborating.forEach((doc) => {
        if (doc.docId === data.docId) {
          doc.currentCollabs.forEach((user, index) => {
            if (user.username === data.user.username) {
              doc.currentCollabs.splice(index, 1);
            }
          });
          console.log('User left room: ');
          console.log(doc.currentCollabs);
        }
      });
    });

    socket.on('currentusers', (data) => {
      let collabs = null;
      collaborating.forEach((doc) => {
        if (doc.docId === data.docId) {
          collabs = doc.currentCollabs;
        }
      });
      socket.emit('currentusers', collabs);
    });

    socket.on('change', (data) => {
      socket.broadcast.to(data.docId).emit('change', { editor: data.editor, styles: data.styles });
    });
  });
};

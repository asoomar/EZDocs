
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import ms from 'connect-mongo';
import passport from 'passport';
import ls from 'passport-local';
import mongoose from 'mongoose';
import User from './models/User';
import Document from './models/Document';

import './socket';

const MongoStore = ms(session);
const LocalStrategy = ls.Strategy;

let app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGODB_URI)
  .catch((err) => { console.log(err); });

app.use(session({
  secret: 'mysecretisthisrandomstringofletters',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log('Checking for user!');
    User.findOne(
      { username: username }, function(error, response) {
        if (error) {
          console.log('User not found!');
          done(null, false);
        } else if (response.password === password) {
          done(null, response);
        } else {
          done(null, false);
        }
      });
  },
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(error, response) {
    if(error) {
      console.log('Error: Could not find id! ' + id);
      done(error, false);
    } else {
      done(null, response);
    }
  });
});

require('./socket')(io);

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('User was just logged in');
  res.send({ success: true, user: req.user });
});

app.post('/signup', (req, res) => {
  console.log(`User is: ${req.body.username}\n Pass is: ${req.body.password}`);
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  newUser.save((error, response) => {
    if (error) {
      res.json({ success: false, error: error });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.json({ success: true });
});

app.post('/newdocument', (req, res) => {
  console.log('Creating new document!');
  if (req.user) {
    const newDoc = new Document({
      owner: req.user._id,
      title: req.body.title,
      password: req.body.password,
      createdTime: new Date(),
      lastEditTime: new Date(),
    });
    newDoc.save()
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.log('Could not save document');
        res.json({ success: false, error: err });
      });
  } else {
    console.log('Cannot create document: User not logged in!');
  }
});

app.get('/mydocs', (req, res) => {
  console.log('Retrieving your documents...');
  if (req.user) {
    Document.find({ owner: req.user._id })
      .then((response) => {
        res.json({ success: true, docs: response });
      })
      .catch((err) => {
        console.log('Could not retrieve your documents');
        res.json({ success: false, error: err });
      });
  } else {
    console.log('Cannot retrieve documents: User not logged in!');
  }
});

app.get('/mycollabdocs', (req, res) => {
  console.log('Retrieving documents you collaborate in...');
  Document.find()
    .then((response) => {
      let collab = response.filter(doc => {
        if (doc.collaboratorList.indexOf(req.user._id) > -1) {
          return true;
        }
        return false;
      });
      res.json({ success: true, docs: collab });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, error: err });
    });
});

app.post('/collaborate', (req, res) => {
  Document.findById(req.body.id)
    .then((response) => {
      let newCollabList = [...response.collaboratorList];
      newCollabList.push(req.user._id);
      if(response.password === req.body.password){
        Document.findByIdAndUpdate(req.body.id, { collaboratorList: newCollabList })
          .then((resp) => {
            console.log('User added as collaborator');
            res.json({ success: true });
          })
          .catch((err) => {
            console.log(err);
            res.json({ success: false });
          });
      } else{
        console.log('Password does not match');
        res.json({ success: false });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

app.post('/save', (req, res) => {
  console.log('Id is: ' + req.body.id);
  let currentDate = new Date();
  const contentUpdate = {
    editorState: req.body.editor,
    saveTime: currentDate,
    username: req.user.username,
    title: req.body.title,
    styles: req.body.styles,
  };
  Document.findById(req.body.id)
    .then((document) => {
      console.log(document);
      let newContent = [...document.content];
      newContent.push(contentUpdate);
      Document.findByIdAndUpdate(req.body.id, { content: newContent })
        .then(() => res.json({ success: true, date: currentDate }))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

app.post('/savetitle', (req, res) => {
  Document.findByIdAndUpdate(req.body.id, { title: req.body.newTitle })
    .then((response) => {
      console.log('Document renamed');
      res.json({ success: true });
    })
    .catch((err) => {
      console.log('Document not renamed');
      res.json({ success: false });
    });
});

app.post('/deletedoc', (req, res) => {
  Document.findByIdAndDelete(req.body.id)
    .then((response) => {
      console.log('Document deleted');
      res.json({ success: true });
    })
    .catch((err) => {
      console.log('Document not deleted');
      res.json({ success: false });
    });
});

// import socketio from 'socket.io';
//
// const app = express();
// const server = http.Server(app);
// const io = socketio(server);
// server.listen(8080);
//
// io.on('connection', (socket) => {
//   socket.emit('msg', { hello: 'world' });
//   socket.on('cmd', (data) => {
//     console.log(data);
//   });
// });

// http.createServer((req, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// }).listen(1337, '127.0.0.1');
//app.listen(process.env.PORT || 1337);

http.listen(1337);
console.log('Server running at http://127.0.0.1:1337/');

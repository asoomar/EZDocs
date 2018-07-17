import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import ms from 'connect-mongo';
import passport from 'passport';
import ls from 'passport-local';
import mongoose from 'mongoose';
import User from './models/models';

const MongoStore = ms(session);
const LocalStrategy = ls.Strategy;

let app = express();
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

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send({ success: true });
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
  res.redirect('/login');
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
app.listen(process.env.PORT || 1337);

console.log('Server running at http://127.0.0.1:1337/');

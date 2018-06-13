const express        = require('express')
const mongoose       = require('mongoose');
const bodyParser     = require('body-parser');
const passport       = require('passport');
const db             = require('./config/db');
const LocalStrategy  = require('passport-local').Strategy;
const app            = express();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000//8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'//'0.0.0.0'

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('auth')
})

app.listen(3000, function () {
  console.log('App listening on port 3000!')
})

app.get('/success', (req, res) => res.render('index'));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

//needed to keep session
passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

mongoose.connect(db.url);

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success?username='+req.user.username);
  });

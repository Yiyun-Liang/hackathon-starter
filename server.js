var express = require('express'),
  stylus = require('stylus'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  cookieParser = require('cookie-parser'),
  session = require('express-session');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path){
  return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({secret: 'unicorn'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(stylus.middleware(
{
  src: __dirname + '/public',
  compile: compile
}
));
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost/hackathon-starter'); //localhost/db name
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connecting error...'));
db.once('open', function callback(){
  console.log('hackathon-starter db opened!');
});

var userSchema = mongoose.Schema({
  first_name: String,
  last_name: String,
  user_name: String
})

var User = mongoose.model('User', userSchema);
User.find({}).exec(function(err, collection){
  if(collection.length === 0) {
    User.create({first_name: "Isa", last_name: "Liang", user_name: "Big Boss"})
  }
})


var User = mongoose.model('User');
passport.use(new localStrategy(
  function(username, password, done){
    User.findOne({username: username}).exec(function(err, user){
      if(user){
        return done(null, user);
      }else{
        return done(null, false);
      }
    })
  }
));

passport.serializeUser(function(user, done) {
  if(user){
    done(null, user, _id);
  }
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}).exec(function(err, user){
    if(user){
      return done(null, user)
    }else{
      return done(null, false)
    }
  })
});

app.post('/login', function(req, res, next){
  var auth = passport.authenticate('local', function(err, user){
  if(err) {return next(err);}
  if(!user) {res.send({success:false});}
  req.logIn(user, function(err){
    if(err) {return next(err)}
    res.send({success: true, user:user});
})
})
auth(req, res, next);
})

app.get('/partials/*', function(req,res){
  res.render('/partials/'   + req.params[0]);
});

app.get('*', function(req, res){
  res.render('index', {
  });
});

var port = process.env.PORT || 3030;
app.listen(port)
console.log("Server listening on port " + port + " ...");

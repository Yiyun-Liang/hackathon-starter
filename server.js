var express = require('express'),
  stylus = require('stylus'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path){
  return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
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
  last_name: String
})

var User = mongoose.model('User', userSchema);
var mongoUser;
User.findOne().exec(function(err, userDoc){
  mongoUser = userDoc.first_name + userDoc.last_name;
});

app.get('/partials/:partialPath', function(req,res){
  res.render('/partials/' + req.params.partialPath);
});

app.get('*', function(req, res){
  res.render('index', {
    mongoUser : mongoUser
  });
});

var port = 3030;
app.listen(port)
console.log("Server listening on port " + port + " ...");

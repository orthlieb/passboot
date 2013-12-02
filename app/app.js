/*
 creating a Express app initializing it with the HelloWorld message
 */
'use strict';

var PORT_LISTENER = 3001;
console.log('I am listening to this port: http://localhost:%s', PORT_LISTENER);

var express = require('express'),
  	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require('connect-flash'),
	_ = require('underscore');
	

var app = express();

app.set('env', process.env.NODE_ENV || 'development');
var config = require('./config/appConfig.json');
var appConfig = _.extend(config.common, config[app.get('env')]);
// XXX app.set('config', appConfig). Does this make it available to other parts of the app?

// Connect to the database.
mongoose.connect(appConfig.db);

// Load all models.
var models_dir = __dirname + '/models';
fs.readdirSync(models_dir).forEach(function (file) {
  if (file[0] === '.') return; 
  require(models_dir + '/' + file);
});

// Configure passport
require('./config/passport')(passport, appConfig);

// All environments
app.set('port', process.env.PORT || PORT_LISTENER);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: path.join(__dirname, appConfig.directories.publicDir) }));
app.use(express.methodOverride());
app.use(express.cookieParser(appConfig.key.cookie));
app.use(express.session({
    secret: appConfig.key.session,
    maxAge: 3600000
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));	// Log the user back in if already logged in.
app.use(flash());

// Routes
require('./routes/index')(app, passport);

app.use(app.router);
app.use(express.static(path.join(__dirname, appConfig.directories.publicDir)));

app.use(function (req, res, next) {
    console.log('req.body: ' + JSON.stringify(req.body));
    next();
});

// Development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
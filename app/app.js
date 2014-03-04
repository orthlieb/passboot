//
// Main application entry point.
//
// XXX Timeout on logged in session
// XXX API key
// XXX Local use encrypted password
// XXX Handle the Contact the Sherriff button on error pages.
// XXX When password is reset send an email to the user.
// XXX Put a password on the mongodb.
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

// Load config.
app.set('env', process.env.NODE_ENV || 'development');
var config = require('./config/appConfig.json');
app.set('config', _.extend(config.common, config[app.get('env')]));
config = app.get('config');

// Connect to the database.
mongoose.connect(config.db);

// Load all models.
var modelsDir = __dirname + '/models';
fs.readdirSync(modelsDir).forEach(function (file) {
    console.log('Models: loading ' + file);
    if (file[0] === '.') {
        return;
    }
    require(modelsDir + '/' + file);
});

// Configure passport
require('./config/passport')(passport, config);

// All environments
app.set('port', process.env.PORT || PORT_LISTENER);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: path.join(__dirname, config.directories.publicDir)
}));
app.use(express.methodOverride());
app.use(express.cookieParser(config.key.cookie));
app.use(express.session({
    secret: config.key.session,
    maxAge: 3600000
}));
app.use(passport.initialize());
app.use(passport.session());
if (config.features.rememberMe) {
    app.use(passport.authenticate('remember-me')); // Log the user back in if already logged in.
}
app.use(flash());

// Routes
require('./routes')(app, passport);

app.use(app.router);
app.use(express.static(path.join(__dirname, config.directories.publicDir)));

// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function (req, res) { //, next)
    console.log('404 Error req.body: ' + JSON.stringify(req.body));
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', {
            url: req.url
        });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.use(function (err, req, res) { //, next)
    // We may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    console.log('500 Error req.body: ' + JSON.stringify(req.body));
    res.status(err.status || 500);
    res.render('500', {
        error: err
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
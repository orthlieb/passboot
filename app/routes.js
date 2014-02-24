/*
 * Routes loader
 */

'use strict';

var User = require('./models/user');
var Token = require('./models/token');
var Auth = require('./middleware/authorization');
var _ = require('underscore');
var fs = require('fs');

// Bundle up flash for consumption in template files.
function bundleFlash(req) {
	// No flash {}
	// flash but empty contents { "info": [] }
	// flash { "info": ["This is some info"] }
	// We want to eliminate the first two cases and return null.
	var maperoo = [ 'error', 'info', 'success', 'warning' ];
		
	var ff = {};

	_.each(maperoo, function (value, index, list) {
		var f = req.flash(value);
		if (_.size(f) > 0 )
			ff[value == 'error' ? 'danger' : value] = f;
	});
	
	return _.size(ff) ? ff : null;
}

module.exports = function (app, passport) {
	var config = app.get('config');
	
	// Load all routes.
	var routes_dir = __dirname + '/routes';
	fs.readdirSync(routes_dir).forEach(function (file) {
		console.log("Routes: loading " + file);
		if (file[0] === '.') return; 
		require(routes_dir + '/' + file)(app, passport);
	});
	
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});
	
	// === PASSPORT ROUTES    
	// Facebook, Google, Twitter, LinkedIn
	app.get("/auth/facebook", passport.authenticate("facebook", { scope : "email"}));
	app.get("/auth/facebook/callback", 
		passport.authenticate("facebook", { successRedirect: config.url.home, failureRedirect: '/login' }));
	app.get("/auth/google", passport.authenticate("google"));
	// Google will redirect the user to this URL after authentication.  Finish
	// the process by verifying the assertion.  If valid, the user will be
	// logged in.  Otherwise, authentication has failed.
	app.get("/auth/google/return", passport.authenticate('google', { successRedirect: config.url.home,
    	failureRedirect: '/login' }));
	app.get("/auth/twitter", passport.authenticate("twitter", { scope : "email"}));
	app.get("/auth/twitter/callback", 
		passport.authenticate("twitter", { successRedirect: config.url.home, failureRedirect: '/login' }));
	app.get('/auth/linkedin', passport.authenticate('linkedin'));
	app.get('/auth/linkedin/callback', 
		passport.authenticate('linkedin', { successRedirect: config.url.home, failureRedirect: '/login' }));
	// === PASSPORT ROUTES
	
	// === API

	app.get('/api/user/valid', Auth.needsAccessLevel(Auth.accessLevels.public), function (req, res) {
		// Typically used for lookahead error message on the form.
		console.log("Testing for user existence: " + JSON.stringify(req.query));
		User.exists(req.query.id, function (err, user) {
			console.log("User existence [err: " + err + " user: " + JSON.stringify(req.query) + "]");
			return res.json(!!err);
		});
	});

	app.get('/api/password/valid', Auth.needsAccessLevel(Auth.accessLevels.public), function (req, res) {
		console.log("Testing password to see if it complies to policy: " + JSON.stringify(req.query));
		var complexify = require('node-complexify');
		complexify.evalPasswordComplexity(req.query.password, config.passwordOptions, function (err, valid, complexity) {
			var errMessages = {
				toosimple: "Your password is too simple, try using more characters and/or punctuation and numbers.",
				tooshort: "Your password is too short in length, add more characters.",
				banned: "Your password is too common, choose something more unique."
			};
			
			// Only return back the first error.
			return res.json((err && err.length) ? errMessages[err[0]] : true);
		});
	});

	// === API
	
	// === END OF THE LINE
	app.get('/404', function(req, res, next){
	  // trigger a 404 since no other middleware
	  // will match /404 after this one, and we're not
	  // responding here
	  next();
	});

	app.get('/403', function(req, res, next){
	  // trigger a 403 error
	  var err = new Error('Not allowed!');
	  err.status = 403;
	  next(err);
	});

	app.get('/500', function(req, res, next){
	  // trigger a generic (500) error
	  next(new Error('Internal system Error!'));
	});
	// === END OF THE LINE
};
/*
 * GET home page.
 */

'use strict';

var User = require('../models/user');
var Token = require('../models/token');
var Auth = require('../middleware/authorization');
var _ = require('underscore');

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
	
	// Regular routes
	
	// View the user's profile
	app.get("/profile", Auth.isAuthenticated, function (req, res) { 
		res.render("profile", { user : req.user }); 
	});
	app.post("/profile", Auth.isAuthenticated, function (req, res, next) {
		User.saveProfile(req.body, function (err, user, message) {
			if (err) return next(err, user, message);
			
			req.flash('info', "Profile successfully updated.");
			res.render('profile', { user: user, flash: bundleFlash(req) });
		});
	});

	// Local username/password signup and login.
	app.get("/signup", function (req, res) {
		res.render("signup");
	});
	app.post("/signup", function (req, res, next) {		
		User.signup(req.body, function (err, user) {
			// If there is an error while signing up, display the error.
			if (err) next(err, user);
			
			// Successful user creation. Login automatically.
			req.login(user, function(err, user) {
				if (err) return next(err, user);
				return res.redirect(config.url.home);
			});
		});
	});
	app.get("/login", function (req, res) { 
		res.render("login", { flash: bundleFlash(req) });
	});
	app.post("/login",
		passport.authenticate("local", { 
			failureRedirect: '/login',
			failureFlash: { type: 'error', message: 'Invalid user name or password?' }
		}),
		function (req, res, next) {
			// We've been authenticated by local, now issue a
		  	// "Remember Me" cookie if the option was checked
			if (!req.body.rememberme) { return next(); }

			Token.save(req.user.id, function (err, token) {
				if (err) { return done(err, token); }
				res.cookie('remember_me', token.id, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days XXX Switch to config flag
				return next();
			});
		},
		function (req, res, next) {
			res.redirect(config.url.home);
		}  
	);

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});
	
	// === BOOTSTRAP SAMPLES
    app.get('/', Auth.isAuthenticated, function(req, res) { 
		res.render("index", { user : req.user }); 
	});
    app.get('/template/:selectedTemplate', Auth.isAuthenticated, function (req, res) {
        res.render('bootstrap3-templates/' + req.params.selectedTemplate, {
            'pathToAssets': '/bootstrap-3.0.0',
            'pathToSelectedTemplateWithinBootstrap' : '/bootstrap-3.0.0/examples/' + req.params.selectedTemplate
        });
    });
    // === BOOTSTRAP SAMPLES

	// === PASSPORT ROUTES    
	// Facebook, Google, Twitter, LinkedIn
	app.get("/auth/facebook", passport.authenticate("facebook", { scope : "email"}));
	app.get("/auth/facebook/callback", 
		passport.authenticate("facebook", { successRedirect: config.url.home, failureRedirect: '/login' }));
	app.get("/auth/google", passport.authenticate("google"));
	// Google will redirect the user to this URL after authentication.  Finish
	// the process by verifying the assertion.  If valid, the user will be
	// logged in.  Otherwise, authentication has failed.
	app.get("/auth/google/return", passport.authenticate('google', { successRedirect: config.view.home,
    	failureRedirect: '/login' }));
	app.get("/auth/twitter", passport.authenticate("twitter", { scope : "email"}));
	app.get("/auth/twitter/callback", 
		passport.authenticate("twitter", { successRedirect: config.url.home, failureRedirect: '/login' }));
	app.get('/auth/linkedin', passport.authenticate('linkedin'));
	app.get('/auth/linkedin/callback', 
		passport.authenticate('linkedin', { successRedirect: config.url.home, failureRedirect: '/login' }));
	// === PASSPORT ROUTES
	
	// === API
	app.get('/api/user/valid', function (req, res) {
		// Typically used for lookahead error message on the form.
		console.log("Testing for user existence: " + JSON.stringify(req.query));
		User.exists(req.query.id, function (err, user) {
			console.log("User existence [err: " + err + " user: " + JSON.stringify(req.query) + "]");
			return res.json(!!err);
		});
	});
	// === API
};
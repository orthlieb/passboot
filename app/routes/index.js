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
	app.get("/", Auth.isAuthenticated, function (req, res) { 
		res.render("index", { user : req.user }); 
	});

	// View the user's profile
	app.get("/profile", Auth.isAuthenticated, function (req, res) { 
		res.render("profile", { user : req.user }); 
	});
	app.post("/profile", Auth.isAuthenticated, function (req, res, next) {
		User.saveProfile(req.body, function (err, user) {
			if (err) { 
				req.flash(err.type, err.message);
			} else {
				req.flash('info', "Profile successfully updated.");
			}
			res.render('profile', { user: user, flash: bundleFlash(req) });
		});
	});

	// Local username/password signup and login.
	
	function RenderSignup(req, res, next) {
		// Generate a one time token for the value of the checkbox, prevents replays.
		Token.save("captcha", function (err, token) {
			if (err) { return next ? next(err, token) : null; }
			
			res.render("signup", { user: req.body, captcha: config.features.checkbox_captcha, token: token.id, flash: bundleFlash(req) });
		});
	}
	
	function SignupAndLogin(req, res, next) {
		User.signup(req.body, function (err, user) {
			// If there is an error while signing up, display the error.
			if (err) { 
				req.flash(err.type, err.message);
				RenderSignup(req, res, next);
				return;
			}

			// Successful user creation. Login automatically.
			req.login(user, function(err, user) {
				if (err) return next(err, user);
				return res.redirect(config.url.home);
			});
		});
	}
	
	app.get("/signup", function (req, res) {
		RenderSignup(req, res);
	});
	
	app.post("/signup", function (req, res, next) {	
		if (config.features.checkbox_captcha) {
			if (req.hp) {
				// Hidden checkbox that should never be checked. Honeypot field for spambots. Issue a generic message.
				req.flash("error", "Invalid signup.");
				RenderSignup(req, res, next);
			}	
			Token.consume(req.body.notspambot, function (err, token) {
				// Must have no error and found the correct token
				if (!err && token && token == "captcha") {
					return SignupAndLogin(req, res, next);
				} else {
					// Bad captcha
					req.flash("error", "Please check the box to prove you're not a spambot.");
					RenderSignup(req, res, next);
				}
			});
		} else {	// No checkbox captcha
			return SignupAndLogin(req, res, next);
		}
	});
	
	app.get("/login", function (req, res) { 
		res.render("login", { rm: config.features.remember_me, flash: bundleFlash(req) });
	});
	app.post("/login",
		passport.authenticate("local", { 
			failureRedirect: '/login',
			failureFlash: { type: 'error', message: 'Invalid user name or password.' }
		}),
		function (req, res, next) {
			// We've been authenticated by local, now issue a
		  	// "Remember Me" cookie if the option was checked
			if (!req.body.rememberme) { return next(); }

			Token.save(req.user.id, function (err, token) {
				if (err) { return next(err); }
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
	app.get('/api/user/valid', function (req, res) {
		// Typically used for lookahead error message on the form.
		console.log("Testing for user existence: " + JSON.stringify(req.query));
		User.exists(req.query.id, function (err, user) {
			console.log("User existence [err: " + err + " user: " + JSON.stringify(req.query) + "]");
			return res.json(!!err);
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
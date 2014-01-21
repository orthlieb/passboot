/*
 * Index route
 */

'use strict';

var User = require('../models/user');
var Auth = require('../middleware/authorization');

module.exports = function (app, passport) {
	// Regular routes
	app.get("/", Auth.isAuthenticated, function (req, res) { 
		res.render("index", { user : req.user }); 
	});
}
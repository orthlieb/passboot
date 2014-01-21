/*
 * Login route
 */

'use strict';

var User = require('../models/user');
var Auth = require('../middleware/authorization');
var Token = require("../models/token");
var uiutil = require("../util/ui_util");

module.exports = function (app, passport) {
    var config = app.get('config');

    app.get("/login", function (req, res) { 
        res.render("login", { rm: config.features.remember_me, flash: uiutil.bundleFlash(req) });
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

            Token.save({ type: "rememberme", value: req.user.id }, function (err, token) {
                if (err) { return next(err); }
                res.cookie('remember_me', token.id, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days XXX Switch to config flag
                return next();
            });
        },
        function (req, res, next) {
            res.redirect(config.url.home);
        }  
    );
}
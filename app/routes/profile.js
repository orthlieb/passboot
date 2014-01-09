/*
 * Profile route
 */

'use strict';

var User = require('../models/user');
var Auth = require('../middleware/authorization');
var UI = require("../util/ui_util");

module.exports = function (app, passport) {
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
            res.render('profile', { user: user, flash: UI.bundleFlash(req) });
        });
    });
}
/*
 * Profile route
 */

'use strict';

var User = require('../models/user');
var Auth = require('../middleware/authorization');
var Token = require("../models/token");
var UI = require("../util/ui_util");

module.exports = function (app, passport) {
    var config = app.get('config');

    // Local username/password signup and login.    
    function RenderSignup(req, res, next) {
        // Generate a one time token for the value of the checkbox, prevents replays.
        Token.save({ type: "captcha", value: "captcha" }, function (err, token) {
            if (err) { return (next ? next(err, token) : null); }
            
            res.render("signup", { formData: req.body , captcha: config.features.checkbox_captcha, token: token.id, flash: UI.bundleFlash(req) });
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
            Token.consume(req.body.notspambot, function (err, token) {
                if (req.hp) {
                    // Hidden checkbox that should never be checked. Honeypot field for spambots. Issue a generic message.
                    req.flash("error", "Invalid signup.");
                    RenderSignup(req, res, next);
                }   
                
                // Must have no error and found the correct token
                if (!err && token && token == "captcha") {
                    return SignupAndLogin(req, res, next);
                } else {
                    // Bad captcha
                    req.flash("error", "Please check the box to prove you're not a spambot.");
                    RenderSignup(req, res, next);
                }
            });
        } else {    // No checkbox captcha
            return SignupAndLogin(req, res, next);
        }
    });
}
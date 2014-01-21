/*
 * Recover route
 * XXX Use html templates
 */

'use strict';
var Mail = require("nodemailer");
var UI = require("../util/ui_util");
var User = require("../models/user");
var Token = require("../models/token");

module.exports = function (app, passport) {
    var config = app.get('config');

	function sendMail(mailOptions) {
		// Send mail with defined transport object
		var transport = Mail.createTransport("SMTP", config.mail);
		transport.sendMail(mailOptions, function(error, response) {
		    if (error) {
		        console.log(error);
		    }else {
		        console.log("Message sent: " + response.message);
		    }
		    transport.close(); // shut down the connection pool, no more messages
		});
	}

    app.get("/recover", function (req, res) { 
        res.render("recover", { flash: UI.bundleFlash(req) });
    });
    app.post("/recover", function (req, res, next) {
		User.findOne({ email: req.body.email }, function (err, user) {
			if (err || !user) {
				// Email does not exist.
				req.flash('error', "Email does not exist, please re-enter.");
				res.render("recover", { flash: UI.bundleFlash(req) });
				return;
			}

			var mailOptions = {
			    from: config.mail.sender,
			    to: req.body.email, // list of receivers
			};

			if (req.body.recoverOption == "username") {
			    mailOptions.subject = "Recover user name";
			    mailOptions.text = "Hey, cowboy, the Sheriff says that your username for Passboot is " + _.escape(user.id) + ".";
			    mailOptions.html = "Hey, cowboy, the Sheriff says that your username for Passboot is <b>" + _.escape(user.id) + ".</b>";
			    sendMail(mailOptions);
			    req.flash('info', "Thank you, you should receive an email shortly with your username.");
            	res.redirect(config.url.login);
			} else {
				Token.save({ type: "reset", value: user.id }, function (err, token) {
					if (err)  
						console.log("Cannot generate token for user password reset." + err);
						
					var resetPasswordURL = encodeURI(config.site + "reset?id=" + token.id);
					console.log("Reset password issued: " + resetPasswordURL );
					mailOptions.subject = "Reset password";
			    	mailOptions.text = "Hey, cowboy, the Sheriff says to reset your password here: " + resetPasswordURL;
			    	mailOptions.html = "Hey, cowboy, the Sheriff says to reset your password <a href=\"" + resetPasswordURL + "\">here</a>";
			    	sendMail(mailOptions);
				    req.flash('info', "Thank you, you should receive an email shortly with a link to reset your password.");
	            	res.redirect(config.url.login);
				}, 16);
			}
        });  
    });
	
	function HandleError(req, res, err, redirectTo) {
		if (err) { 
			if (err.type) 
				req.flash(err.type, err.message); 
			else
				req.flash('error', err);				
		}
		
		return res.redirect(redirectTo); 		
	}
	
	app.get("/reset", function (req, res) {
		// Consume the one-time token that allows the user to get to the Reset Password page.
		Token.consume(req.query.id, function (err, token) {
			if (err) return HandleError(req, res, err, config.url.login);
			User.findOne({ id: token.value }, function (err, user) {
				if (err) return HandleError(req, res, err, config.url.login);

				// Create a new one-time token to prevent replay on the reset
				Token.save({ type: "resetpassword", value: user.id }, function (err, token) {
					if (err) return HandleError(req, res, err, config.url.login);

					return res.render("reset", { token: token.id, user: user, flash: UI.bundleFlash(req) });
				});
			});			
		});
	});
	app.post("/reset", function (req, res, next) {
		// Consume our one-time resetpassword token.
		Token.consume(req.body.token, function (err, token) {
			if (err) return HandleError(req, res, err, config.url.login);

			// Make sure that the token was used for this id.
			if (token.value != req.body.id) 
				return HandleError(req, res, { code: 404, type: "error", message: "Token does not match user name." }, config.url.login);

			// Find the associated user
			User.findOne({ id: token.value }, function (err, user) {
				if (err) return HandleError(req, res, err, config.url.login);

 				// Modify the profile and re-save
        		User.saveProfile({ id: user.id, newpassword: req.body.newpassword }, function (err, user) {
					if (err) return HandleError(req, res, err, config.url.login);

					// Log the user in directly
		            req.login(user, function(err, user) {
						if (err) return HandleError(req, res, err, config.url.login);
	        	        return res.redirect(config.url.home);
	            	});
		        });
			});
		});
	});
}
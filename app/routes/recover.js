/*
 * Recover route
 */

'use strict';

var UI = require("../util/ui_util");

module.exports = function (app, passport) {
    var config = app.get('config');

    app.get("/recover", function (req, res) { 
        res.render("recover", { flash: UI.bundleFlash(req) });
    });
    app.post("/recover",
        function (req, res, next) {
            res.redirect(config.url.home);
        }  
    );
}
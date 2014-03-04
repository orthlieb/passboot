'use strict';

var _ = require("underscore");

// Bundle up flash for consumption in template files.
exports.bundleFlash = function BundleFlash(req) {
    // No flash {}
    // flash but empty contents { "info": [] }
    // flash { "info": ["This is some info"] }
    // We want to eliminate the first two cases and return null.
    var maperoo = ['error', 'info', 'success', 'warning'];

    var ff = {};

    _.each(maperoo, function (value, index, list) {
        var f = req.flash(value);
        if (_.size(f) > 0)
            ff[value == 'error' ? 'danger' : value] = f;
    });

    return _.size(ff) ? ff : null;
}

exports.handleError = function HandleError(req, res, err, redirectTo) {
    if (err) {
        if (err.type)
            req.flash(err.type, err.message);
        else
            req.flash('error', err);
    }

    return res.redirect(redirectTo);
}
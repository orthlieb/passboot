var User = require('../../app/models/user');

exports.isAuthenticated = function (req, res, next){
    if (req.isAuthenticated()) {
    	console.log('Auth.isAuthenticated YES');
        next();
    } else {
    	console.log('Auth.isAuthenticated NO');
        res.redirect("/login");
    }
}

exports.exists = function(req, res, next) {
    User.count({
        id: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/signup");
        }
    });
}

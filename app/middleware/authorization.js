var User = require('../../app/models/user');

exports.isAuthenticated = function isAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
    	console.log('Auth.isAuthenticated YES');
        next();
    } else {
    	console.log('Auth.isAuthenticated NO');
        res.redirect("/login");
    }
};

exports.exists = function exists(req, res, next) {
    User.count({
        id: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/signup");
        }
    });
};

var userRoles = {
    public: 1, // 001
    user:   2, // 010
    admin:  4  // 100
};

exports.userRoles = userRoles;

exports.accessLevels = {
    public: userRoles.public | // 111
            userRoles.user   | 
            userRoles.admin,   
    anon:   userRoles.public,  // 001
    user:   userRoles.user |   // 110
            userRoles.admin,                    
    admin:  userRoles.admin    // 100
};

exports.isAuthorized = function isAuthorized(accessLevel, userRole) {
    userRole = userRole || userRoles.public;
    return (userRole & accessLevel);
}
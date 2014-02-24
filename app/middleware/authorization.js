var User = require('../../app/models/user');
var Auth = require('../../app/middleware/authorization');

var ACCESS_LEVELS = {
    public: User.roles.public | // 111
            User.roles.user   | 
            User.roles.admin,   
    anon:   User.roles.public,  // 001
    user:   User.roles.user |   // 110
            User.roles.admin,                    
    admin:  User.roles.admin    // 100
};
exports.accessLevels = ACCESS_LEVELS;

exports.isAuthenticated = function isAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
    	console.log('Auth.isAuthenticated YES');
        next();
    } else {
    	console.log('Auth.isAuthenticated NO');
        res.redirect("/login");
    }
};

// For API calls or restricted pages.
exports.needsAccessLevel = function needsAccessLevel(accessLevel) {
    return function(req, res, next) {          
        // As a user of the API you need a certain level of access.
        if (accessLevel == ACCESS_LEVELS.public)
            return next();
        
        if (req.user) {
            var role = User.roles[req.user.role] || User.roles.public;
            if (role & Auth.accessLevels[accessLevel])
                return next();
        }
        res.send(401, 'Unauthorized');
    };
};


exports.isAuthorized = function isAuthorized(accessLevel, userRole) {
    userRole = userRole || userRoles.public;
    return (userRole & accessLevel);
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



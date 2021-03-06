'use strict';

// Dependencies
var mongoose = require('mongoose');
var hash = require('../util/hash');
var _ = require('underscore');

/**
 * Callback to use for asynchronous calls into the object.
 * @callback User#userCallback
 * @param {User#userError} err - error object if an error occurs, null otherwise
 * @param {Object} user - the user object
 **/

/**
 * Error object passed to the done callback when an error occurs in this module.
 * @typedef {Object} User#userError
 * @property {integer} code - Error code for the error that was generated.
 * @property {String} type - One of 'error', 'warning', 'info'.
 * @property {String} message - Detailed error message.
 **/

/**
 * List of login providers that can be used to log in a user.
 * XXX Probably shouldn't hard code this list, rather get from somewhere else.
 * @alias User.providers
 * @readOnly
 * @enum {String}
 */
var USER_PROVIDERS = {
    local: 'local',
    facebook: 'facebook',
    google: 'google',
    twitter: 'twitter',
    linkedin: 'linkedin'
};
/**
 * List of genders available to describe a user.
 * @alias User.genders
 * @enum {String}
 * @readOnly
 */
var USER_GENDERS = {
    male: 'male',
    female: 'female'
};
/**
 * List of user roles available.
 * @alias User.roles
 * @enum {String}
 * @readOnly
 */
var USER_ROLES = {
    'public': 1,
    user: 2,
    admin: 4
};

function userEscapeString(str) {
    _.escape(str);
}

/**
 * The user class implements a user for the application.
 * @constructor User
 * @property {String} id - Unique user name for the user. e.g. tomthumb
 * @property {String} displayName - Friendly name to display for the user. E.g. Tom Thumb
 * @property {String} givenName - Given name for the user. E.g. Thomas
 * @property {String} familyName - Family name for the user. E.g. Thumb
 * @property {User.providers} [provider='local'] - Which provider will authenticate the user.
 * @property {String} email - User's primary email address. E.g. tom@thumb.com
 * @property {String} salt - Internal use only. Salt used for the user's password hashing.
 * @property {String} hash - Hashed password.
 * @property {String} photo - URL to the photo to be used for the user.
 * @property {User.genders} gender - User's gender.
 * @property {User.roles} [role='public'] - Role that the user has within the system.
 * @property {Date} [created=now] - Internal use only. Date the user was created.
 **/

var schemaTemplate = {
    id: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        set: userEscapeString

    },
    displayName: {
        type: String,
        trim: true,
        set: userEscapeString

    },
    givenName: {
        type: String,
        trim: true,
        set: userEscapeString

    },
    familyName: {
        type: String,
        trim: true,
        set: userEscapeString

    },
    provider: {
        type: String,
        default: 'local',
        lowercase: true,
        enum: _.keys(USER_PROVIDERS)
    },
    email: {
        type: String,
        match: [/\b[A-Z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i, '{PATH} is not a valid email'],
        lowercase: true,
        trim: true,
        set: userEscapeString

    },
    salt: String,
    hash: String,
    photo: {
        type: String,
        match: [/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/, '{PATH} is not a valid URL']
    },
    gender: {
        type: String,
        lowercase: true,
        trim: true,
        enum: _.keys(USER_GENDERS)
    },
    role: {
        type: String,
        default: 'public',
        enum: _.keys(USER_ROLES)
    },
    created: {
        type: Date,
        default: Date.now
    }
};

var User = new mongoose.Schema(schemaTemplate);

User.statics.roles = USER_ROLES;
User.statics.providers = USER_PROVIDERS;
User.statics.genders = USER_GENDERS;
/**
 * Handle error conditions from mongoose schema validation
 * @function User~userVanillaErrorHandler
 * @param {Object} err - Error from mongoose internal systems
 * @param {Object} user - User object
 * @param {User#userCallback} done - Callback to be called when an error occurs
 * @internal
 */
function userVanillaErrorHandler(err, user, done) {
    // err: ValidationError
    // 	errors: Object
    // 		displayName: ValidatorError
    // 			message: 'Validator 'required' failed for path displayName with value ``'
    // 			name: 'ValidatorError'
    // 			path: 'displayName'
    // 			stack: undefined
    // 			type: 'required'
    // 			value: '
    // 		familyName: ValidatorError
    // 		givenName: ValidatorError
    // 	message: 'Validation failed'
    //	name: 'ValidationError'
    // 	stack: undefined
    if (err) {
        if (err.name && err.name === 'ValidationError') {
            err.message += ' [' + _.keys(err.errors).join(', ') + ']';
            return done({
                code: 400,
                type: 'error',
                message: err.message,
                params: _.keys(err.errors)
            }, user);
        }
        console.log('User Model Error: ' + err);
        return done({
            code: 500,
            type: 'error',
            message: 'Internal error.'
        }, user);
    }
    return done(null, user);
}

/**
 * List of keys in the User schema
 * @method User.keys
 * @return {Array} List of keys in the user object schema
 */
User.statics.keys = function () {
    return _.keys(schemaTemplate);
};

/**
 * Determine whether a particular user already exists
 * @method User.exists
 * @param {String} id - Unique user name for the user. e.g. tomthumb
 * @param  {User#userCallback} done - Callback to be called when an error occurs or method finishes.
 * @return Returns the result of the calling the done function back to the caller.
 */
User.statics.exists = function (username, done) {
    this.findOne({
        id: username
    }, function (err, user) {
        if (err) {
            return userVanillaErrorHandler(err, user, done);
        }
        if (!user) {
            return done({
                code: 404,
                type: 'error',
                message: 'User does not exist.'
            });
        }

        return done(false, user);
    });
};

/**
 * The data object that can be passed to the {@link User.signup}, {@link User.socialLogin}, and {@link User.saveProfile} methods.
 * @typedef {Object} User.userData
 * @property {String} id - Unique user name for the user. e.g. tomthumb
 * @property {String} displayName - Friendly name to display for the user. E.g. Tom Thumb
 * @property {String} givenName - Given name for the user. E.g. Thomas
 * @property {String} familyName - Family name for the user. E.g. Thumb
 * @property {User.providers} [provider='local'] - Which provider will authenticate the user.
 * @property {String} email - User's primary email address. E.g. tom@thumb.com
 * @property {User.genders} gender - User's gender.
 * @property {String} password - Password to be used for the account. Converted to hash/salt and not returned with the user object.
 * @property {String} oldpassword - Old password to specify if renaming the password as part of {@link User.saveProfile}.
 * In this case, password is the new password to use. An error will occur if the password does not match the current password.
 */

/**
 * Sign up a new user
 * @method  User.signup
 * @param  {User.userData} data - Basic data to set up the user. Note that provider in this case will be 'local'.
 * @param  {User#userCallback} done - Callback to be called when an error occurs or method finishes.
 * @return Returns the result of the calling the done function back to the caller.
 */
User.statics.signup = function (data, done) {
    var User = this;

    User.count({
        id: data.id
    }, function (err, count) {
        if (err) {
            return userVanillaErrorHandler(err, null, done);
        }
        if (count > 0) {
            return done({
                code: 409,
                type: 'error',
                message: 'User id already exists.'
            });
        }

        data.displayName = data.displayName || data.givenName + ' ' + data.familyName;
        data.provider = USER_PROVIDERS.local;

        var obj = hash.createHash(data.password);
        data.salt = obj.salt;
        data.hash = obj.hash;

        data.role = 'user';

        data = _.pick(data, _.keys(schemaTemplate)); // Limit which fields get picked up

        User.create(data, function (err, user) {
            if (err) {
                return userVanillaErrorHandler(err, user, done);
            }

            return done(null, user);
        });
    });
};

/**
 * Login a user through a social network.
 * @method  User.socialLogin
 * @param  {User.userData} data - Basic data to set up the user as provided by the provider.
 * @param  {User#userCallback} done - Callback to be called when an error occurs or method finishes.
 * @return Returns the result of the calling the done function back to the caller.
 */
User.statics.socialLogin = function (data, done) {
    User.findOne({
        provider: data.provider,
        id: data.id
    }, function (err, user) {
        if (err) {
            return userVanillaErrorHandler(err, user, done);
        }
        if (user) {
            return done(null, user); // Already exists.
        }
        data = _.pick(data, _.keys(schemaTemplate)); // Limit which fields get applied.
        User.create(data, function (err, user) {
            if (err) {
                return userVanillaErrorHandler(err, user, done);
            }
            return done(null, user);
        });
    });
};

/**
 * Modify the profile for a user.
 * @method  User.saveProfile
 * @param  {User.userData} data - Basic data to set up the user as provided by the provider.
 * @param  {User#userCallback} done - Callback to be called when an error occurs or method finishes.
 * @return Returns the result of the calling the done function back to the caller.
 */
User.statics.saveProfile = function (data, done) {
    var User = this;

    User.findOne({
        id: data.id
    }, function (err, user) {
        if (err) {
            return userVanillaErrorHandler(err, user, done);
        }

        if (!user) {
            return done({
                code: 404,
                type: 'error',
                message: 'User does not exist.'
            }, user);
        }

        if (data.oldpassword && data.password) {
            // Make sure that the old password is valid before we change to a new one.
            if (!hash.checkPassword(user.hash, user.salt, data.oldpassword)) {
                return done({
                    code: 401,
                    type: 'error',
                    message: 'Incorrect password.'
                }, user);
            }

            var obj = hash.createHash(data.password);
            data.salt = obj.salt;
            data.hash = obj.hash;
        }

        user = _.extend(user, _.pick(data, _.keys(schemaTemplate))); // Limit which fields get applied.

        user.save(function (err, user) {
            if (err) {
                return userVanillaErrorHandler(err, user, done);
            }
            return done(null, user);
        });
    });
};

/**
 * Determine whether a password is valid for a particular user.
 * @method User.isValidUserPassword
 * @param {String} id - Unique id for the user. E.g. tomthumb
 * @param {String} password - Password to be validated for the user.
 * @param {User.userCallback} done - Callback to be called when an error occurs or the method finishes.
 * @return Returns the result of the calling the done function back to the caller.
 */
User.statics.isValidUserPassword = function (id, password, done) {
    this.findOne({
        id: id
    }, function (err, user) {
        // if (err) throw err;
        if (err) {
            return userVanillaErrorHandler(err, user, done);
        }

        if (user && hash.checkPassword(user.hash, user.salt, password)) {
            return done(null, user); // Checks out!
        }

        return done({
            code: 401,
            type: 'error',
            message: 'Unknown user id or incorrect password.'
        });
    });
};

module.exports = mongoose.model('User', User);
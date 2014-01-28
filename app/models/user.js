var mongoose = require('mongoose');
var hash = require('../util/hash');
var _ = require('underscore');

function UserEscapeString(val, schemaType) {
	return _.escape(val);
}

// XXX Probably shouldn't hard code the providers.
var USER_PROVIDERS = [ "local", "facebook", "google", "twitter", "linkedin" ];
var USER_GENDERS = [ "male", "female" ];

var schemaTemplate = {
	id:	{ type: String, required: true, unique: true, lowercase: true, trim: true, set: UserEscapeString },
	displayName: { type: String, trim: true, set: UserEscapeString },
	givenName: { type: String, trim: true, set: UserEscapeString },
	familyName: { type: String, trim: true, set: UserEscapeString },
	provider: { type: String, default: 'local', lowercase: true, enum: USER_PROVIDERS },
	email: { 
		type: String, 
		match: [ /\b[A-Z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i, '{PATH} is not a valid email' ],
		lowercase: true, 
		trim: true, 
		set: UserEscapeString 
	},
	salt: String,
	hash: String,
	photo: { 
		type: String, 
		match: [ /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/, '{PATH} is not a valid URL' ]
	},
	gender: { type: String, lowercase: true, trim: true, enum: USER_GENDERS },
	created: { type: Date, default: Date.now }
};

var UserSchema = new mongoose.Schema(schemaTemplate);

function UserVanillaErrorHandler(err, user, done) {
// err: ValidationError
// 	errors: Object
// 		displayName: ValidatorError
// 			message: "Validator "required" failed for path displayName with value ``"
// 			name: "ValidatorError"
// 			path: "displayName"
// 			stack: undefined
// 			type: "required"
// 			value: ""
// 		familyName: ValidatorError
// 		givenName: ValidatorError
// 	message: "Validation failed"
//	name: "ValidationError"
// 	stack: undefined
	if (err) {
		if (err.name && err.name == "ValidationError") {
			err.message += " [" + _.keys(err.errors).join(", ") + "]";
			return done({ code: 400, type: 'error', message: err.message, params: _.keys(err.errors)});
		}
		console.log("User Model Error: " + err);
		return done({ code: 500, type: 'error', message: 'Internal error.' });
	}
	return done(null, user);
}

UserSchema.statics.keys = function () {
	return _.keys(schemaTemplate);
}

UserSchema.statics.exists = function (username, done) {
	var User = this;
	this.findOne({ id: username }, function (err, user) {
		if (err) return UserVanillaErrorHandler(err, user, done);
		if (!user) {
			return done({ code: 404, type: 'error', message: 'User does not exist.' });
		}

		return done(false, user);
	});
}

UserSchema.statics.signup = function (data, done) {
	var User = this;
	
	User.count({ id: data.id }, function (err, count) {
		if (err) return UserVanillaErrorHandler(err, user, done);
		if (count > 0) {
			return done({ code: 409, type: 'error', message: "User id already exists." });
		}
		
		data.displayName = data.displayName || data.givenName + " " + data.familyName;		
		
		var obj = hash.createHash(data.password);
		data.salt = obj.salt;
		data.hash = obj.hash;
		 
		data = _.pick(data, _.keys(schemaTemplate));	// Limit which fields get picked up

		User.create(data, function (err, user) {
			if (err) return UserVanillaErrorHandler(err, user, done);

			return done(null, user);
		});
	});
};

UserSchema.statics.socialLogin = function (data, done) {
	User.findOne({ provider: data.provider, id: data.id }, function (err, user) {
		if (err) return UserVanillaErrorHandler(err, user, done);
		if (user) return done(null, user);	// Already exists.
		data = _.pick(data, _.keys(schemaTemplate));		// Limit which fields get applied.
		User.create(data, function (err, user) {
			if (err) return UserVanillaErrorHandler(err, user, done);
			return done(null, user);
		});
	});
};
	
UserSchema.statics.saveProfile = function (data, done) {
	var User = this;
	
	User.findOne({ id: data.id }, function (err, user) {
		if (err) return UserVanillaErrorHandler(err, user, done);

		if (!user) return done({ code: 404, type: 'error', message: "User does not exist." });
		
		if (data.password && data.newpassword) {
			// Make sure that the old password is valid before we change to a new one.
			if (!hash.checkPassword(user.hash, user.salt, data.password)) {
				return done({code: 401,  type: 'error', message: "Incorrect password." });
			}
			
			var obj = hash.createHash(data.newpassword);
			data.salt = obj.salt;
			data.hash = obj.hash;
		}
		
		user = _.extend(user, _.pick(data, _.keys(schemaTemplate))); 	// Limit which fields get applied.

		user.save(function(err, user) {
			if (err) return UserVanillaErrorHandler(err, user, done);
			return done(null, user);
		});
	});
};

UserSchema.statics.isValidUserPassword = function (id, password, done) {
	this.findOne({ id : id }, function (err, user) {
		// if (err) throw err;
		if (err) return UserVanillaErrorHandler(err, user, done);
		
		if (user && hash.checkPassword(user.hash, user.salt, password))
			return done(null, user);		// Checks out!
		
		return done({ code: 401, type: 'error', message: 'Unknown user id or incorrect password.' });
	});
};

UserSchema.statics.changePassword = function (data, done) {
	var User = this;
	
	User.findOne({ id: data.id }, function (err, user) {
		if (err) return UserVanillaErrorHandler(err, user, done);

		if (!user) return done({ code: 404, type: 'error', message: "User does not exist." });
		
		if (data.newpassword) {
			var obj = hash.createHash(data.newpassword);
			data.salt = obj.salt;
			data.hash = obj.hash;
		}
		
		user = _.extend(user, _.pick(data, _.keys(schemaTemplate))); 	// Limit which fields get applied.

		user.save(function(err, user) {
			if (err) return UserVanillaErrorHandler(err, user, done);
			return done(null, user);
		});
	});
}

var User = mongoose.model("User", UserSchema);
module.exports = User;
var mongoose = require('mongoose');
var hash = require('../util/hash');

var UserSchema = new mongoose.Schema({
	id:				String,
	displayName:	String,
	givenName:		String,
	familyName:		String,
	provider: 		String,
	email:      	String,
	salt:       	String,
	hash:       	String,
	photo:			String,
	gender:			String,
	json:			String,
});

UserSchema.statics.exists = function (username, done) {
	var User = this;
	this.findOne({ id: username }, function (err, user) {
		if (err) return done(err);
		if (!user) {
			console.log("UserSchema.exists(" + username + ") false");
			return done("notfound", { type: 'error', message: 'User does not exist.' });
		}
		console.log("UserSchema.exists(" + username + ") true");
		console.log("User: " + JSON.stringify(user));
		return done(false, user);
	});
}

var fields = [ "id", "email", "displayName", "givenName", "familyName", "salt", "hash" ];

UserSchema.statics.signup = function (data, done) {
	var User = this;
	
	User.count({ id: data.id }, function (err, count) {
		if (count > 0) {
			return done("duplicate", { type: 'error', message: "User id already exists." });
		}
		
		data = _.pick(data, fields);	// Limit which fields get picked up
		data.displayName = data.displayName || data.givenName + " " + data.familyName;		
		
		var hash = hash.createHash(data.password);
		data.salt = hash.salt;
		data.hash = hash.hash;
		 
		User.create(data, function (err, user) {
			console.log('Created user (err="' + JSON.stringify(err) + '", user="' + JSON.stringify(user) + '"');
			if (err) return done(err);
			return done(null, user);
		});
	});
}

UserSchema.statics.saveProfile = function (data, done) {
	var User = this;
	
	User.findOne({ id: data.id }, function (err, user) {
		if (err) done(err);

		if (!user) done(404, null, { type: 'error', message: "User does not exist." });
		
		if (data.password && data.newpassword) {
			// Make sure that the password is valid before we change to a new one.
			if (!hash.checkPassword(user.hash, user.salt, data.password)) {
				return done(null, false, { type: 'error', message: "Incorrect password." });
			}
			
			var obj = hash.createHash(data.newpassword);
			data.salt = obj.salt;
			data.hash = obj.hash;
		}
		
		user = _.extend(user, _.pick(data, fields)); 	// Limit which fields get applied.

		user.save(function(err, user) {
			if (err) done(err);
			done(null, user);
		});
	});
}

UserSchema.statics.isValidUserPassword = function (id, password, done) {
	this.findOne({ id : id }, function (err, user) {
		// if (err) throw err;
		if (err) return done(err);
		if (!user) {
			return done(null, false, { type: 'error', message: 'Unknown user id or incorrect password.' });
		}
		
		if (hash.checkPassword(user.hash, user.salt, password))
			return done(null, user);		// Checks out!
		
		return done(null, false, { type: 'error', message: 'Unknown user id or incorrect password.' });
	});
};

var User = mongoose.model("User", UserSchema);
module.exports = User;
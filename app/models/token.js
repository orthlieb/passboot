var mongoose = require('mongoose');
var hash = require('../util/hash');


var TokenSchema = new mongoose.Schema({
	id: String,
	uid: String,
	created: { type: Date, default: Date.now }
});

// Tokens are generated and consumed one-time.
TokenSchema.statics.consume = function (tokid, done) {
	var Token = this;
	Token.findOne({ id: tokid }, function (err, token) {
		if (err) return done(err, token);
		if (!token) {
			return done({ code: 404, type: "error", message: "Token not found." });
		}

		var uid = token.uid;
		token.remove();	// One time use.
		
		return done(null, token.uid);
	});
};
	
TokenSchema.statics.save = function (uid, done) {
	var Token = this;
	var d = new Date();
	
	tokid = hash.createSalt();
	Token.create({ id: tokid, uid: uid }, function (err, token) {
		if (err) return done(err, token);
		return done(null, token);
	}); 
};

var Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
var mongoose = require('mongoose');
var crypto = require('crypto');


var TokenSchema = new mongoose.Schema({
	id: String,
	uid: String,
	created: { type: Date, default: Date.now }
});

// Tokens are generated and consumed one-time.
TokenSchema.statics.consume = function (tokid, done) {
	var Token = this;
	Token.findOne({ id: tokid }, function (err, token) {
		if (err) done(err, token);
		if (!token) {
			return done(null, false);
		}

		var uid = token.uid;
		token.remove();	// One time use.
		
		return done(null, token.uid);
	});
};
	
TokenSchema.statics.save = function (uid, done) {
	var Token = this;
	var d = new Date();
	
	crypto.randomBytes(128, function(err, tokid) {
      if (err) return done(err, tokid);
		tokid = tokid.toString('base64');
		Token.create({ id: tokid, uid: uid }, function (err, token) {
			if (err) return done(err, token);
			return done(null, token);
		}); 
	});
};

var Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
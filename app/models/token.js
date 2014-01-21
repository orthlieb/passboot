/* Token Model
 * XXX We will want to occasionally go through the Token data base and delete old tokens that don't get used.
 */
var mongoose = require('mongoose');
var hash = require('../util/hash');


var TokenSchema = new mongoose.Schema({
	id: String,
	type: String,
	value: String,
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

		token.remove();	// One time use.
		
		return done(null, token);
	});
};
	
TokenSchema.statics.save = function (data, done, keylen) {
	var Token = this;
	var d = new Date();
	
	data.id =  hash.createSalt(keylen);
	Token.create(data, function (err, token) {
		if (err) return done(err, token);
		return done(null, token);
	}); 
};

var Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
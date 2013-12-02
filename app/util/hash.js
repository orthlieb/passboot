var crypto = require('crypto');

var DEFAULT_LENGTH = 128;
var DEFAULT_ITERATIONS = 12000;	// ~ 300ms

/*
 * Create a random salt of the specified length.
 * 
 * @param {Integer} [keylen] Optional length of hash string.
 * @returns {String} hash The generated hash.
 * @throws {Error} error Can throw an error.
 * @api public
 */
exports.createSalt = function createSalt(keylen) {
	keylen = keylen || DEFAULT_LENGTH;
	return crypto.randomBytes(keylen);
}

/* Creates a hash of a password with the given salt. If the salt is
 * is not provided it is generated. Note that first parameter can be an object with 
 * the named parameters if so desired.
 *
 * @param {String} password Password to hash.
 * @param {String} [salt] Optional salt to use in hashing the password.
 * @param {Integer} [iterations] Number of iterations to hash, default is 12,000.
 * @param {Integer} [keylen] Length in bytes of the hash to generate, default is 128.
 * @returns {Object} obj Returns a hash object containing the hash, salt, iterations, and keylen.
 * @throws {Error} error Can throw an error.
 * @api public
 */
 exports.createHash = function createHash(password, salt, iterations, keylen) {
	password = password || "";
 	keylen = keylen || DEFAULT_LENGTH;
 	var obj = (typeof password == "object") ? password : {
		password: password,
		keylen: keylen,
		salt: salt || this.createSalt(keylen),
		iterations: iterations || DEFAULT_ITERATIONS
	}		
 
 	obj.hash = crypto.pbkdf2Sync(obj.password, obj.salt, obj.iterations, obj.keylen).toString();
 
	return obj;
}

/* Validates that the given password hashes to the supplied hash.
 *
 * @param {String} origHash Hash to compare against.
 * @param {String} origSalt Salt used to generate original hash.
 * @param {String} tryPassword Password to hash with the supplied origSalt and compare against origHash.
 * @param {Integer} [iterations] Number of iterations user to generate the origHash, default is 12,000.
 * @returns {Boolean} matches Returns true if the hashed password matches the supplied hash, false otherwise.
 * @api public
 */
exports.checkPassword = function checkPassword(origHash, origSalt, tryPassword, iterations) {
	try {
		iterations = iterations || DEFAULT_ITERATIONS;
		keylen = origHash.length;
		var newHash = this.createHash(tryPassword, origSalt, iterations, keylen);
		return (origHash == newHash.hash);
	} catch (err) {
		return false;
	}
}

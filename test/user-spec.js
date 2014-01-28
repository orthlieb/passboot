// spec/user-spec.js
var User = require("../app/models/user");
var mongoose = require('mongoose');
var expect = require('chai').expect;

before(function(done) {
  mongoose.connect("mongodb://localhost/passboot");  // Connect to the database
  User.remove({ id: "testid" }, done);
});

describe("user", function (done) {
  it("should create a new user", function (done) {
  	var data = {
  		id: 		"testid",
  		email: 		"test@test.com",
  		givenName: 	"Testy",
  		familyName: "Tester",
  		password: 	"testtest",  
  		confirm: 	"testtest"
  	};
    console.log("signing up the user!");
  	User.signup(data, function (err, user) {
      console.log("Signed up the user!");
  		expect(err).to.be.a('null');
  		expect(user).to.be.an('object');
      done();
  	});
  });
});  

after(function (done) {
  // Clean up
  User.remove({ id: "testid" }, done);
});  
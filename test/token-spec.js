// spec/token-spec.js
var Token = require("../app/models/token");
var mongoose = require('mongoose');
var expect = require('chai').expect;

before (function(done) {
    console.log("\n==== Token Model Unit Test Suite ====");
    mongoose.connect("mongodb://localhost/passboot");  // Connect to the database
    done();
});

var dataTemplate = {
    type: "test",
    value: "mytestdata"
};

describe ("New token", function () {
    var tokid = null;
 
    it ("should be generated", function (done) {
        Token.generate(dataTemplate, function (err, token) {
            expect(err).to.not.be.ok;
            expect(token).to.have.property('id');
            tokid = token.id;
            done();
        });
    });

    it ("should not be consumed if invalid", function (done) {
        Token.consume("invalidtokenid", function (err, token) {
            // Should have an invalid parameter
            expect(err).to.have.property('code', 404);
            done();
        });
    });
 
    it ("should be consumed if valid", function (done) {
        console.log(tokid);
        Token.consume(tokid, function (err, token) {
            // No errors
            expect(err).to.not.be.ok;
            expect(token).to.have.property('type', dataTemplate.type);
            expect(token).to.have.property('value', dataTemplate.value);
            done();
        });
    });
});

after (function(done) {
    mongoose.disconnect();  // Disconnect from the database
    done();
});
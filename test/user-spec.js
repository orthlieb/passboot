'use strict';

// spec/user-spec.js
var User = require('../app/models/user');
var mongoose = require('mongoose');
var expect = require('chai').expect;
var _ = require('underscore');

before(function (done) {
    console.log('\n==== User Model Unit Test Suite ====');
    //  mongoose.connect('mongodb://localhost/passboot');  // Connect to the database
    User.remove({
        id: 'testid'
    }, done);
});

var dataTemplate = {
    id: 'testid',
    email: 'test@test.com',
    givenName: 'Testy',
    familyName: 'Tester',
    password: 'testtest',
    confirm: 'testtest'
};

describe('New user', function (done) {

    it('should not be created with a null id', function (done) {
        var data = _.clone(dataTemplate);
        data.id = null;
        User.signup(data, function (err, user) {
            // Should have an invalid parameter
            expect(err).to.have.property('code', 400);
            done();
        });
    });

    it('should not be created with an invalid email', function (done) {
        var data = _.clone(dataTemplate);
        data.email = 'a@a.a';
        User.signup(data, function (err, user) {
            // Should have an invalid parameter
            expect(err).to.have.property('code', 400);
            done();
        });
    });

    it('should not not be created with an invalid photo URL', function (done) {
        var data = _.clone(dataTemplate);
        data.photo = 'htp://www.mygorgeousness.com';
        User.signup(data, function (err, user) {
            // Should have an invalid parameter
            expect(err).to.have.property('code', 400);
            done();
        });
    });

    it('should not be created with an invalid gender', function (done) {
        var data = _.clone(dataTemplate);
        data.gender = 'martian';
        User.signup(data, function (err, user) {
            // Should have an invalid parameter
            expect(err).to.have.property('code', 400);
            done();
        });
    });

    it('should be created with valid data', function (done) {
        var data = _.clone(dataTemplate);
        data.dingle = 'hewhoshouldnotbesaved';
        User.signup(data, function (err, user) {
            // No errors
            expect(err).to.not.be.ok;
            // Object should have been created
            expect(user).to.have.property('id', 'testid');
            // Unspecified properties should not be written
            expect(user).to.not.have.property('dingle');
            done();
        });
    });

    it('should be found once created', function (done) {
        User.exists('testid', function (err, user) {
            // No errors
            expect(err).to.not.be.ok;
            // Retrieval of user should be successful
            expect(user).to.have.property('id', 'testid');
            done();
        });
    });

    it('should not be created if one already exists', function (done) {
        var data = _.clone(dataTemplate);
        User.signup(data, function (err, user) {
            // Should issue a 409 error.
            expect(err).to.have.property('code', 409);
            done();
        });
    });
});

describe('Existing user', function (done) {
    it('should not save a profile if the user does not really exist', function (done) {
        var data = _.clone(dataTemplate);
        data.id = 'doesnotexist';
        User.saveProfile(data, function (err, user) {
            expect(err).to.have.property('code', 404);
        });
        done();
    });

    it('should not save a profile if the password is changing and the old password does not match ', function (done) {
        var data = _.clone(dataTemplate);
        data.oldpassword = 'invalidpassword ';
        data.password = 'newpassword ';
        User.saveProfile(data, function (err, user) {
            expect(err).to.have.property('code', 401);
        });
        done();
    });

    it('should save the profile if the data is valid', function (done) {
        var data = _.clone(dataTemplate);
        data.dingle = 'hewhoshouldnotbesaved';
        data.gender = 'male';
        User.saveProfile(data, function (err, user) {
            expect(err).to.not.be.ok;
            expect(user).to.not.have.property('dingle');
            expect(user).to.have.property('gender', 'male');
        });
        done();
    });
});

describe('User password', function (done) {
    it('should be valid', function (done) {
        var data = _.clone(dataTemplate);
        User.isValidUserPassword(data.id, data.password, function (err, user) {
            expect(err).to.be.not.ok;
        });
        done();
    });

    it('should not be valid', function (done) {
        var data = _.clone(dataTemplate);
        data.password = 'invalidpassword';
        User.isValidUserPassword(data.id, data.password, function (err, user) {
            expect(err).to.have.property('code', 401);
        });
        done();
    });
});

after(function (done) {
    // Clean up
    User.remove({
        id: 'testid'
    });
    mongoose.disconnect();
    done();
});
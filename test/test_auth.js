var async = require("async");
var bcrypt = require("bcrypt");

var chai = require("chai");
var expect = chai.expect;

var constants = require("../models/constants.js");

var user_auth = require("../models/user_auth");
var UserAuth = user_auth.UserAuth;

var session_model = require("../models/session.js");
var Session = session_model.Session;

var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

var auth = require("../util/auth.js");


describe("Authentication", function() {

  // Before each test, save a sample user in the database.
  beforeEach(function(done) {
    async.series([
      function(callback) {
        mongoose.connect(constants.MONGO_TEST_URL, callback);
      }, // End connect to MongoDB.
      function(callback) {
        UserAuth.remove({}, callback);
      }, // End remove user auth.
      function(callback) {
        Session.remove({}, callback);
      }, // End remove session.
      function(callback) {
        bcrypt.hash("password1", constants.SALT, function(err, hash_password) {
          var sample_user = new UserAuth({
            "username": "harihar",
            "hash_password": hash_password
          }); // End sample user definition.

          sample_user.save(callback);
        }); // End hash password.
      }, // End create test user 1.
      function(callback) {
        bcrypt.hash("password2", constants.SALT, function(err, hash_password) {
          var sample_user = new UserAuth({
            "username": "subramanyam",
            "hash_password": hash_password
          }); // End sample user definition.

          sample_user.save(callback);
        }); // End hash password.
      }, // End create test user 2.
      function(callback) {
        // The session's ID is an object, so to convert into a string, you must call toString, 
        // which gives:
        // 313233343536373839303132
        var session = new Session({
          "username": "subramanyam",
          "_id": ObjectId("123456789012")
        });
        session.save(callback);
      }, // End create test sessions.
    ],
    function(err, results) {
      if (err) throw err;
      done();
    }); // End async series.
  }); // End beforeEach.

  describe("#register_user", function() {

    it("shouldn't register a user that already exists", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT); 
      authManager.register_user("harihar", "password", function(err, session_id) {
        expect(err).to.not.be.a("null");
        done();
      }); // End register user call.
    }); // End it shouldn't register a user that already exists.

    it("should register a user who doesn't exist", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);

      authManager.register_user("new user", "password", function(err, session_id) {
        expect(session_id).to.be.a("String");

        UserAuth.find({username: "new user"}, function(err, results) {
          expect(results).to.not.be.a("null");
          expect(results.length).to.eql(1);

          bcrypt.compare("password", results[0].hash_password, function(err, isMatch) {
            expect(isMatch).to.be.true;
            done();
          }); // End hash comparison.
        }); // End find username.
      }); // End register user call.
    }); // End it should register a user who doesn't exist.
  }); // End describe register user.

  describe("#create_session", function() {
    it("creates a session if the user exists", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);

      authManager.create_session("harihar", function(err, session_id) {
        expect(session_id).to.be.a("String");

        var object_id = new mongoose.Types.ObjectId(session_id);

        Session.find({_id: object_id}, function(err, results) {
          if (err) throw err;
          expect(results.length).to.eql(1);
          done();
        }); // End session find.
      }); // End create_session.
    }); // End it creates a session if the user exists.

    it("ensures each user has at most one session", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      Session.find({"username": "subramanyam"}, function(err, results) {
        if (err) throw err;
        expect(results.length).to.eql(1);

        authManager.create_session("subramanyam", function(err, session_id) {
          if (err) throw err;
          Session.find({"username": "subramanyam"}, function(err, results) {
            if (err) throw err;
            expect(results.length).to.eql(1);
            done();
          }); // End second find for existing session.
        }); // End create_session.
      }); // End find for existing session.
    }); // End it ensures that each user has at most one session id.

    it("won't create a session if the user doesn't exist", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.create_session("fake user", function(err, session_id) {
        expect(err).to.not.be.a("null");
        Session.find({"username": "fake user"}, function(err, results) {
          if (err) throw err;
          expect(results.length).to.eql(0);
          done();
        }); // End find for fake user.
      }); // End create_session.
    }); // End it won't create a session if the user doesn't exist.
  }); // End describe create session.

  describe("#validate_session", function() {
    it("returns true when the session is valid", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.validate_session("123456789012", function(err, is_valid) {
        if (err) throw err;
        expect(is_valid).to.be.true;
        done();
      }); // Validate an existing session.
    }); // End it returns true when the session is valid.

    it("returns false when the session is invalid", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.validate_session("223456789012", function(err, is_valid) {
        if (err) throw err;
        expect(is_valid).to.be.false;
        done();
      }); // Validate a nonexisting session.
    }); // End it returns false when the session is invalid.
  }); // End describe validate session.

  describe("#login_user", function() {
    it("logs a user in if they exist", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.login_user("harihar", "password1", function(err, session_id) {
        if (err) throw err;
        expect(session_id).to.be.a("String");
        done();
      }); // End login user.
    }); // End it logs a user in if they exist.

    it("doesn't log a user in if they don't exist", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.login_user("fake user", "password1", function(err, session_id) {
        expect(err).to.not.be.a("null");
        expect(err.reason).to.eql(1);
        done();
      }); // End login user.
    }); // End it doesn't log a user in if they don't exist. 

    it("doesn't log a user in if the password is wrong", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.login_user("harihar", "fake password", function(err, session_id) {
        expect(err).to.not.be.a("null");
        expect(err.reason).to.eql(2);
        done();
      }); // End login user.
    }); // End it doesn't log a user in if the password is wrong.
  }); // End describe login user.

  describe("#check_if_user_exists", function() {
    it("returns true if the user exists", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.check_if_user_exists("harihar", function(err, does_exist) {
        if (err) throw err;
        expect(does_exist).to.be.true;
        done();
      }); // End check if user exists.
    }); // End it returns true if the user exists.

    it("returns false if the user does not exist", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.check_if_user_exists("fake user", function(err, does_exist) {
        if (err) throw err;
        expect(does_exist).to.be.false;
        done();
      }); // End check if user exists.
    }); // End it returns false if the user does not exist.
  }); // End describe check if user exists.

  describe("#clear_all_data", function() {
    it("deletes all user auth and session data", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.clear_all_data(function(err) {
        if (err) throw err;
        Session.find({}, function(err, results) {
          if (err) throw err;
          expect(results.length).to.eql(0);
          UserAuth.find({}, function(err, results) {
            if (err) throw err;
            expect(results.length).to.eql(0);
            done();
          }); // End find user auth.
        }); // End find session.
      }); // End clear all data.
    }); // End it deletes all user auth and session data.
  }); // End describe clear all data.

  describe("#get_username_for_session_id", function() {
    it("gets the username for the session id", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.get_username_for_session_id("313233343536373839303132", function(err, username) {
        if (err) throw err;
        expect(username).to.eql("subramanyam");
        done();
      }); // End get_username_for_session_id.
    }); // End it gets the username for the session id.

    it("throws an error if there is no username for the session_id", function(done) {
      var authManager = new auth.AuthManager(mongoose, constants.SALT);
      authManager.get_username_for_session_id("000000000000000000000000", function(err, username) {
        expect(err).to.be.not.a("null");
        done();
      }); // End get_username_for_session_id.
    }); // End it throws an error if there is no username for the session_id.
  }); // End describe get username for session id.

  afterEach(function(done) {
    async.series([
      function(callback) {
        UserAuth.remove({}, callback);
      }, // End remove user auth. 
      function(callback) {
        Session.remove({}, callback);
      }, // End remove sessions.
      function(callback) {
        mongoose.connection.close(callback);
      } // End disconnect from MongoDB.
    ], function(err, results) {
      if (err) throw err;
      done();
    }); // End async series.
  }); // End afterEach.
}); // End describe authentication.

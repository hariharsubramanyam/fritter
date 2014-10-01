var express = require("express");
var async = require("async");
var UserAuth = require("../models/user_auth").UserAuth;
var Session = require("../models/session").Session;
var constants = require("../models/constants");
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var bcrypt = require("bcrypt");
var router = express.Router();
var mongoose;

/**
 * @param req - The body must include username and password field.
 * @param res - The result is the session_id
 */
router.post("/login", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that the request contains the username and password.
    function(callback) {
      var username = req.body.username;
      var password = req.body.password;
      if (username === undefined || password === undefined) {
        send_error(res, "POST body need username and password");
      } else if (username.length <= 5 || password.length <= 5) {
        send_error(res, "The username and password must be over 5 chars long");
      } else {
        callback(null, username, password);
      } 
    },
    // Step 2: Search for the username.
    function(username, password, callback) {
      UserAuth.find({"username": username}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length > 0) {
          callback(null, username, password, results[0].hash_password);
        } else {
          send_error(res, "Username not found!");
        } 
      }); 
    }, 
    // Step 3: Check if the passwords match.
    function(username, password, hash_password, callback) {
      bcrypt.compare(password, hash_password, function(err, is_match) {
        if (err) send_error(res, err);
        if (is_match) {
          callback(null, username);
        } else {
          send_error(res, "The password is incorrect!");
        }
      });
    },
    // Step 4: Remove old sessions.
    function(username, callback) {
      Session.remove({"username": username}, function(err, result) {
        if (err) send_error(res, err);
        callback(null, username);
      });
    },
    // Step 5: Create a new session.
    function(username, callback) {
      var session = new Session({"username": username});
      session.save(function(err, result) {
        if (err) send_error(res, err);
        send_response(res, result._id.toString());
      });
    }
  ]);
}); // End login.

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

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
router.post("/register", function(req, res) {
  async.waterfall([
    // Step 1: Get the username and password from the request.
    function(callback){
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
    // Step 2: Check if the username already exists.
    function(username, password, callback) {
      UserAuth.find({"username": username}, function(err, results) {
        if (err) send_error(res, err); 
        if (results.length > 0) {
          send_error(res, "Username already in use!");
        } else {
          callback(null, username, password);
        } 
      }); 
    }, 
    // Step 3: Create a hashed password.
    function(username, password, callback) {
      bcrypt.hash(password, constants.SALT, function(err, hash_password) {
        if (err) send_error(res, err); 
        callback(null, username, hash_password);
      });
    },
    // Step 4: Add the user.
    function(username, hash_password, callback) {
      var new_user = new UserAuth({
        "username": username,
        "hash_password": hash_password
      });

      new_user.save(function(err, result) {
        if (err) send_error(res, err);
        callback(null, username);
      });
    },
    // Step 5: Create a session for the user.
    function(username, callback) {
      var session = new Session({"username": username});
      session.save(function(err, result) {
        if (err) send_error(res, err);
        send_response(res, result._id.toString());
      });
    }
  ]); // End waterfall.
}); // End register.

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
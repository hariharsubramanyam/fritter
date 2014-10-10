/**
 * This file defines the routes for authentication.
 *
 * login - Logs the user in.
 * register - Registers a new user.
 * validate_session - Ensures that the session id is valid.
 * logout - Logs the user out.
 */

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
 * Logs a user in.
 * @param req - POST body must include a 'username' and 'password'.
 * @param res - The result is: 
 * {
 *  error: An error message, or null if there is no error.
 *  result: The session id string (if there is no error).
 * }
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
}); 

/**
 * Registers a new user.
 *
 * @param req - The POST body must contain a 'username' and 'password'.
 * @param res - Result is 
 * {
 *  error: An error message (or null if there is no error).
 *  result: The session_id string (if there is no error).
 * }
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
  ]); 
}); 

/**
 * Validates a given session id.
 *
 * @param req - The post body must contain a 'session_id'
 * @param res - Returns
 * {
 *  error: An error message (or null if there is no error)
 *  result: The username associated with this session id (if there is no error).
 * }
 */
router.post("/validate_session", function(req, res) {
  async.waterfall([
    // Step 1: Make sure that a session_id is in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "There must be a session_id in the POST body");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Search for the session_id.
    function(session_id, callback) {
      try {
        Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
          if (err) send_error(res, err);
          if (results.length == 0) {
            send_error(res, "There is no session!");
          } else {
            send_response(res, results[0].username);
          }
        });
      } catch(err) {
        send_error(res, "Error in searching for session_id");
      }
    }
  ]);
}); 

/**
 * Logs a user out.
 *
 * @param req - The request body must contain a 'session_id'
 * @param res - The result is 
 * {
 *  error: The error message (or null if there is no error)
 *  result: true (if there is no error).
 * }
 */
router.post("/logout", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that session_id is in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "There must be a session_id in the POST body");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Delete the session_id.
    function(session_id, callback) {
      try {
        Session.remove({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, result) {
          if (err) send_error(res, err);
          send_response(res, true);
        });
      } catch(err) {
        send_error(res, "Error in searching for session_id");
      }
    }
  ]);
}); 

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

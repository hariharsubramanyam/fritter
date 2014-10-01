var express = require("express");
var async = require("async");
var UserAuth = require("../models/user_auth").UserAuth;
var Session = require("../models/session").Session;
var constants = require("../models/constants");
var bcrypt = require("bcrypt");
var router = express.Router();
var mongoose;

var send_error = function(res, error) {
  res.end(JSON.stringify({
    "error": error
  }));
};

var send_response = function(res, result) {
  res.end(JSON.stringify({
    "error": null,
    "result": result
  }));
};

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

/**
 * @param req - Must contain a session_id in body
 * @param res - result is true (if session exists) or false.
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
          send_response(res, (results.length > 0));
        });
      } catch(err) {
        send_error(res, "Error in searching for session_id");
      }
    }
  ]);
}); // End validate_session.

/**
 * @param req - Must contain session_id in body.
 * @param res - Result is true if the logout was successful.
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
}); // End logout.


module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

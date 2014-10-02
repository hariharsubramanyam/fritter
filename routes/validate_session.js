// This file defines a route for validating a session_id.

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
 * @param req - Must contain a session_id in body
 * @param res - Returns
 *
 * {
 *  error: An error or null if there is no error.
 *  result: The username associated with this session.
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
}); // End validate_session.

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

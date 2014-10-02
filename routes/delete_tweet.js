// This file defines a route for deleting a tweet.

var express = require("express");
var async = require("async");
var UserAuth = require("../models/user_auth").UserAuth;
var Session = require("../models/session").Session;
var Tweet = require("../models/tweet").Tweet;
var constants = require("../models/constants");
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var bcrypt = require("bcrypt");
var router = express.Router();
var mongoose;

/**
 * Deletes a tweet.
 *
 * @param req - The body must contain the session_id and tweet_id.
 * @param res - The response is:
 * {
 *  error: An error, or null.
 *  result: true (if the delete succeeded)
 * }
 */
router.post("/delete", function(req,res) {
  async.waterfall([
    // Step 1: Get the session_id and tweet_id from the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      var tweet_id = req.body.tweet_id;
      if (session_id === undefined || tweet_id === undefined) {
        send_error(res, "The POST body requires session_id and tweet_id");
      } else {
        try {
          var ObjectId = mongoose.Types.ObjectId;
          session_id = new ObjectId(session_id);
          tweet_id = new ObjectId(tweet_id);
          callback(null, session_id, tweet_id);
        } catch(err) {
          send_error(res, "Could not conver the tweet_id and session_id to ObjectIds");
        }
      }
    },
    // Step 2: Get the username associated with the session_id.
    function(session_id, tweet_id, callback) {
      Session.find({"_id": session_id}, function(err, results) {
        if (err) send_error(res, err);
        callback(null, tweet_id, results[0].username);
      }); 
    },
    // Step 3: Delete the tweet.
    function(tweet_id, username, callback) {
      Tweet.remove({"_id": tweet_id, "username": username}, function(err, numAffected){
          if (err) send_error(res, "Error in modifying tweets"); 
          send_response(res, true);
      });
    },
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}


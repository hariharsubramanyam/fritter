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

var TWEET_LENGTH = 140;

/**
 * Makes a tweet.
 *
 * @param req - POST body needs session_id and tweet.
 * @param res - The response will be:
 * {
 *  error: whether an error occured,
 *  result: {
 *    _id: An ObjectId indicating the ID (you need to use toString() on this)
 *    username: The user who created the tweet.
 *    created: The date when the tweet was created.
 *    content: The content of the tweet.
 *  }
 * }
 */
router.post("/make", function(req, res) {
  async.waterfall([
    // Step 1: Get the session_id and tweet content from the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      var tweet = req.body.tweet;
      if (session_id === undefined || tweet === undefined) {
        send_error(res, "POST body needs tweet and session_id");
      } else if (tweet.length > TWEET_LENGTH) {
        send_error(res, "Tweet cannot be more than 140 characters");
      } else {
        callback(null, session_id, tweet);
      }
    },
    // Step 2: Get the username associated with the given session_id.
    function(session_id, tweet, callback) {
      try {
        Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
          if (err) send_error(res, err);
          if (results.length === 0) {
            send_error(res, "There is no session with the given id!");
          } else {
            callback(null, results[0].username, tweet);
          }
        });
      } catch(err) {
        send_error(res, "Error in searching for session_id");
      }
    },
    // Step 3: Make a tweet for the given user.
    function(username, tweet, callback) {
      var tweet = new Tweet({"username": username, "content": tweet}); 
      tweet.save(function(err, result) {
        if (err) send_error(res, err);
        send_response(res, result);
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

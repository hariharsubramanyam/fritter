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
 * Edits a tweet. 
 *
 * @param req - The POST body must contain a session_id, tweet_id, and content (the new text of the
 *              tweet).
 * @param res - Returns 
 * {
 *  error: An error, or null,
 *  result: 
 *  {
 *    _id: ObjectId for tweet (you should call toString() on it when using it in API call)
 *    username: The user who created the tweet.
 *    created: The date when the tweet was created.
 *    content: The content of the tweet.
 *  }
 * }
 */
router.post("/edit", function(req, res) {
  async.waterfall([
    // Step 1: Get the session_id, tweet_id, and content from the POST body. 
    function(callback) {
      var session_id = req.body.session_id;
      var tweet_id = req.body.tweet_id;
      var content = req.body.content;
      if (session_id === undefined || tweet_id === undefined || content === undefined) {
        send_error(res, "The POST body requires session_id, tweet_id, and content");
      } else {
        try {
          var ObjectId = mongoose.Types.ObjectId;
          session_id = new ObjectId(session_id);
          tweet_id = new ObjectId(tweet_id);
          callback(null, session_id, tweet_id, content);
        } catch(err) {
          send_error(res, "Could not conver the tweet_id and session_id to ObjectIds");
        }
      }
    },
    // Step 2: Get the username associated with the session_id.
    function(session_id, tweet_id, content, callback) {
      Session.find({"_id": session_id}, function(err, results) {
        if (err) send_error(res, err);
        callback(null, tweet_id, results[0].username, content);
      }); 
    },
    // Step 3: Edit the tweet for the given username.
    function(tweet_id, username, content, callback) {
      Tweet.update({"_id": tweet_id, "username": username}, 
        {"content": content},
        function(err, numAffected){
          if (err) send_error(res, "Error in modifying tweets"); 
          if (numAffected == 0) {
            send_error(res, "There are no tweets with the given ID and associated session");
          } else {
            callback(null, tweet_id);
          }
      });
    },
    // Step 4: Find the tweet with the given id.
    function(tweet_id, callback) {
      Tweet.find({"_id": tweet_id}, function(err, results) {
        if (err) send_error(res, "Could not find tweet with given id");
        if (results.length == 0) {
          send_error(res, "There is no tweet with ID " + tweet_id.toString());
        } else {
          send_response(res, results[0]);
        }
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

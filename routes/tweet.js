var express = require("express");
var async = require("async");
var Session = require("../models/session").Session;
var Tweet = require("../models/tweet").Tweet;
var Follow = require("../models/follow").Follow;
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var router = express.Router();
var mongoose;
var TWEET_LENGTH = 140;

/**
 * Gets all the tweets since a given date, sorted by date in descending order (latest tweet first).
 *
 * The URL must include a date, which is the result of a toString() call to a JavaScript date object.
 * 
 * @param req
 * @param res - Will be 
 * {
 *  error: An error, or null,
 *  result: [...] (the tweets sorted by creation date in descending order);
 * }
 */
router.get("/since/:date", function(req, res) {
  async.waterfall([
    // Step 1: Create the date from the given timestamp.
    function(callback) {
      try {
        callback(null, new Date(req.params.date));
      } catch(err) {
        send_error(res, "Failed to convert the date into a JavaScript Date");
      }
    },
    // Step 2: Return all tweets since the timestamp.
    function(date, callback) {
      try {
        Tweet.find({"created": {"$gte": date}}).sort("created").exec(function (err, results) {
          if (err) send_error(res, "Could not find tweets");
          send_response(res, results);
        });
      } catch(err) {
        send_error(res, "Could not retreive tweets after date " + date);
      }
    }
  ]);
});

/**
 * Makes a tweet.
 *
 * @param req - POST body needs session_id and tweet.
 * @param res - The response will be:
 * {
 *  error: The error, or null if there is no error.
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

/**
 * Returns all the tweets sorted by date.
 *
 * @param res - Returns 
 * {
 *  error: the error, or null if there is no error.
 *  result: [...] (the array of tweet objects)
 * }
 */
router.get("/all", function(req, res) {
  async.waterfall([
    // Step 1: Return all the tweets.
    function(callback) {
      Tweet.find({}).sort("created").exec(function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

/**
 * Returns all the tweets of the people this user follows (and the user him/herself)  sorted by date.
 *
 * @param req - POST body must contain a session_id.
 * @param res - Returns 
 * {
 *  error: the error, or null if there is no error.
 *  result: [...] (the array of tweet objects)
 * }
 */
router.post("/followed", function(req, res) {
  async.waterfall([
    // Step 1: Get the session_id from the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "POST body needs a session_id");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username for the session_id.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length === 0) {
          send_error(res, "There is no user with the given session_id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Get all the followed users for given username.
    function(username, callback) {
      Follow.find({"follower": username}, function(err, results) {
        if (err) send_error(res, err);
        callback(null, username, results);
      });
    },
    // Step 4: Create an array of usernames.
    function(username, results, callback) {
      var usernames = [username];
      for (var i = 0; i < results.length; i++) {
        usernames.push(results[i].followed);
      }
      callback(null, usernames);
    },
    // Step 5: Return the tweets of the followed users and the user him/herself.
    function(usernames, callback) {
      Tweet.find({"username": {"$in": usernames}}).sort("created").exec(function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}

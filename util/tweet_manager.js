var constants = require("../models/constants"); var Tweet = require("../models/tweet").Tweet;
/**
 * This is the API used to make tweets.
 *
 * @param mongoose - The mongoose module for connecting to MongoDB. It should already be connected.
 * @param authManager - The authentication manager (from util/auth.js).
 */
var TweetManager = function(mongoose, authManager) {
  var auth_manager = authManager;
  /**
   * Makes a tweet for the user.
   *
   * @param username - The username of the user who is tweeting.
   * @param content - The content of the tweet.
   * @param callback - The callback function to execute. It will be called as callback(err, 
   *                   tweet_id), where tweet_id is a String representing the ID of the tweet.
   *                   The err object represents the error. It is null if there is no error. It is
   *                   an Error object if the username does not exist.
   */
  var make_tweet = function(username, content, callback) {
    auth_manager.check_if_user_exists(username, function(err, does_exist) {
      if (err) throw err;
      if (does_exist) {
        var tweet = new Tweet({
          "username": username,
          "content": content
        });
        tweet.save(function(err, result) {
          if (err) throw err;
          var tweet_id = result._id.toString();
          callback(null, tweet_id);
        }); // Save the tweet.
      } else {
        callback(new Error("The username does not exist"));
      } // End else (i.e. the username does not exist).
    }); // End check if user exists.
  }; // End make_tweet.

  /**
   * Edits a tweet.
   *
   * @param tweet_id - The id of the tweet.
   * @param content - The new content of the tweet (String).
   * @param callback - The callback to execute. It will be called as callback(err, tweet_id). 
   *                   The err object null if there is no error. It is an Error object if the 
   *                   tweet_id does not exist.
   */
  var edit_tweet = function(tweet_id, content, callback) {
    var tweet_object_id = new mongoose.Types.ObjectId(tweet_id);
    Tweet.update({"_id": tweet_object_id}, {"content": content}, function(err, number_affected) {
      if (err) throw err;
      if (number_affected === 0) {
        callback(new Error("There is no tweet with the given id"));
      } else {
        callback(null, tweet_id);
      } // End else (the tweet was updated).
    }); // End update.
  }; // End edit_tweet.

  /**
   * Deletes a tweet.
   *
   * @param tweet_id - The id of the tweet.
   * @param callback - The callback function to execute. It will be executed as callback(err). The
   *                   err object is null if there is no error
   */
  var delete_tweet = function(tweet_id, callback) {
    var tweet_object_id = new mongoose.Types.ObjectId(tweet_id);
    Tweet.remove({"_id": tweet_object_id}, function(err, result) {
      if (err) throw err;
      callback(null);
    }); // End remove the tweets.
  }; // End delete_tweet.

  /**
   * Gets the tweets for a user.
   *
   * @param username - The username to look up.
   * @param callback - The callback to execute. It will be executed as callback(err, tweets). The
   *                   err object is null if there is no error. Otherwise, err is an Error object
   *                   indicating that the username does not exist. The tweets is an array of
   *                   objects of the form:
   *                   {
   *                      _id: a MongoDB ObjectId indicating the tweet id. To convert it to a 
   *                           String, you must call the toString() function on it.
   *                      username: a String indicating the username
   *                      created: a Date indicating when the tweet was made
   *                      content: a String indicating the body of the tweet
   *                   }
   */
  var get_tweets_for_user = function(username, callback) {
    Tweet.find({"username": username}).sort("-created").exec(function(err, results) {
      if (err) throw err;
      if (results.length == 0) {
        callback(new Error("The username does not exist"));
      } else {
        callback(null, results);
      } // End else (i.e. the user exists).
    }); // End find tweets.
  }; // End get_tweets_for_user.

  /**
   * Gets all the tweets.
   *
   * @param callback - The callback to execute. It will be executed as callback(err, tweets). The
   *                   err object is null if there is no error. Otherwise, err is an Error object
   *                   The tweets is an array of objects of the form:
   *                   {
   *                      _id: a MongoDB ObjectId indicating the tweet id. To convert it to a 
   *                           String, you must call the toString() function on it.
   *                      username: a String indicating the username
   *                      created: a Date indicating when the tweet was made
   *                      content: a String indicating the body of the tweet
   *                   }
   */
  var get_tweets = function(callback) {
    Tweet.find({}).sort("-created").exec(function(err, results) {
      if (err) throw err;
      callback(null, results);
    }); // End find.
  }; // End get_tweets

  /**
   * Gets the tweet with the given id.
   *
   * @param tweet_id - The ID of the tweet to get.
   * @param callback - Called as callback(err, tweet).
   */
  var get_tweet_for_id = function(tweet_id, callback) {
    var tweet_object_id = new mongoose.Types.ObjectId(tweet_id);
    Tweet.find({"_id": tweet_object_id}, function(err, results) {
      if (err) throw err;
      if (results.length === 0) {
        callback(new Error("No tweet with the given ID"));
      } else {
        callback(null, results[0]);
      } // End else (i.e. the results are returned).
    }); // End find.
  } // End get_tweet_for_id.


  var that = {}; 
  that.get_tweets = get_tweets;
  that.make_tweet = make_tweet;
  that.edit_tweet = edit_tweet;
  that.delete_tweet = delete_tweet;
  that.get_tweets_for_user = get_tweets_for_user;
  return that;
}

module.exports.TweetManager = TweetManager;

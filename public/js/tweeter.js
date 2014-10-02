// This file defines the Tweeter class which interacts with the API for managing tweets.

(function() {
  var Tweeter = function(authenticator) {

    // This should be an Authenticator object.
    var _authenticator = authenticator;
    
    var tweet_for_id = {};

    /**
     * Makes a tweet.
     *
     * @param content - The content of the tweet.
     * @param callback - Called as callback(err, tweet) where err is an error, or null and tweet
     *                   is the tweet object that was made.
     */
    var make_tweet = function(content, callback) {
      $.post("/tweets/make", {  
        "session_id": $.cookie("session_id"),
        "tweet": content
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          callback(null, data.result);
        }
      });
    };

    /**
     * Return tweet for id (or undefined if the id does not exist).
     */
    var get_tweet_for_id = function(id) {
      return tweet_for_id[id];
    };

    /**
     * Given a tweet id, returns whether the tweet belongs to the current user.
     */
    var is_my_tweet = function(id) {
      if (tweet_for_id[id] === undefined) {
        return false;
      };
      if (_authenticator.get_username() === undefined) {
        return false;
      };
      return tweet_for_id[id].username === _authenticator.get_username();
    };

    /**
     * Gets all the tweets.
     * @param callback - Called as callback(err, results) where err is an error, or null, and 
     *                   results is an array of tweet objects.
     */
    var get_all_tweets = function(callback) {
      $.get("/tweets/all", function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error)
        } else {
          last_update_time = new Date(); 
          for (var i = 0; i < data.result.length; i++) {
            tweet_for_id[data.result[i]._id.toString()] = data.result[i];
          }
          callback(null, data.result);
        }
      });
    };

    var delete_tweet = function(tweet_id) {
      $.post("/tweets/delete", {
        "session_id": $.cookie("session_id"),
        "tweet_id": tweet_id
      }, function(data) {
        if (data.error) {
          console.log(data.error);
        }
      });
    };

    var edit_tweet = function(tweet_id, content) {
      $.post("/tweets/edit", {
        "session_id": $.cookie("session_id"),
        "tweet_id": tweet_id,
        "content": content
      }, function(data) {
        if (data.error) {
          console.log(data.error);
        }
      });
    };

    var that = {};
    that.make_tweet = make_tweet;
    that.get_tweet_for_id = get_tweet_for_id;
    that.get_all_tweets = get_all_tweets;
    that.is_my_tweet = is_my_tweet;
    that.delete_tweet = delete_tweet;
    that.edit_tweet = edit_tweet;
    return that;
  };

 Fritter.Tweeter = Tweeter; 
})();

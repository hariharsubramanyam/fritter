(function() {
  var Tweeter = function() {
    var last_update_time = null;

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
        if (data.error) {
          callback(error);
        } else {
          callback(null, data.result);
        }
      });
    };

    /**
     * Gets the latest tweets (i.e. the tweets that occured since this function was last called).
     * This is useful for long polling.
     *
     * @param callback - Called as callback(err, results) where err is an error, or null, and 
     *                   results is an array of tweet objects.
     */
    var get_latest_tweets = function(callback) {
      if (last_update_time === null) {
        $.get("/tweets/all", function(data) {
          data = JSON.parse(data);
          if (data.error) {
            callback(data.error)
          } else {
            last_update_time = new Date(); 
            callback(null, data.result);
          }
        });
      } else {
        $.get("/tweets/since/" + last_update_time.toString(), function(data) {
          data = JSON.parse(data);
          if (data.error) {
            callback(data.error);
          } else {
            last_update_time = new Date(); 
            callback(null, data.result);
          }
        });
      }
    }; 

    var that = {};
    that.make_tweet = make_tweet;
    that.get_latest_tweets = get_latest_tweets;
    return that;
  };

 Fritter.Tweeter = Tweeter; 
})();

(function() {
  var Tweeter = function() {
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
        console.log("data " + data);
        if (data.error) {
          callback(error);
        } else {
          callback(null, data.result);
        }
      });
    }
    var that = {};
    that.make_tweet = make_tweet;
    return that;
  };

 Fritter.Tweeter = Tweeter; 
})();

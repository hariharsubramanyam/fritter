// This file defines the TweetList class, which takes a Tweeter object and an unordered list
// (wrapped by jQuery). The class handles pulling data from the server and displaying, editing,
// making, and deleting tweets.
//
(function() {
  var TweetListCtrl = function(tweeter, ul) {
    // Object where the keys are the tweet ids (the values are all true).
    // We use an object because we can lookup keys in constant time.
    var tweet_for_id = {};

    // Add the tweet to the lsit of tweets.
    var add_to_list = function(tweet, just_made) {
      // Create the html for the tweet.
      var html = new EJS({"url": "/views/tweet_list_item_view.ejs"}).render({
        "tweeter": tweeter,
        "just_made": just_made,
        "tweet": tweet
      });
      html = $(html);

      // Set the tweet content.
      var tweet_content = html.find(".tweet-content");
      tweet_content.val("");
      tweet_content.val(tweet.content);
      if (just_made || tweeter.is_my_tweet(tweet._id.toString())) {
        // Add an edit and delete button if this is the current user's  tweet.
        var edit_button = html.find(".edit_tweet_button");
        var delete_button = html.find(".delete_tweet_button");
        delete_button.click(function() {
          html.remove();
          tweeter.delete_tweet(tweet._id.toString());
        });
        // Handle edit click.
        edit_button.click(function() {
          if (edit_button.text() === "Edit Tweet") {
            edit_button.text("Done");
            edit_button.removeClass("yellow-btn");
            edit_button.addClass("green-btn");
            tweet_content.removeClass("non-editable");
            tweet_content.addClass("editable");
            tweet_content.removeAttr("readonly");
          } else {
            tweeter.edit_tweet(tweet._id.toString(), tweet_content.val());
            edit_button.text("Edit Tweet");
            edit_button.addClass("yellow-btn");
            edit_button.removeClass("green-btn");
            tweet_content.addClass("non-editable");
            tweet_content.removeClass("editable");
            tweet_content.attr("readonly", "true");
          }
        });
      }
      ul.prepend(html);
    };

    /**
     * Makes an API call and updates the list of tweets.
     */
    var update_tweets = function() {
      tweeter.get_all_tweets(function(err, results) {
        if (err) {
          console.log(err);
        } else {
          // This will replace the tweet_for_id dictionary.
          var new_tweet_for_id = {};

          // If there are any tweets in the results that are not in the list, add them to the list.
          for (var i = 0; i < results.length; i++) {
            if (tweet_for_id[results[i]._id.toString()] === undefined) {
              add_to_list(results[i]);
            } else {
              // If the tweet is already in the list, see if it's been edited (and not currently
              // being edited). If so, then update the tweet already in the list.
              var tweet_list_item = $("#tweet"+results[i]._id.toString());
              var textarea = tweet_list_item.find(".tweet-content");
              var edit_button = tweet_list_item.find(".edit_tweet_button");
              if (textarea.val() !== results[i].content && edit_button.text() !== "Done") {
                textarea.val(results[i].content);
              }
            }

            // Add this tweet id to the dictionary.
            new_tweet_for_id[results[i]._id.toString()] = true;
          } // End iterate through results.

          // If there are any tweets in ul which are not in the results, remove them.
          for (var id in tweet_for_id) {
            if (new_tweet_for_id[id] === undefined) {
              $("#tweet" + id).remove();
            } // End if the tweet is undefined.
          } // End iterate through tweets in ul.

          // Replace the old dictionary with the new one.
          tweet_for_id = new_tweet_for_id;

        } // End else (i.e. no error).
      }); // End get_all_tweets.
    };

    /**
     * Make a tweet with the given content.
     */
    var make_tweet = function(content) {
      tweeter.make_tweet(content, function(err, tweet) {
        if (err) console.log(err);
        tweet_for_id[tweet._id.toString()] = true;
        add_to_list(tweet, true);
      });
    };

    // Make an initial call to update_tweets to populate the list.
    update_tweets();
    
    // Poll the server every second.
    var interval = setInterval(update_tweets, 1000);

    var that = {};
    that.make_tweet = make_tweet;
    return that;
  };
  Fritter.TweetListCtrl = TweetListCtrl;
})();

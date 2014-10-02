(function() {
  var TweetList = function(tweeter, ul) {
    // Tweet for id.
    var tweet_for_id = {};

    var add_to_list = function(result, is_mine) {
      var list_item = $("<li></li>");
      list_item.attr("id", "tweet"+result._id.toString());
      result.content = result.content.replace(/'/g, '&#39');
      var user_name = $("<span><strong>"+result.username+"</strong> </span>");
      var tweet_content = $("<textarea class='non-editable tweet-content' rows='1' cols='140'  type='text' readonly>" + result.content + "</textarea>");
      if (is_mine || tweeter.is_my_tweet(result._id.toString())) {
        var edit_button = $("<button class='btn btn-warning edit_tweet_button'>Edit</button>");
        var delete_button = $("<button class='btn btn-danger delete_tweet_button'>Delete</button>");
        delete_button.click(function() {
          $("#tweet"+result._id.toString()).remove();
          tweeter.delete_tweet(result._id.toString());
        });
        edit_button.click(function() {
          if (edit_button.text() === "Edit") {
            edit_button.text("Done");
            edit_button.removeClass("btn-warning");
            edit_button.addClass("btn-success");
            tweet_content.removeClass("non-editable");
            tweet_content.addClass("editable");
            tweet_content.removeAttr("readonly");
          } else {
            edit_button.text("Edit");
            edit_button.addClass("btn-warning");
            edit_button.removeClass("btn-success");
            tweet_content.addClass("non-editable");
            tweet_content.removeClass("editable");
            tweet_content.attr("readonly", "true");
          }
        });
        list_item.append(edit_button);
        list_item.append(delete_button);
      }
      list_item.append(user_name);
      list_item.append(tweet_content);
      ul.prepend(list_item);
    };
    var update_tweets = function() {
      tweeter.get_all_tweets(function(err, results) {
        if (err) {
          console.log(err);
        } else {
          var new_tweet_for_id = {};
          // If there are any tweets in the results that are not in the list, add them to the list.
          for (var i = 0; i < results.length; i++) {
            if (tweet_for_id[results[i]._id.toString()] === undefined) {
              add_to_list(results[i]);
            } // End result not in list.
            new_tweet_for_id[results[i]._id.toString()] = true;
          } // End iterate through results.

          // If there are any tweets in ul which are not in the results, remove it.
          for (var id in tweet_for_id) {
            if (new_tweet_for_id[id] === undefined) {
              $("#tweet" + id).remove();
            } // End if the tweet is undefined.
          } // End iterate through tweets in ul.
          tweet_for_id = new_tweet_for_id;
        } // End else (i.e. no error).
      }); // End get_all_tweets.
    }; // End update_tweets.

    var make_tweet = function(content) {
      tweeter.make_tweet(content, function(err, tweet) {
        if (err) console.log(err);
        tweet_for_id[tweet._id.toString()] = true;
        add_to_list(tweet, true);
      });
    };

    update_tweets();
    var interval = setInterval(update_tweets, 1000);
    var that = {};
    that.make_tweet = make_tweet;
    return that;
  }; // End TweetList.
  Fritter.TweetList = TweetList;
})();

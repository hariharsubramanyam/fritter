// This file defines the TweetList class, which takes a Tweeter object and an unordered list
// (wrapped by jQuery). The class handles pulling data from the server and displaying, editing,
// making, and deleting tweets.

(function() {
  var TweetList = function(tweeter, ul) {
    // Object where the keys are the tweet ids (the values are all true).
    // We use an object because we can lookup keys in constant time.
    var tweet_for_id = {};

    /**
     * Add the tweet to the unordered list (ul) of tweets.
     *
     * @param result - A tweet which is the result of an API call. It should look like:
     * {
     *  _id: the tweet id,
     *  content: the content of the tweet,
     *  username: the user who made the tweet,
     *  created: the creation date of the tweet (as a string).
     * }
     *
     * @param just_made - If true, this means that the tweet was just made and won't be in the list
     *                    already, so we'll need to add it.
     */
    var add_to_list = function(result, just_made) {
      
      // Create the list item.
      var list_item = $("<li></li>");

      // Set the id of the list item to include the tweet id (so if the tweet id is "123", the list
      // item would have an id of "tweet123").
      list_item.attr("id", "tweet"+result._id.toString());

      // Replace any single quotes with the unicode character. We need this becasue we'll be adding
      // it to an HTML string, and the single quote may end elements abruptly.
      result.content = result.content.replace(/'/g, '&#39');

      // Create the username.
      var user_name = $("<span><strong>"+result.username+"</strong> </span>");

      // Create the textarea which will display the tweet.
      var tweet_content = $("<textarea class='non-editable tweet-content' rows='1' cols='140'  "
          + "type='text' readonly>" 
          + result.content + "</textarea>");
      
      // If this a tweet created by the current user, we need to add an edit and delete button.
      if (just_made || tweeter.is_my_tweet(result._id.toString())) {

        // Create the button.
        var edit_button = $("<button class='btn btn-warning edit_tweet_button'>Edit</button>");
        var delete_button = $("<button class='btn btn-danger delete_tweet_button'>Delete</button>");
        
        // Handle delete click.
        delete_button.click(function() {
          $("#tweet"+result._id.toString()).remove();
          tweeter.delete_tweet(result._id.toString());
        });

        // Handle edit click.
        edit_button.click(function() {
          if (edit_button.text() === "Edit") {
            edit_button.text("Done");
            edit_button.removeClass("btn-warning");
            edit_button.addClass("btn-success");
            tweet_content.removeClass("non-editable");
            tweet_content.addClass("editable");
            tweet_content.removeAttr("readonly");
          } else {
            tweeter.edit_tweet(result._id.toString(), tweet_content.val());
            edit_button.text("Edit");
            edit_button.addClass("btn-warning");
            edit_button.removeClass("btn-success");
            tweet_content.addClass("non-editable");
            tweet_content.removeClass("editable");
            tweet_content.attr("readonly", "true");
          }
        });
        // Append the buttons to the list item.
        list_item.append(edit_button);
        list_item.append(delete_button);
      }
      // Append the username and tweet content to the list item and add the list item to the list.
      list_item.append(user_name);
      list_item.append(tweet_content);
      ul.prepend(list_item);
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
              var textarea = tweet_list_item.find("textarea");
              var edit_button = tweet_list_item.find(".edit_tweet_button");
              if (textarea.text() !== results[i].content && edit_button.text() !== "Done") {
                textarea.text(results[i].content);
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
    }; // End update_tweets.

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
  }; // End TweetList.
  Fritter.TweetList = TweetList;
})();

// This file is the controller (i.e. the C in MVC) for index.html.
// index.html allows users to regster/login, make tweets, edit/delete tweets, view tweets, 
// and logout.

(function() {
  // The heading which displays the username.
  var h_username;

  // The object that performs authentication.
  var authenticator = Fritter.Authenticator();

  // The object that communicates with the API for making, editing, and deleting tweets.
  var tweeter = Fritter.Tweeter(authenticator);

  var follow_manager = Fritter.FollowManager();

  // Updates the list of tweets from the server.
  var tweet_list;

  var btn_follow;
  var btn_messages;

  var num_followers;
  var num_followed;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLoginCtrl(authenticator, callback);
      }, 
      setup_variables,
      setup_views,
      set_username,
      count_followers,
      count_followed,
      set_follow_followed_header,
      count_followers,
      count_followed,
      set_follow_followed_header
    ]); // End async series.
  }); // End document ready.

  var count_followers = function(callback) {
    follow_manager.get_followers(function(err, results) {
      if (err) console.log(err);
      num_followers = results.length;
      callback(null);
    });
  };

  var count_followed = function(callback) {
    follow_manager.get_followed(function(err, results) {
      if (err) console.log(err);
      num_followed = results.length;
      callback(null);
    });
  };

  var set_follow_followed_header = function(callback) {
    btn_follow.text(num_followers + " Follower(s) / " + num_followed + " Followed");
    callback(null);
  };

  /**
   * Display the username in h_username.
   */
  var set_username = function(callback) {
    h_username.text("Welcome, " + authenticator.get_username());
    callback(null);
  };

  /**
   * Initialize the variables with their respective DOM elements.
   */
  var setup_variables = function(callback) {
    btn_logout = $("#btn_logout");
    p_alert = $("#p_alert");
    div_tweet_alert = $("#div_tweet_alert");
    h_username = $("#h_username");
    btn_follow = $("#btn_follow");
    btn_messages = $("#btn_messages");
    callback(null);
  }; 

  /**
   * Setup handlers for UI elements.
   */
  var setup_views = function(callback) {
    // Create the TweetList object to handle putting tweets into the list.
    tweet_list = Fritter.TweetListCtrl(tweeter, $("#tweet_list"));
    Fritter.MakeTweetCtrl(tweeter, tweet_list, $("#div_make_tweet"));
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    Fritter.UnreadMessageListener(function(unread_count) {
      btn_messages.addClass("yellow-btn");
      if (unread_count === 1) {
        btn_messages.text("1 Unread Message");
      } else {
        bt_.messages.text(unread_count + " Unread Messages");
      }
    });
    btn_follow.click(function() {
      window.location.href = "/views/follow_page.html";
    });
    btn_messages.click(function() {
      window.location.href = "/views/messages.html";
    });
    callback(null);
  };
})(); // End closure.

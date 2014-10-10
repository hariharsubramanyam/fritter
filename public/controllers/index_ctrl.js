/*
 * This file is the controller for index.html.
 * index.html allows users to regster/login, make tweets, edit/delete tweets, view tweets, 
 * and logout.
 */

(function() {
  // The heading which displays the username.
  var h_username;

  // Communicates with the authentication API.
  var authenticator = Fritter.Authenticator();

  // Communicates with the tweet API.
  var tweeter = Fritter.Tweeter(authenticator);

  // Communicates with the following API.
  var follow_manager = Fritter.FollowManager();

  // Renders tweets in a ul.
  var tweet_list;

  // Takes us to the follow page.
  var btn_follow;

  // Takes us to the messages page.
  var btn_messages;

  // The number of followers of this user.
  var num_followers;
  
  // The number of users this user follows.
  var num_followed;

  $(document).ready(function() {
    async.series([
      function(callback) {
        // If the user is not authenticated, take them to the login page.
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
    ]); 
  });

  /**
   * Makes an API call and gets the number of followers.
   */
  var count_followers = function(callback) {
    follow_manager.get_followers(function(err, results) {
      if (err) console.log(err);
      num_followers = results.length;
      callback(null);
    });
  };

  /**
   * Makes an API call and gets the number of users this user follows.
   */
  var count_followed = function(callback) {
    follow_manager.get_followed(function(err, results) {
      if (err) console.log(err);
      num_followed = results.length;
      callback(null);
    });
  };

  /**
   * Make the follow button display the number of followers and followed.
   */
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

    // UI controls for making tweets.
    Fritter.MakeTweetCtrl(tweeter, tweet_list, $("#div_make_tweet"));

    // Logout functionality.
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));

    // Whenever there is an unread message, color the messages button yellow and indicate
    // that there is an unread message.
    Fritter.UnreadMessageListener(function(unread_count) {
      btn_messages.addClass("yellow-btn");
      if (unread_count === 1) {
        btn_messages.text("1 Unread Message");
      } else {
        bt_.messages.text(unread_count + " Unread Messages");
      }
    });

    // Take us to the follow page.
    btn_follow.click(function() {
      window.location.href = "/views/follow_page.html";
    });

    // Take us to the messages page.
    btn_messages.click(function() {
      window.location.href = "/views/messages.html";
    });
    callback(null);
  };
})(); 

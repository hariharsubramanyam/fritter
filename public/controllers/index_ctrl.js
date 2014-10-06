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

  // Updates the list of tweets from the server.
  var tweet_list;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLoginCtrl(authenticator, callback);
      }, 
      setup_variables,
      setup_views,
      set_username
    ]); // End async series.
  }); // End document ready.

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
    callback(null);
  };
})(); // End closure.

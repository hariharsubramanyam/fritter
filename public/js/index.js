// This file is the controller (i.e. the C in MVC) for index.html.
// index.html allows users to regster/login, make tweets, edit/delete tweets, view tweets, 
// and logout.

(function() {

    // The button which should be clicked to logout.
    var btn_logout;

    // The heading which displays the username.
    var h_username;

    // The interval at which the server is polled for new updates.
    var update_interval;

    // The object that performs authentication.
    var authenticator = Fritter.Authenticator();

    // The object that communicates with the API for making, editing, and deleting tweets.
    var tweeter = Fritter.Tweeter(authenticator);

    var tweet_maker;

    var logout_button;

    // The object that puts the tweets into lst_tweets (it is initialized in setup_handlers).
    var tweet_list;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLogin(authenticator, callback);
      }, 
      setup_variables,
      setup_handlers,
      set_username
    ]); // End async series.
  }); // End document ready.

  /**
   * Display the username in h_username.
   */
  var set_username = function(callback) {
    h_username.text(authenticator.get_username());
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
    div_tweet_alert.css("visibility", "hidden");
    callback(null);
  }; 

  /**
   * Setup handlers for UI elements.
   */
  var setup_handlers = function(callback) {
    // Create the TweetList object to handle putting tweets into the list.
    tweet_list = new Fritter.TweetList(tweeter, $("#tweet_list"));
    tweet_maker = Fritter.TweetMaker(tweeter, $("#div_make_tweet"), tweet_list);
    logout_button = Fritter.LogoutButton(authenticator, $("#div_logout_button"));
    callback(null);
  };
})(); // End closure.

// This file is the controller (i.e. the C in MVC) for index.html.
// index.html allows users to regster/login, make tweets, edit/delete tweets, view tweets, 
// and logout.

(function() {

    // The button which should be clicked to logout.
    var btn_logout;

    // The modal window for login and registering.
    var login_modal;

    // The list of the tweets.
    var lst_tweets;

    // The heading which displays the username.
    var h_username;

    // The interval at which the server is polled for new updates.
    var update_interval;

    // The object that performs authentication.
    var authenticator = Fritter.Authenticator();

    // The object that communicates with the API for making, editing, and deleting tweets.
    var tweeter = Fritter.Tweeter(authenticator);

    var tweet_maker;

    // The object that puts the tweets into lst_tweets (it is initialized in setup_handlers).
    var tweet_list;

  $(document).ready(function() {
    async.series([
      authenticate,
      setup_variables,
      setup_handlers,
      set_username
    ]); // End async series.
  }); // End document ready.

  var authenticate = function(callback) {
    authenticator.has_session_id(function(has_session_id) {
      if (has_session_id) {
        // Show the body if the user hash authenticated.
        $("body").css("visibility", "visible");
        callback(null);
      } else {
        window.location.href = "/html/login.html";
      };
    });
  };

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
    lst_tweets = $("#tweet_list");
    h_username = $("#h_username");
    div_tweet_alert.css("visibility", "hidden");
    callback(null);
  }; 

  /**
   * Setup handlers for UI elements.
   */
  var setup_handlers = function(callback) {
    // Create the TweetList object to handle putting tweets into the list.
    tweet_list = new Fritter.TweetList(tweeter, lst_tweets);
    tweet_maker = Fritter.TweetMaker(tweeter, $("#div_make_tweet"), tweet_list);

    // Handle logout.
    btn_logout.click(function(e) {
      authenticator.logout(function(err) {
        if (err) {
          console.log(err);
        } else {
          window.location.href = "/html/login.html";
        }
      });
    });

    callback(null);
  };
})(); // End closure.

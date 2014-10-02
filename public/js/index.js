// This file is the controller (i.e. the C in MVC) for index.html.
// index.html allows users to regster/login, make tweets, edit/delete tweets, view tweets, 
// and logout.

(function() {

    // The text field which contains the username for registration.
    var reg_username;

    // The text field which contains the password for registration.
    var reg_password;

    // The text field which contains the password (re-entered) for registration.
    var reg_confirm_password;

    // The button which should be clicked to register.
    var btn_register;

    // The text field which contains the username for login.
    var log_username;

    // The text field which contains the password for login.
    var log_password;

    // The button which should be clicked to login.
    var btn_login;

    // The button which should be clicked to logout.
    var btn_logout;

    // The paragrah which displays the alert message for the modal window.
    var p_alert;
    
    // The div which displays the alert for the modal window.
    var div_alert; 

    // The paragraph which displays the alert message for the "Make Tweet" button.
    var p_tweet_alert;

    // The div which displays the alert for the "Make Tweet" button.
    var div_tweet_alert; 

    // The modal window for login and registering.
    var login_modal;

    // The timeout for the alert messages in the modal window.
    var modal_alert_timeout;

    // The timeout for the alert messages for the "Make Tweet" button.
    var tweet_alert_timeout;

    // The text area for composing a tweet.
    var txt_tweet;

    // The button which makes the tweet. 
    var btn_make_tweet;

    // The list of the tweets.
    var lst_tweets;

    // The heading which displays the username.
    var h_username;

    // The interval at which the server is polled for new updates.
    var update_interval;

    // The object that performs authentication.
    var authenticator = new Fritter.Authenticator();

    // The object that communicates with the API for making, editing, and deleting tweets.
    var tweeter = new Fritter.Tweeter(authenticator);

    // The object that puts the tweets into lst_tweets (it is initialized in setup_handlers).
    var tweet_list;

  $(document).ready(function() {
    async.series([
      setup_variables,
      display_modal_if_needed,
      setup_handlers,
      set_username,
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
    reg_username = $("#reg_username");
    reg_password = $("#reg_password");
    reg_confirm_password = $("#reg_confirm_password");
    btn_register = $("#btn_register");
    log_username = $("#log_username");
    log_password = $("#log_password");
    btn_login = $("#btn_login");
    btn_logout = $("#btn_logout");
    p_alert = $("#p_alert");
    div_alert = $("#div_alert");
    p_tweet_alert= $("#p_tweet_alert");
    div_tweet_alert = $("#div_tweet_alert");
    txt_tweet = $("#txt_tweet");
    txt_tweet.val("");
    btn_make_tweet = $("#btn_make_tweet");
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

    // Handle logout.
    btn_logout.click(function(e) {
      authenticator.logout(function(err) {
        if (err) {
          console.log(err);
        } else {
          window.location.reload();
        }
      });
    });

    // Handle making a tweet.
    btn_make_tweet.click(function(e) {
      var tweet = txt_tweet.val();
      if (tweet.length > 140) {
        display_tweet_alert("You need to remove " + (tweet.length - 140) + 
          " characters before you can tweet this!");
      } else {
        tweet_list.make_tweet(txt_tweet.val());
        txt_tweet.val("");
      }
    });
    callback(null);
  };

  /**
   * Display an alert message above the txt_tweet textarea (i.e. the textbox in which you compose
   * tweets).
   */
  var display_tweet_alert = function(message) {
    p_tweet_alert.text(message);
    clearTimeout(tweet_alert_timeout);
    div_tweet_alert.css("visibility", "visible");
    tweet_alert_timeout = setTimeout(function() {
      div_tweet_alert.css("visibility", "hidden");
    }, 5000);
  };

  /**
   * Display an alert in the modal window.
   */
  var display_modal_alert = function(message) {
    p_alert.text(message);
    clearTimeout(modal_alert_timeout);
    div_alert.css("visibility", "visible");
    modal_alert_timeout = setTimeout(function() {
      div_alert.css("visibility", "hidden");
    }, 5000);
  };

  /**
   * Attempt to validate the user's session id. If that fails, display the modal so that the
   * user can login or register.
   */
  var display_modal_if_needed = function(callback) {
    authenticator.has_session_id(function(has_session_id) {
      if (has_session_id) {
        // If the session_id is valid, we don't need to display the modal.
        callback(null);;
      } else {
        // Display the modal and hide the alerts.
        $("#loginModal").modal({keyboard: false, backdrop: 'static'});
        div_alert.css("visibility", "hidden");

        // Handler for register.
        btn_register.click(function() { 
          var username = reg_username.val();
          var password = reg_password.val();
          var confirm_password = reg_confirm_password.val();
          if (password !== confirm_password) {
            display_modal_alert("The passwords do not match");
          } else {
            authenticator.register(username, password, function(err, session_id) {
              if (err) {
                display_modal_alert(err);
              } else {
                $("#loginModal").modal("hide");
                callback(null);
              } // end else (no error);
            }); // End register.
          } // End else (i.e. usernames and passwords are good).
        }); // End register click handler.

        // Handler for login.
        btn_login.click(function() {
          var username = log_username.val();
          var password = log_password.val();
          authenticator.login(username, password, function(err, session_id) {
            if (err) {
              display_modal_alert(err);
            } else {
                $("#loginModal").modal("hide");
                callback(null);
            } // End else (no error).
          }); // End login.
        }); // End login click handler.
      } // End else (i.e. there is no session id)
    }); // End has_session_id
  }; // End display_modal_if_needed
})(); // End closure.

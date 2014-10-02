(function() {
    var reg_username;
    var reg_password;
    var reg_confirm_password;
    var btn_register;
    var log_username;
    var log_password;
    var btn_login;
    var btn_logout;
    var p_alert;
    var div_alert; 
    var login_modal;
    var modal_alert_timeout;
    var txt_tweet;
    var btn_make_tweet;
    var lst_tweets;
    var h_username;
    var update_interval;
    var tweet_id_under_edit;
    var authenticator = new Fritter.Authenticator();
    var tweeter = new Fritter.Tweeter(authenticator);
    var tweet_list;

  $(document).ready(function() {
    async.series([
      setup_variables,
      display_modal_if_needed,
      setup_handlers,
      set_username,
    ]); // End async series.
  }); // End document ready.

  var set_username = function(callback) {
    h_username.text(authenticator.get_username());
    callback(null);
  };


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
    txt_tweet = $("#txt_tweet");
    txt_tweet.val("");
    btn_make_tweet = $("#btn_make_tweet");
    lst_tweets = $("#tweet_list");
    h_username = $("#h_username");
    callback(null);
  }; 

  var editable_tweet = function(button, input) {
    button.text("Done");
    input.removeClass("non-editable");
    button.removeClass("btn-warning");
    input.addClass("editable");
    button.addClass("btn-success");
    input.removeAttr("readonly");
  };

  var noneditable_tweet = function(button, input) {
    button.text("Edit");
    input.addClass("non-editable");
    button.addClass("btn-warning");
    input.removeClass("editable");
    button.removeClass("btn-success");
    input.attr("readonly");
  };

  var setup_handlers = function(callback) {
    tweet_list = new Fritter.TweetList(tweeter, lst_tweets);
    btn_logout.click(function(e) {
      authenticator.logout(function(err) {
        if (err) {
          console.log(err);
        } else {
          window.location.reload();
        }
      });
    });

    btn_make_tweet.click(function(e) {
      tweet_list.make_tweet(txt_tweet.val());
      txt_tweet.val("");
    });
    callback(null);
  };

  var display_modal_alert = function(message) {
    p_alert.text(message);
    clearTimeout(modal_alert_timeout);
    div_alert.css("visibility", "visible");
    modal_alert_timeout = setTimeout(function() {
      div_alert.css("visibility", "hidden");
    }, 5000);
  };

  var display_modal_if_needed = function(callback) {
    authenticator.has_session_id(function(has_session_id) {
      if (has_session_id) {
        callback(null);;
      } else {
        $("#loginModal").modal({keyboard: false, backdrop: 'static'});
        div_alert.css("visibility", "hidden");

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

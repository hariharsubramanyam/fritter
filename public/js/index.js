(function() {
    var reg_username;
    var reg_password;
    var reg_confirm_password;
    var btn_register;
    var log_username;
    var log_password;
    var btn_login;
    var p_alert;
    var div_alert; 
    var login_modal;
    var modal_alert_timeout;
    var txt_tweet;
    var btn_make_tweet;
    var authenticator = new Fritter.Authenticator();

  $(document).ready(function() {
    async.series([
      setup_variables,
      display_modal_if_needed,
      function(callback) {
        console.log("done!")
      } // 
    ]); // End async series.
  }); // End document ready.


  var setup_variables = function(callback) {
    reg_username = $("#reg_username");
    reg_password = $("#reg_password");
    reg_confirm_password = $("#reg_confirm_password");
    btn_register = $("#btn_register");
    log_username = $("#log_username");
    log_password = $("#log_password");
    btn_login = $("#btn_login");
    p_alert = $("#p_alert");
    div_alert = $("#div_alert");
    txt_tweet = $("#txt_tweet");
    txt_tweet.val("");
    btn_make_tweet = $("#btn_make_tweet");
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
        console.log("has session_id");
        callback(null);;
      } else {
        $("#loginModal").modal({keyboard: false, backdrop: 'static'});
        div_alert.css("visibility", "hidden");
        btn_register.click(function() { 
          var username = reg_username.val();
          var password = reg_password.val();
          var confirm_password = reg_confirm_password.val();
          if (username.length < 5) {
            display_modal_alert("The username must be 5 or more characters!");
          } else if (password.length < 5) {
            display_modal_alert("The password must be at least 5 characters");
          } else if (password !== confirm_password) {
            display_modal_alert("The passwords do not match");
          } else {
            authenticator.register(username, password, function(err, session_id) {
              if (err) {
                display_modal_alert(err.message);
              } else {
                $("#loginModal").modal("hide");
                callback(null);
              } // end else (no error);
            }); // End register.
          } // End else (i.e. usernames and passwords are good).
        }); // End register click handler.
      } // End else (i.e. there is no session id)
    }); // End has_session_id
  }; // End display_modal_if_needed

/**
  $(document).ready(function() {
    var register_form = $("#register_form");
    var reg_username = $("#reg_username");
    var reg_password = $("#reg_password");
    var reg_confirm_password = $("#reg_confirm_password");
    var btn_register = $("#btn_register");
    var log_username = $("#log_username");
    var log_password = $("#log_password");
    var btn_login = $("#btn_login");
    var p_alert = $("#p_alert");
    var div_alert = $("#div_alert");
    var authenticator = new Fritter.Authenticator();
    $.get("/html/login_modal.html", function(data) {
      console.log(data);
    });

    var show_alert = function(message) {
      p_alert.text(message);
      div_alert.hide();
      div_alert.show();
      setTimeout(hide_alert, 3000);
    };

    var hide_alert = function() {
      div_alert.fadeOut();
    }

    btn_register.click(function(e) {
      var username = reg_username.val();
      var password = reg_password.val();
      var confirm_password = reg_confirm_password.val();
      e.preventDefault();
      if (username.length < 5) {
        show_alert("The username must be more than 5 characters");
      } else if (password.length < 5) {
        show_alert("The password must be at least 5 characters");
      } else if (password !== confirm_password) {
        show_alert("The passwords do not match");
      } else {
        $.get("/api/user_exists/" + username, function(data) {
          console.log(data.result);
          if (data.result.does_exist) {
            show_alert("The username is already taken, please pick another one");
          } else {
            register_form.submit();
          } // End else (i.e. submit the form).
        }); // End user_exists callback
      } // End else (i.e. the username and passwords are correctly formatted)
    }); // End register button click.

    btn_login.click(function(e) {
      var username = log_username.val();
      var password = log_password.val();
      e.preventDefault();
       
    });

  }); // End document ready.
  */
})(); // End closure.

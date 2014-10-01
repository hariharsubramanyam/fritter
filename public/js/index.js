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


  var setup_variables= function(callback) {
    reg_username = $("#reg_username");
    reg_password = $("#reg_password");
    reg_confirm_password = $("#reg_confirm_password");
    btn_register = $("#btn_register");
    log_username = $("#log_username");
    log_password = $("#log_password");
    btn_login = $("#btn_login");
    p_alert = $("#p_alert");
    div_alert = $("#div_alert");
    callback(null);
  }; 

  var display_modal_if_needed = function(callback) {
    authenticator.has_session_id(function(has_session_id) {
      if (has_session_id) {
        console.log("has session_id");
        callback(null);;
      } else {
        $("#loginModal").modal({keyboard: false, backdrop: 'static'});
      }
    });
  };

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

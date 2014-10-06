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

  // The paragraph which displays the alert message. 
  var p_alert;
  
  // The div which displays the alert.
  var div_alert; 

  // The timeout for the alert messages.
  var alert_timeout;

  // The object that performs authentication.
  var authenticator = new Fritter.Authenticator();

  $(document).ready(function() {
    async.series([
      setup_variables,
      setup_handlers
    ]);
  });

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
    p_alert = $("#p_alert");
    div_alert = $("#div_alert");

    // Initially hide the alert.
    div_alert.css("visibility", "hidden");
    callback(null);
  }; 

  var setup_handlers = function(callback) {
    btn_login.click(btn_login_handler);
    btn_register.click(btn_register_handler);
    callback(null);
  };

  var btn_login_handler = function() {
      var username = log_username.val();
      var password = log_password.val();
      authenticator.login(username, password, function(err, session_id) {
        if (err) {
          display_alert(err);
        } else {
          successful_auth();
        }
      });
  };

  var btn_register_handler = function() {
    var username = reg_username.val();
    var password = reg_password.val();
    var confirm_password = reg_confirm_password.val();
    if (password !== confirm_password) {
      display_alert("The passwords do not match");
    } else {
      authenticator.register(username, password, function(err, session_id) {
        if (err) {
          display_alert(err);
        } else {
          successful_auth();
        } // end else (no error);
      }); // End register.
    } // End else (i.e. usernames and passwords are good).
  };

  var display_alert = function(message) {
    p_alert.text(message);
    clearTimeout(alert_timeout);
    div_alert.css("visibility", "visible");
    alert_timeout = setTimeout(function() {
      div_alert.css("visibility", "hidden");
    }, 5000);
  };

  var successful_auth = function() {
    window.location.href = "/";
  };
})();

(function() {
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

    var show_alert = function(message) {
      p_alert.text(message);
      div_alert.hide();
      div_alert.show();
      setTimeout(hide_alert, 3000);
    };

    var hide_alert = function() {
      div_alert.fadeOut();
    }

    register_form.submit(function(e) {
      var username = reg_username.val();
      var password = reg_password.val();
      var confirm_password = reg_confirm_password.val();
      if (username.length < 5) {
        show_alert("The username must be more than 5 characters");
        e.preventDefault();
      } else if (password.length < 5) {
        show_alert("The password must be at least 5 characters");
        e.preventDefault();
      } else if (password !== confirm_password) {
        show_alert("The passwords do not match");
        e.preventDefault();
      }
    });
  });
})();

(function() {
  $(document).ready(function() {
    var reg_username = $("#reg_username");
    var reg_password = $("#reg_password");
    var reg_confirm_password = $("#reg_confirm_password");
    var btn_register = $("#btn_register");
    var log_username = $("#log_username");
    var log_password = $("#log_password");
    var btn_login = $("#btn_login");

    btn_register.click(function(e) {
      console.log(reg_password.val());
    });
  });
})();

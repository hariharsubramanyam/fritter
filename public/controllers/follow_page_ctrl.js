(function() {

  var authenticator = Fritter.Authenticator();
  var tweeter = Fritter.Tweeter(authenticator);

  var btn_home;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLoginCtrl(authenticator, callback);
      },
      setup_variables,
      setup_views
    ]);
  });

  var setup_variables = function(callback) {
    btn_home = $("#btn_home");
    callback(null);
  };

  var setup_views = function(callback) {
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    btn_home.click(function() {
      window.location.href = "/";
    });
    callback(null);
  };

})();

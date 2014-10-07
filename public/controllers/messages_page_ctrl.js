(function() {
  var authenticator = Fritter.Authenticator();
  var tweeter = Fritter.Tweeter(authenticator);
  var follow_manager = Fritter.FollowManager();

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
    callback(null);
  };

  var setup_views = function(callback) {
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    callback(null);
  };

})();

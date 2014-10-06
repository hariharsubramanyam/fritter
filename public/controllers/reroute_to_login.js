(function() {
  var RouteToLogin = function(authenticator, callback) {
    authenticator.has_session_id(function(has_session_id) {
      if (has_session_id) {
        // Show the body if the user hash authenticated.
        $("body").css("visibility", "visible");
        callback(null);
      } else {
        window.location.href = "/views/login.html";
      };
    });
    var that = {};
    return that;
  };

  Fritter.RouteToLogin = RouteToLogin;
})();

/**
 * This controller checks if the user is authenticated. If not, it will take the user to the
 * login page.
 */
(function() {
  var RouteToLoginCtrl = function(authenticator, callback) {
    // Check if the session_id is valid.
    authenticator.has_session_id(function(has_session_id) {
      if (has_session_id) {
        // Show the body if the user hash authenticated.
        $("body").css("visibility", "visible");
        callback(null);
      } else {
        // If the session_id is not valid, take the user to the login page.
        window.location.href = "/views/login_page.html";
      };
    });
  };

  Fritter.RouteToLoginCtrl = RouteToLoginCtrl;
})();

(function() {
  var Authenticator = function() {
    /**
     * Determines if we have a valid session id.
     *
     * @param callback - Executed as callback(has_session_id).
     */
    var has_valid_session(callback) {
      var session_id = $.cookie("session_id");
      if (sesion_id === undefined) {
        callback(false);
      } else {
        $.get("/
      }
    }
  }; // End Authenticator class.
})(); // End closure.

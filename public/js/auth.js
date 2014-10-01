(function() {
  var Authenticator = function() {
    /**
     * Determines if we have a valid session id.
     *
     * @param callback - Executed as callback(has_session_id).
     */
    var has_valid_session = function(callback) {
      var session_id = $.cookie("session_id");
      if (session_id === undefined) {
        callback(false);
      } else {
        $.post("/auth/validate_session", {
          "session_id": session_id 
        }, function(data) {
          data = JSON.parse(data);
          if (data.err) {
            console.log(data.err);
          } else {
            callback(data.result);
          } // End else (i.e. no error)
        }); // End async call.
      } // End else (i.e. the session_id is valid)
    }; // End has_valid_session.

    /**
     * Attempts to register the user.
     *
     * @param username
     * @param password
     * @param callback - Executed as callback(err, session_id) where err is either null or
     *                   an object of the form {reason: <number>, message: <string>}
     */
    var register = function(username, password, callback) {
      $.post("/auth/register", {
        "username": username,
        "password": password
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          console.log("Here I am");
          callback(data.error);
        } else {
          $.cookie("session_id", data.result);
          callback(null, data.result);
        } // End else (i.e. the user was created with a session id)
      }); // End post call.
    }; // End register.

    /**
     * Attempts to login the user.
     *
     * @param username
     * @param password
     * @param callback - Executed as callback(err, session_id) where err is either null or
     *                   an object of the form {reason: <number>, message: <string>}
     */
    var login = function(username, password, callback) {
      $.post("/auth/login", {
        "username": username,
        "password": password
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          $.cookie("session_id", data.result);
          callback(null, data.result);
        } // End else (i.e. the user was created with a session id)
      }); // End post call.
    }; // End register.

    var that = {};
    that.has_session_id= has_valid_session;
    that.register = register;
    that.login = login;
    return that;
  }; // End Authenticator class.

  Fritter.Authenticator = Authenticator;
})(); // End closure.

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
        $.post("/api/is_valid_session", {
          "session_id": session_id 
        }, function(data) {
          if (data.err) {
            console.log(data.err);
          } else {
            callback(data.result.is_valid);
          } // End else (i.e. no error)
        }); // End async call.
      } // End else (i.e. the session_id is valid)
    }; // End has_valid_session.

    /**
     * Determines if the user exists.
     *
     * @param username - The username to check for existance.
     * @param callback - Executed as callback(does_user_exist).
     */
    var does_user_exist = function(username, callback) {
      $.get("/api/user_exists/" + username, function(data) {
        if (data.err) {
          console.log(data.error);
        } else {
          callback(data.result.does_exist);
        } // End else (i.e. there is no error).
      }); // End async call.
    }; // End does_user_exist.

    /**
     * Attempts to register the user.
     *
     * @param username
     * @param password
     * @param callback - Executed as callback(err, session_id) where err is either null or
     *                   an object of the form {reason: <number>, message: <string>}
     */
    var register = function(username, password, callback) {
      $.post("/api/register", {
        "username": username,
        "password": password
      }, function(data) {
        if (data.error) {
          callback(data.error);
        } else {
          $.cookie("session_id", data.result.session_id);
          callback(null, data.result.session_id);
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
      $.post("/api/login", {
        "username": username,
        "password": password
      }, function(data) {
        if (data.error) {
          callback(data.error);
        } else {
          $.cookie("session_id", data.result.session_id);
          callback(null, data.result.session_id);
        } // End else (i.e. the user was created with a session id)
      }); // End post call.
    }; // End register.

    var that = {};
    that.has_session_id= has_valid_session;
    that.does_user_exist = does_user_exist;
    that.register = register;
    that.login = login;
    return that;
  }; // End Authenticator class.

  Fritter.Authenticator = Authenticator;
})(); // End closure.

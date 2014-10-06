// This file creates the Authenticator class, which communicates with the backend API to do
// authentication.

(function() {
  var Authenticator = function() {
    /**
     * The username of the current user. This can be determined in one of three methods:
     * 1) A successful login.
     * 2) A successful registration.
     * 3) A successful lookup of a session_id.
     */
    var _username;

    /**
     * Determines if the session_id (stored as a cookie) is valid.
     *
     * @param callback - Executed as callback(has_session_id).
     */
    var has_session_id = function(callback) {
      var session_id = $.cookie("session_id");
      if (session_id === undefined) {
        callback(false);
      } else {
        $.post("/auth/validate_session", {
          "session_id": session_id 
        }, function(data) {
          data = JSON.parse(data);
          if (data.error) {
            callback(false);
          } else {
            _username = data.result;
            callback(true);
          } // End else (i.e. no error)
        }); // End async call.
      } // End else (i.e. the session_id is valid)
    }; // End has_session_id.

    /**
     * Attempts to register the user.
     *
     * @param username
     * @param password
     * @param callback - Executed as callback(err, session_id) where err is either null or
     *                   an error message.
     */
    var register = function(username, password, callback) {
      $.post("/auth/register", {
        "username": username,
        "password": password
      }, function(data) {
        data = JSON.parse(data);
        _username = username;
        if (data.error) {
          callback(data.error);
        } else {
          $.cookie("session_id", data.result, {"expires": 7, "path": "/"});
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
     *                   an error message.
     */
    var login = function(username, password, callback) {
      $.post("/auth/login", {
        "username": username,
        "password": password
      }, function(data) {
        data = JSON.parse(data);
        _username = username;
        if (data.error) {
          callback(data.error);
        } else {
          $.cookie("session_id", data.result, {"expires": 7, "path": "/"});
          callback(null, data.result);
        } // End else (i.e. the user was created with a session id)
      }); // End post call.
    }; // End register.

    /**
     * Attempts to logout the user.
     *
     * @param callback - Executed as callback(err) where err is either null or an error message.
     */
    var logout = function(callback) {
      var session_id = $.cookie("session_id");
      $.post("/auth/logout", {
        "session_id": session_id
      }, function(data) {
        if (data.error) {
         callback(data.error); 
        } else {
          $.removeCookie("session_id");
          callback(null);
        } // End else (i.e. the user successfully logged out)
      }); // End post call.
    }; // End logout.

    /**
     * Return the username of the user. If the user has not done any of the following...
     * 1) Logged in.
     * 2) Registered.
     * 3) Validated their session_id.
     *
     * ...then the method will return undefined.
     */
    var get_username = function() {
      return _username;
    };

    var that = {};
    that.has_session_id = has_session_id;
    that.register = register;
    that.login = login;
    that.logout = logout;
    that.get_username = get_username;
    return that;
  }; // End Authenticator class.

  Fritter.Authenticator = Authenticator;
})(); // End closure.

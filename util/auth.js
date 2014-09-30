var constants = require("../models/constants")
var bcrypt = require("bcrypt");
var session_model = require("../models/session");
var Session = session_model.Session;
var user_auth = require("../models/user_auth");
var UserAuth = user_auth.UserAuth;

/**
 * The AuthManager class contains methods for registering and authenticating users and managing
 * sessions.
 *
 * @param mongoose - The Mongoose module for connecting to MongoDB. It should already be connected.
 * @param salt - The salt value to use for hashing.
 */
var AuthManager = function(mongoose, salt) {

  /**
   * Attempt to register a new user. Look them up in the database to ensure that their username
   * has not already been used. If it hasn't, then add their username and hashed password into
   * the database.
   *
   * @param username - The desired username for this new user.
   * @param password - The desired password for this new user.
   * @param callback - The callback to execute after the user has been created. It will be called
   *                   as callback(err, session_id), where session_id is a String indicating the 
   *                   session id that the user has received. The err is an Error object (or null
   *                   if there are no errors). If the error object is not null, then the function
   *                   has failed because the username already exists.
   */
  var register_user = function(username, password, callback) {
    // Check if the username exists.
    UserAuth.find({"username": username}, function(err, results) {
      if (err) throw err;

      // If the name exists, return an error.
      if (results.length > 0) {
        callback(new Error("The username already exists!"));
      } else {
        // Generate a password.
        bcrypt.hash(password, constants.SALT, function(err, hash_password) {
          if (err) throw err;

          var new_user = new UserAuth({
            "username": username,
            "hash_password": hash_password
          }); // End new_user.

          new_user.save(function(err, result) {
            if (err) throw err;
            create_session(username, callback);
          }); // End save user auth.

        }); // End generate hash password.
      } // End if results.length > 0.
    }); // End find.
  }; // End register_user.

  /**
   * Attempt to login the user. Look them up in the database and ensure that they exist
   * and that the hashed password is correct.
   *
   * @param username - The username to search for in the database.
   * @param password - The password for the user. We hash it and ensure that it matches the entry
   *                   in the database.
   * @param callback - The callback to execute after the user has been created. It will be called
   *                   as callback(err, session_id), where session_id is a String indicating the 
   *                   session id that the user has received. The err is an Error object (or null
   *                   if there are no errors). The err object has the following structure:
   *                   err.message = the error message
   *                   err.reason = 1 (if the username does not exist)
   *                   err.reason = 2 (if the password is incorrect)
   */
  var login_user = function(username, password, callback) {
    UserAuth.findOne({"username": username}, function(err, result) {
      if (err) throw err;
      if (result) {
        bcrypt.compare(password, result.hash_password, function(err, is_match) {
          if (err) throw err;
          if (is_match) {
            create_session(username, callback);
          } else {
            var error = new Error("The password is incorrect");
            error.reason = 2;
            callback(error);
          }
        }); // End password compare.
      } else {
        var error = new Error("The user does not exist");
        error.reason = 1;
        callback(error);
      } // End else (user does not exist).
    }); // End find one.
  }; // End login_user.

  /*
   * Creates a session for the given user. If the user already has a session, the old session will
   * be deleted and a new one will be created.
   *
   * @param username - The name of the user who will get the session.
   * @param callback - The callback to execute after the session has been created. It will be 
   *                   called as callback(err, result), where session_id is a String indicating
   *                   the session id. The err object will either be null (if there are no errors)
   *                   or an Error object. The err object is not null if the username already
   *                   exists.
   */
  var create_session = function(username, callback) {
    // First check that the username exists.
    UserAuth.find({"username": username}, function(err, results) {
      if (err) throw err;
      if (results.length == 0) {
        callback(new Error("The username " + username + " does not exist, so we can't create a " 
            + "session for it"));
      } else {
        // If the username exists, remove all sessions associated with this username.
        Session.remove({"username": username}, function(err, result) {
          if (err) throw err;

          // Create the session and add it to the database..
          var session = new Session({"username": username});
          session.save(function(err, result) {
            if (err) throw err;
            callback(null, result._id.toString());
          }); // End session save.
        }); // End session remove.
      } //  End else (create session)
    }); // End find username.
  }; // End create_session.

  /**
   * Checks if there is a session with the given id.
   *
   * @param session_id - A string indicating the session_id to check.
   * @param callback - The callback function that will be executed. It is called as callback(err,
   *                   is_valid), where is_valid is a boolean value indicating whether the session
   *                   is valid.
   */
  var validate_session = function(session_id, callback) {
    session_id = new mongoose.Types.ObjectId(session_id);
    Session.find({"_id": session_id}, function(err, results) {
      if (err) throw err;
      if (results.length == 1) {
        callback(null, true);
      } else {
        callback(null, false);
      } // End else (session does not exist).
    }); // End session find.
  }; // End validate_session.

  /**
   * Checks if the user exists.
   * 
   * @param username - A string indicating the username to check if exists.
   * @param callback - The callback function that will be executed. it is called as callback(err,
   *                   does_exist), where does_exist is true if the user exists.
   */
  var check_if_user_exists = function(username, callback) {
    UserAuth.find({"username": username}, function(err, results) {
      if (err) throw err;
      if (results.length == 0) {
        callback(null, false);
      } else {
        callback(null, true);
      }
    }); // End find user.
  }; // End check_if_user_exists.

  /*
   * Deletes all session and user authentication data.
   *
   * @param callback - The callback to execute after the function is done. It is called as 
   *                   callback(err).
   */
  var clear_all_data = function(callback) {
    UserAuth.remove({}, function(err, result) {
      if (err) throw err;
      Session.remove({}, function(err, result) {
        if (err) throw err;
        callback(null);
      }); // End remove all sessions.
    }); // End remove all user auth.
  }; // End clear_all_data.

  /*
   * Returns the username for the given session_id.
   *
   * @param session_id - A String indicating the session id.
   * @param callback - The function to execute. It is called as callback(err, username). If err is
   *                   null, then there is no error. Otherwise, it is an Error object which means
   *                   that the user does not have a session. The username is a String indicating
   *                   the username of the user who has this session id.
   */
  var get_username_for_session_id = function(session_id, callback) {
    Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
      if (err) throw err;
      if (results.length == 0) {
        callback(new Error("There is no username with that session_id"));
      } else {
        callback(null, results[0].username);
      } // End else (i.e. the session is found).
    }); // End find session.
  }; // End get_username_for_session_id.

  var that = {};
  that.create_session = create_session;
  that.register_user = register_user;
  that.login_user = login_user;
  that.validate_session = validate_session;
  that.check_if_user_exists = check_if_user_exists;
  that.clear_all_data = clear_all_data;
  that.get_username_for_session_id = get_username_for_session_id;
  return that;
}; // End AuthManager class.

module.exports.AuthManager = AuthManager;

// This file contains constants to use throughout the application.

/**
 * This is the URL of the MongoDB database when the server is run locally. 
 * If it's run on OpenShift, then the URL may be different.
 */
module.exports.MONGO_URL = "mongodb://localhost/fritter";

/**
 * This is the salt used when hashing passwords.
 */
module.exports.SALT = 10;

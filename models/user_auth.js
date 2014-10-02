// This class creates the UserAuth model, which associates a username with a hashed password.

var mongoose = require("mongoose");

var UserAuthSchema = mongoose.Schema({
  username: {type: String, index: true, unique: true},
  hash_password: String
});
var UserAuth = mongoose.model("UserAuth", UserAuthSchema);

module.exports.UserAuth = UserAuth;

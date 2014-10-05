// This class creates the Follow model, which is a follower username and a followed username.

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var FollowSchema = mongoose.Schema({
  follower: {type: String, index: true},
  followed: {type: String, index: true}
});

var Follow = mongoose.model("Follow", FollowSchema);

module.exports.Follow = Follow;

// This class creates the Tweet model, which is the tweet content and an associated create time
// and username.

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var TweetSchema = mongoose.Schema({
  username: {type: String, index: true},
  created: {type: Date, default: Date.now},
  content: String
});

var Tweet = mongoose.model("Tweet", TweetSchema);

module.exports.Tweet = Tweet;

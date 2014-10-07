var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var PrivateMessageSchema= mongoose.Schema({
  sender: {type: String, index: true},
  recipient: {type: String, index: true},
  created: {type: Date, default: Date.now},
  unread: {type: Boolean, default: true},
  content: String
});

var PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);

module.exports.PrivateMessage = PrivateMessage;

var send_error = function(res, error) {
  res.end(JSON.stringify({
    "error": error
  }));
};

var send_response = function(res, result) {
  res.end(JSON.stringify({
    "error": null,
    "result": result
  }));
};

module.exports.send_error = send_error;
module.exports.send_response = send_response;

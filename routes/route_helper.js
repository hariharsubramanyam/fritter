// This file defines some helper methods that routes can use.

/**
 * Returns a JSON response to the res of the form:
 * {
   *  error: the error
 * }
 */
var send_error = function(res, error) {
  res.end(JSON.stringify({
    "error": error
  }));
};

/**
 * Returns a JSON response to the res of the form:
 * {
 *  error: null,
 *  result: the result
 * }
 */
var send_response = function(res, result) {
  res.end(JSON.stringify({
    "error": null,
    "result": result
  }));
};

module.exports.send_error = send_error;
module.exports.send_response = send_response;

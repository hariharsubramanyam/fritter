/**
 * Class for communicating with search API.
 */
(function() {
  var Search = function() {

    /**
     * Search for the user with the given search term.
     * The callback is executed as callback(names) where names is the list of usernames which 
     * contain the search term.
     */
    var search = function(searchterm, callback) {
      $.post("/search/users", {
        "search": searchterm
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          callback(null, data.result);
        }
      });
    }

    var that = {};
    that.search = search;
    return that;
  };
  Fritter.Search = Search;
})();

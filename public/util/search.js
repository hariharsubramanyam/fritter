(function() {
  var Search = function() {
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

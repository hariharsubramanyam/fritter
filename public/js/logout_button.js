(function() {
  var LogoutButton = function(authenticator, div) {
    var html = new EJS({"url": "/html/logout_button.ejs"}).render({});
    div.append(html);
    var btn_logout = div.find("#btn_logout");
    btn_logout.click(function() {
      authenticator.logout(function(err) {
        if (err) {
          console.log(err);
        } else {
          window.location.href = "/html/login.html";
        }
      });
    });
  };
  Fritter.LogoutButton = LogoutButton;
})();

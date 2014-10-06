(function() {
  var LogoutButtonCtrl = function(authenticator, div) {
    var html = new EJS({"url": "/views/logout_button_view.ejs"}).render({});
    div.append(html);
    var btn_logout = div.find("#btn_logout");
    btn_logout.click(function() {
      authenticator.logout(function(err) {
        if (err) {
          console.log(err);
        } else {
          window.location.href = "/views/login_page.html";
        }
      });
    });
  };
  Fritter.LogoutButtonCtrl = LogoutButtonCtrl;
})();

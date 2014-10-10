/**
 * Controller for a button which logs a user out when it is clicked.
 */
(function() {
  var LogoutButtonCtrl = function(authenticator, div) {
    // Create the button and add it to the given div.
    var html = new EJS({"url": "/views/logout_button_view.ejs"}).render({});
    div.append(html);

    var btn_logout = div.find("#btn_logout");
    btn_logout.click(function() {
      // Call the API to logout.
      authenticator.logout(function(err) {
        if (err) {
          console.log(err);
        } else {
          // Take the user to the login page after logging out.
          window.location.href = "/views/login_page.html";
        }
      });
    });
  };
  Fritter.LogoutButtonCtrl = LogoutButtonCtrl;
})();

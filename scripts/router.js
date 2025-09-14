(function() {
    window.checkLogin = function() {
      const auth = firebase.auth();

      auth.onAuthStateChanged(function(user) {
        if (!user) {
          window.location.href = "welcome.html";
        }
      });
    };

    window.addEventListener("load", function() {
      checkLogin();
    });
  })();
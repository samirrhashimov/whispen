function showMessage(message, isError = false) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
  messageDiv.style.display = 'block';
}

function checkUsernameExists(username) {
  return db.collection("usernames").doc(username).get()
    .then(doc => doc.exists);
}
function saveUsernameToDatabase(uid, username) {
  const userRef = db.collection("users").doc(uid);
  const usernameRef = db.collection("usernames").doc(username);

  return Promise.all([
    userRef.set({ username: username }, { merge: true }),
    usernameRef.set({ uid: uid })
  ]);
}

// Register işlemi
function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();

  if (!email || !password || !username) {
    showMessage("Please fill in all fields.", true);
    return;
  }

  checkUsernameExists(username)
    .then(exists => {
      if (exists) {
        showMessage("This username is already taken. Please choose another.", true);
        return;
      }

      auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          const user = userCredential.user;
          return saveUsernameToDatabase(user.uid, username)
            .then(() => user.sendEmailVerification())
            .then(() => {
              if (email === 'test@example.com') {
                window.location.href = "index.html";
              } else {
                auth.signOut();
                window.location.href = "verify.html";
              }
            });
        })
        .catch(error => {
          showMessage("Error: " + error.message, true);
        });
    })
    .catch(error => {
      showMessage("Error checking username: " + error.message, true);
    });
}

// Email/Şifre ile giriş
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Please fill in all fields.", true);
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      if (!user.emailVerified && user.email !== 'test@example.com') {
        auth.signOut();
        showMessage("Please verify your email before logging in. Check your inbox.", true);
        return;
      }

      showMessage("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    })
    .catch(error => {
      showMessage("Error: " + error.message, true);
    });
}

// Google login
window.googleLogin = function () {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const username = user.displayName?.split(" ")[0]?.toLowerCase() || "user" + Date.now();

      // Kullanıcı adı daha önce alınmış mı kontrol et
      checkUsernameExists(username).then(exists => {
        const finalUsername = exists ? username + Math.floor(Math.random() * 1000) : username;

        saveUsernameToDatabase(user.uid, finalUsername)
          .then(() => {
            window.location.href = "index.html";
          });
      });
    })
    .catch(error => {
      showMessage("Error: " + error.message, true);
    });
};

// Anonymous login
function anonymous() {
  auth.signInAnonymously()
    .then(result => {
      const user = result.user;
      const guestUsername = "guest" + Date.now();

      saveUsernameToDatabase(user.uid, guestUsername)
        .then(() => {
          window.location.href = "index.html";
        });
    })
    .catch(error => {
      showMessage("Error: " + error.message, true);
    });
}
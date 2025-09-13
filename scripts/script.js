// Music control
    musicStart.addEventListener('click', () => music.play());
    musicStop.addEventListener('click', () => music.pause());
// Sidebar control
  function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const isOpen = sidebar.classList.contains('open');

  if (!isOpen) {
    sidebar.classList.add('open');

    // Listen Click
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
  } else {
    sidebar.classList.remove('open');
    document.removeEventListener('click', handleOutsideClick);
  }
}

function handleOutsideClick(event) {
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.querySelector('.mobile-toggle');

  if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
    sidebar.classList.remove('open');
    document.removeEventListener('click', handleOutsideClick);
  }
}

//sidebar add toggleButton

// Menu Open/Close
function toggleLibrary() {
  const library = document.getElementById('library');
  library.classList.toggle('open');

  if (library.classList.contains('open')) {
    document.addEventListener('click', handleOutsideClicker);
  } else {
    document.removeEventListener('click', handleOutsideClicker);
  }
}

function handleOutsideClicker(event) {
  const library = document.getElementById('library');
  const toggleButton = document.getElementById('toggle-library-button');

  const clickedElement = event.target;

  // If the clicked place is in the library or on the toggle button: close
  if (library.contains(clickedElement) || (toggleButton && toggleButton.contains(clickedElement))) return;

  // If the clicked element has the .listener class: close
  if (clickedElement.closest('.librarylistener')) return;

  // Otherwise close the library
  library.classList.remove('open');
  document.removeEventListener('click', handleOutsideClicker);
}

document.getElementById('file-input').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    const fileName = file.name;
    saveRecentPdf(fileName);
    openPdf(file);
    updateRecentPdfList();
  }
}

// Save PDF name to LocalStorage
function saveRecentPdf(fileName) {
let pdfList = JSON.parse(localStorage.getItem('recentPdfs')) || [];

// If the same file exists, move it to the top
pdfList = pdfList.filter(name => name !== fileName);
pdfList.unshift(fileName);

// Keep at most 5
if (pdfList.length > 5) pdfList = pdfList.slice(0, 5);

localStorage.setItem('recentPdfs', JSON.stringify(pdfList));
}

// Update List
function updateRecentPdfList() {
const listContainer = document.getElementById('recentPdfsList');
listContainer.innerHTML = '';

const pdfList = JSON.parse(localStorage.getItem('recentPdfs')) || [];

pdfList.forEach(fileName => {
const item = document.createElement('div');
item.className = 'pdf-item';

const title = document.createElement('span');  
title.className = 'pdf-title';  
title.textContent = fileName;  
item.appendChild(title);  
listContainer.appendChild(item);
});
}
// Show list on page load
window.addEventListener('DOMContentLoaded', updateRecentPdfList);

const libraryButton = document.querySelector(".librarybutton");

// Add click event listener to element
libraryButton.addEventListener("click", toggleLibrary);

//clear history
document.getElementById('clear-history').addEventListener('click', function () {
  localStorage.removeItem('recentPdfs');

  const recentList = document.getElementById('recent-list');
  if (recentList) recentList.innerHTML = '';
});


// Select HTML elements in JavaScript
const metinElementi = document.getElementById('clear-historytext');
const butonElementi = document.getElementById('clear-history');

// Define original and new texts
const orijinalMetin = "Clear History";
const yeniMetin = "History Cleared!";

// Add a click event listener to the button
butonElementi.addEventListener('click', function() {
    metinElementi.textContent = yeniMetin;
});
setTimeout(() => {
  metinElementi.textContent = orijinalMetin;
}, 10000);

const clearHistoryBtn = document.getElementById('clear-history');

clearHistoryBtn.addEventListener('click', () => {
  clearHistoryBtn.classList.remove('popEffect');
  void clearHistoryBtn.offsetWidth;
  clearHistoryBtn.classList.add('popEffect'); 
});
  clearHistoryBtn.addEventListener('animationend', () => {
  clearHistoryBtn.disabled = true;  
  clearHistoryBtn.classList.remove('popEffect');
});

// Active Again 10s
setTimeout(() => {
  clearHistoryBtn.disabled = false;
}, 10000);



const clearHistoryBtnReloader = document.getElementById('clear-history');

clearHistoryBtnReloader.addEventListener('click', () => {
  updateRecentPdfList()
});

//Sidebar Mail System
auth.onAuthStateChanged((user) => {
  const signinBtn = document.querySelector(".sidebar-signin");
  const emailDisplay = document.getElementById("user-email-display");
  const emailImgDisplay = document.getElementById("user-email-img");

  if (user) {
    signinBtn.style.display = "none";
    emailDisplay.style.display = "block";
    emailDisplay.textContent = user.email;
    emailImgDisplay.style.display ="block";
    
    if (user.isAnonymous) {
    signinBtn.style.display = "none";
    emailDisplay.style.display = "block";
    emailDisplay.textContent = user.email;
    } else {
      emailDisplay.textContent = user.email;
    }
    
  } else {
    // If the user is logged out
    signinBtn.style.display = "block";
    emailDisplay.style.display = "none";
    emailDisplay.textContent = "";
    emailImgDisplay.style.display ="none";
  }
});


// Themes Functions
function toggleThemesMenu() {
  const user = firebase.auth().currentUser;

  if (!user || user.isAnonymous) {
    showLoginModal();
    return;
  }

  const menu = document.getElementById('themesdiv');
  menu.classList.toggle('open');
}

// Close when clicking outside the menu
document.addEventListener('click', function(event) {
  const menu = document.getElementById('themesdiv');

  // If the menu is not open, do nothing
  if (!menu.classList.contains('open')) return;

  // If the clicked location is inside the menu or open button, close
  if (
    menu.contains(event.target) ||
    event.target.closest('.sidebar-tab, #controls, svg, .bottomnav')
  ) return;

  menu.classList.remove('open');
});

//Theme Selector
const options = document.querySelectorAll(".theme-option");

options.forEach(option => {
  option.addEventListener("click", () => {
    const selectedTheme = option.dataset.theme;

    // Clear all theme classes
    document.body.classList.remove("forest-style", "moon-style", "oled-style", "desert-style", "ocean-style", "sakura-style", "cyberpunk-style", "autumn-style", "mystic-style", "cafe-style", "mc-style");

    // Remove active class from all options
    options.forEach(opt => opt.classList.remove("active"));

    if (selectedTheme !== "default") {
      document.body.classList.add(selectedTheme);
      localStorage.setItem("selectedTheme", selectedTheme);
    } else {
      localStorage.removeItem("selectedTheme");
    }

    // Add active class to selected theme
    option.classList.add("active");
  });
});
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    document.body.classList.add(savedTheme);

    // Add "active" class to the right option
    const selectedOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (selectedOption) {
      selectedOption.classList.add("active");
    }
  } else {
    // If the default theme is active, mark default
    const defaultOption = document.querySelector('.theme-option[data-theme="default"]');
    if (defaultOption) {
      defaultOption.classList.add("active");
    }
  }
});

function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}






//settings
function toggleSettingsMenu() {
  const settingsMenu = document.querySelector('.settingsmenu');
  settingsMenu.classList.remove('open');
}

function togglePasswordForm() {
  const form = document.getElementById('password-form');
  form.classList.toggle('hidden');
}

function toggleAppInfo() {
  const form = document.getElementById('dev-info-box');
  form.classList.toggle('hidden');
}

function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const msg = document.getElementById('password-update-message');

  const user = firebase.auth().currentUser;

  if (!user) {
    msg.textContent = "No login has been made.";
    msg.style.color = "orange";
    return;
  }

  if (newPassword !== confirmPassword) {
    msg.textContent = "New passwords do not match.";
    msg.style.color = "orange";
    return;
  }

  if (newPassword.length < 6) {
    msg.textContent = "New password must be at least 6 characters.";
    msg.style.color = "orange";
    return;
  }

  // Re-authentication is required to verify the old password
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

  user.reauthenticateWithCredential(credential)
    .then(() => {
      return user.updatePassword(newPassword);
    })
    .then(() => {
      msg.textContent = "Password updated successfully.";
      msg.style.color = "lightgreen";

      // Clear Form
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
    })
    .catch((error) => {
      msg.textContent = "Error: " + error.message;
      msg.style.color = "red";
    });
}



function setVolume(value) {
  const volume = parseInt(value) / 100;
  console.log('Volume:', volume);
  console.log('Audio:', window.currentAudio);

  if (window.currentAudio) {
    window.currentAudio.volume = volume;
  }
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

function showDeleteAccountModal() {
  document.getElementById('deleteAccountModal').classList.remove('hidden');
}

function closeDeleteAccountModal() {
  document.getElementById('deleteAccountModal').classList.add('hidden');
  document.getElementById('deleteErrorMessage').textContent = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('confirmDelete').value = '';
}

function confirmDeleteAccount() {
  const password = document.getElementById('confirmPassword').value;
  const deleteText = document.getElementById('confirmDelete').value;
  const errorElement = document.getElementById('deleteErrorMessage');

  if (deleteText !== 'DELETE') {
    errorElement.textContent = 'Please confirm by typing DELETE.';
    return;
  }

  const user = firebase.auth().currentUser;
  const email = user.email;
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);

  user.reauthenticateWithCredential(credential)
    .then(() => {
      return user.delete();
    })
    .then(() => {
      window.location.href = "register.html";
    })
    .catch((error) => {
      if (error.code === 'auth/wrong-password') {
        errorElement.textContent = 'Password Wrong.';
      } else {
        errorElement.textContent = 'An error occurred. Please try again.';
      }
    });
}


document.getElementById('volumeControl').addEventListener('input', function (e) {
  const volume = parseInt(e.target.value) / 100;
  localStorage.setItem('ambientVolume', volume);  // Save Setting
  window.defaultVolume = volume;

  if (window.currentAudio) {
    window.currentAudio.volume = volume; // 🎧 Change the sound instantly
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('volumeControl');
  const savedVolume = localStorage.getItem('ambientVolume');

  if (savedVolume !== null) {
    slider.value = Math.round(parseFloat(savedVolume) * 100);
  } else {
    slider.value = 70; // If it's your first time, set it to 70
  }
});





function toggleNotesMenu() {
  const user = firebase.auth().currentUser;

  if (!user || user.isAnonymous) {
    showLoginModal();
    return;
  }

  const menu = document.getElementById('noteMenu');
  menu.classList.toggle('open');
}

// Close when clicking outside the menu
document.addEventListener('click', function(event) {
  const menu = document.getElementById('noteMenu');

  if (!menu.classList.contains('open')) return;

  if (
    menu.contains(event.target) ||
    event.target.closest('.sidebar-tab, #controls, svg, .addmodal')
  ) return;

  menu.classList.remove('open');
});





function setupModalOutsideClick(modal, contentSelector) {
  modal.addEventListener("click", (e) => {
    if (!e.target.closest(contentSelector)) {
      closeModal(modal);
    }
  });
}

setupModalOutsideClick(noteModal, ".modal-content2");


//test
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var uid = user.uid;
      var db = firebase.firestore();

      db.collection("users").doc(uid).get().then(function(doc) {
        if (doc.exists) {
          var username = doc.data().username;
          var usernameSpan = document.getElementById("username");
          if (usernameSpan) {
            usernameSpan.textContent = username;
          }
        } else {
          console.log("Kullanıcı belgesi bulunamadı.");
        }
      }).catch(function(error) {
        console.error("Kullanıcı adı alınamadı:", error);
      });
    }
  });
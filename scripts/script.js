// Music control
    musicStart.addEventListener('click', () => music.play());
    musicStop.addEventListener('click', () => music.pause());
// Sidebar control
  function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const isOpen = sidebar.classList.contains('open');

  if (!isOpen) {
    sidebar.classList.add('open');

    // Dokunmayı dinlemeye başla
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
document.addEventListener('DOMContentLoaded', function() {
    // Tıklanacak div elementini seç
    const sidebarAddTab = document.querySelector('.sidebaradd.sidebar-tab');

    // Gizli input elementini seç
    const fileInput = document.getElementById('file-input');

    // Div'e tıklama olay dinleyicisi ekle
    sidebarAddTab.addEventListener('click', function() {
        // Gizli input'a programatik olarak tıkla
        fileInput.click();
    });
});

// Menü aç/kapa
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

  // Eğer tıklanan yer library içinde veya toggle buton ise: kapatma
  if (library.contains(clickedElement) || (toggleButton && toggleButton.contains(clickedElement))) return;

  // Eğer tıklanan öğe .listener sınıfına sahipse: kapatma
  if (clickedElement.closest('.librarylistener')) return;

  // Aksi halde library'yi kapat
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

// LocalStorage’a PDF adını kaydet
function saveRecentPdf(fileName) {
let pdfList = JSON.parse(localStorage.getItem('recentPdfs')) || [];

// Aynı dosya varsa en üste taşı
pdfList = pdfList.filter(name => name !== fileName);
pdfList.unshift(fileName);

// En fazla 5 tane tut
if (pdfList.length > 5) pdfList = pdfList.slice(0, 5);

localStorage.setItem('recentPdfs', JSON.stringify(pdfList));
}

// Listeyi güncelle
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
// Sayfa yüklendiğinde listeyi göster
window.addEventListener('DOMContentLoaded', updateRecentPdfList);

const libraryButton = document.querySelector(".librarybutton");

// Elemente tıklama olay dinleyicisi ekle
libraryButton.addEventListener("click", toggleLibrary);

//clear history
document.getElementById('clear-history').addEventListener('click', function () {
  localStorage.removeItem('recentPdfs');

  const recentList = document.getElementById('recent-list');
  if (recentList) recentList.innerHTML = '';
});


// HTML elementlerini JavaScript'te seçiyoruz
const metinElementi = document.getElementById('clear-historytext');
const butonElementi = document.getElementById('clear-history');

// Orijinal ve yeni metinleri tanımlıyoruz
const orijinalMetin = "Clear History";
const yeniMetin = "History Cleared!";

// Butona tıklama olayı dinleyicisi ekliyoruz
butonElementi.addEventListener('click', function() {
    metinElementi.textContent = yeniMetin;
});
setTimeout(() => {
  metinElementi.textContent = orijinalMetin;
}, 10000);

const clearHistoryBtn = document.getElementById('clear-history');

clearHistoryBtn.addEventListener('click', () => {
  clearHistoryBtn.classList.remove('popEffect'); // Yeniden eklenebilmesi için önce çıkar
  void clearHistoryBtn.offsetWidth; // DOM'u zorla yeniden hesaplat, animasyonu sıfırlar
  clearHistoryBtn.classList.add('popEffect'); // Animasyonu yeniden başlat
  
});
  clearHistoryBtn.addEventListener('animationend', () => {
  clearHistoryBtn.disabled = true;         // Butonu devre dışı bırak
  clearHistoryBtn.classList.remove('popEffect'); // Sınıfı temizle
});

// 10 san sonra aktiv
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
    // Kullanıcı çıkış yaptıysa
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

// Menü dışına tıklanınca kapat
document.addEventListener('click', function(event) {
  const menu = document.getElementById('themesdiv');

  // Menü açık değilse hiçbir şey yapma
  if (!menu.classList.contains('open')) return;

  // Eğer tıklanan yer menünün ya da açma düğmesinin içindeyse, kapatma
  if (
    menu.contains(event.target) ||
    event.target.closest('.sidebar-tab, #controls, svg')
  ) return;

  menu.classList.remove('open');
});

//Theme Selector
const options = document.querySelectorAll(".theme-option");

options.forEach(option => {
  option.addEventListener("click", () => {
    const selectedTheme = option.dataset.theme;

    // Tüm tema classlarını temizle
    document.body.classList.remove("forest-style", "moon-style", "desert-style", "ocean-style", "sakura-style", "cyberpunk-style", "autumn-style", "mystic-style", "cafe-style", "mc-style");

    // Tüm seçeneklerden active classını kaldır
    options.forEach(opt => opt.classList.remove("active"));

    if (selectedTheme !== "default") {
      document.body.classList.add(selectedTheme);
      localStorage.setItem("selectedTheme", selectedTheme);
    } else {
      localStorage.removeItem("selectedTheme");
    }

    // Seçilen temaya active class'ı ekle
    option.classList.add("active");
  });
});
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    document.body.classList.add(savedTheme);

    // Doğru seçeneğe "active" sınıfı ekle
    const selectedOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (selectedOption) {
      selectedOption.classList.add("active");
    }
  } else {
    // Default tema aktifse default'u işaretle
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



//settingsbutton
function toggleSettingsMenu() {
  const menu = document.getElementById('settingsMenu');
  menu.classList.toggle('open');
}

// Menü dışına ve .sidebar-tab dışına tıklanınca kapat
document.addEventListener('click', function(event) {
  const menu = document.getElementById('settingsMenu');

  // Menü açık değilse bir şey yapma
  if (!menu.classList.contains('open')) return;

  // Eğer tıklanan yer menünün içindeyse veya .sidebar-tab ise kapatma
  if (menu.contains(event.target) || event.target.closest('.sidebar-tab')) return;

  // Aksi halde menüyü kapat
  menu.classList.remove('open');
});




//settings
function togglePasswordForm() {
  const form = document.getElementById('password-form');
  form.classList.toggle('hidden');
}

function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const msg = document.getElementById('password-update-message');

  const user = firebase.auth().currentUser;

  if (!user) {
    msg.textContent = "Giriş yapılmamış.";
    msg.style.color = "orange";
    return;
  }

  if (newPassword !== confirmPassword) {
    msg.textContent = "Yeni şifreler uyuşmuyor.";
    msg.style.color = "orange";
    return;
  }

  if (newPassword.length < 6) {
    msg.textContent = "Yeni şifre en az 6 karakter olmalı.";
    msg.style.color = "orange";
    return;
  }

  // Eski şifreyi doğrulamak için yeniden kimlik doğrulama gerekir
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

  user.reauthenticateWithCredential(credential)
    .then(() => {
      return user.updatePassword(newPassword);
    })
    .then(() => {
      msg.textContent = "Şifre başarıyla güncellendi.";
      msg.style.color = "lightgreen";

      // Formu temizle
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
    })
    .catch((error) => {
      msg.textContent = "Hata: " + error.message;
      msg.style.color = "red";
    });
}



function setVolume(value) {
  const volume = parseInt(value) / 100;
  console.log('Ses seviyesi:', volume);
  console.log('Audio:', window.currentAudio);

  if (window.currentAudio) {
    window.currentAudio.volume = volume;
  }
}




function changeLanguage(lang) {
  // localStorage.setItem('language', lang);
  // Dili güncelleme işlemi
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

function deleteAccount() {
  const user = firebase.auth().currentUser;
  if (user) {
    user.delete().then(() => {
      alert("Hesabınız silindi.");
      window.location.href = "register.html";
    }).catch((error) => {
      alert("Yeniden giriş yapmanız gerekebilir.");
    });
  }
}







document.getElementById('volumeControl').addEventListener('input', function (e) {
  const volume = parseInt(e.target.value) / 100;
  localStorage.setItem('ambientVolume', volume);  // 💾 Ayarı kaydet
  window.defaultVolume = volume; // 🔁 Yeni sesler bu seviyede başlasın

  if (window.currentAudio) {
    window.currentAudio.volume = volume; // 🎧 Ses anında değişsin
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('volumeControl');
  const savedVolume = localStorage.getItem('ambientVolume');

  if (savedVolume !== null) {
    slider.value = Math.round(parseFloat(savedVolume) * 100);
  } else {
    slider.value = 70; // İlk kez geliyorsa 70 olarak ayarla
  }
});
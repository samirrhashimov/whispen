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
}

document.getElementById('file-input').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
const file = event.target.files[0];
if (file && file.type === "application/pdf") {
const fileName = file.name;

// Dosya adını localStorage’a kaydet  
saveRecentPdf(fileName);  
// PDF'yi açma fonksiyonu (sen kendi sistemine göre yazacaksın)  
openPdf(file); // bunu sen kendi viewer fonksiyonuna bağlayacaksın  
// Listeyi güncelle  
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
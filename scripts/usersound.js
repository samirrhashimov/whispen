// ========== IndexedDB Setup ==========
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WhispenDB', 1);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('userSounds')) {
        db.createObjectStore('userSounds', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveUserSound(sound) {
  const db = await openDB();
  const tx = db.transaction('userSounds', 'readwrite');
  tx.objectStore('userSounds').put(sound);
  return tx.complete;
}

async function getAllUserSounds() {
  const db = await openDB();
  const tx = db.transaction('userSounds', 'readonly');
  const store = tx.objectStore('userSounds');
  return store.getAll();
}

// ========== Global ==========

const userSounds = [];
let currentSound = null;
let audio = new Audio();

// ========== UI Elements ==========

const uploadInput = document.getElementById('uploadSound');
const uploadBtn = document.getElementById('uploadButton');
const userSoundList = document.getElementById('userSoundList');

// ========== Sayfa Açıldığında Sesleri Yükle ==========

window.addEventListener('DOMContentLoaded', async () => {
  const savedSounds = await getAllUserSounds();

  savedSounds.forEach((sound) => {
    sound.src = URL.createObjectURL(sound.blob);
    userSounds.push(sound);
    addUserSoundToUI(sound);
  });
});

// ========== Ses Yükleme ==========

uploadBtn.onclick = () => {
  uploadInput.click();
};

uploadInput.addEventListener('change', async function () {
  const files = Array.from(this.files);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (!file.type.startsWith('audio/')) continue;

    const soundId = `user-${Date.now()}-${index}`;
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const blobUrl = URL.createObjectURL(blob);

    const userSound = {
      id: soundId,
      name: file.name,
      blob: blob,
      isUserSound: true
    };

    userSounds.push({
      ...userSound,
      src: blobUrl
    });

    addUserSoundToUI({
      ...userSound,
      src: blobUrl
    });

    await saveUserSound(userSound);
  }

  uploadInput.value = ''; // Aynı dosya tekrar yüklenebilsin
});

// ========== Arayüze Ses Ekleme ==========

function addUserSoundToUI(sound) {
  const item = document.createElement('div');
  item.className = 'sound-item';
  item.dataset.soundId = sound.id;

  const title = document.createElement('span');
  title.className = 'sound-title';
  title.textContent = sound.name;

  const actions = document.createElement('div');
  actions.className = 'sound-actions';

  const playBtn = document.createElement('button');
  playBtn.innerHTML = getPlayIcon();
  playBtn.onclick = () => playSound(sound);

  actions.appendChild(playBtn);
  item.append(title, actions);
  userSoundList.appendChild(item);
}

// ========== Ses Çalma ==========

function playSound(sound) {
  // Aynı ses çalıyorsa: durdur
  if (currentSound === sound.id) {
    audio.pause();
    audio.currentTime = 0;
    updatePlayButtonIcon(sound.id, true);
    currentSound = null;
    return;
  }

  // Başka bir ses çalıyorsa onu durdur
  if (currentSound && currentSound !== sound.id) {
    audio.pause();
    audio.currentTime = 0;
    updatePlayButtonIcon(currentSound, true);
  }

  if (!sound.src) {
    sound.src = URL.createObjectURL(sound.blob);
  }

  audio.src = sound.src;
  audio.play();
  currentSound = sound.id;
  updatePlayButtonIcon(currentSound, false);
}

// ========== Buton İkonlarını Güncelle ==========

function updatePlayButtonIcon(soundId, isPlay = true) {
  const allItems = document.querySelectorAll('.sound-item');
  allItems.forEach(item => {
    if (item.dataset.soundId === soundId) {
      const btn = item.querySelector('button');
      btn.innerHTML = isPlay ? getPlayIcon() : getStopIcon();
    }
  });
}

function getPlayIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/>
  </svg>`;
}

function getStopIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>`;
}
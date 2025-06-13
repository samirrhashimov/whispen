const soundLibrary = [
      { 
        id: 'rain', 
        name: 'Rain Sounds', 
        src: './assets/sounds/rain.mp3' 
      },
      { 
        id: 'ocean', 
        name: 'Ocean Waves', 
        src: 'https://files.catbox.moe/w8615t.mp3' 
      },
      { 
        id: 'birds', 
        name: 'Forest Birds', 
        src: 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav' 
      }
    ];

    // IndexedDB setup
    let db;
    
    function initDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('whispenSounds', 1);
        req.onupgradeneeded = e => {
          db = e.target.result;
          if (!db.objectStoreNames.contains('sounds')) {
            db.createObjectStore('sounds', { keyPath: 'id' });
          }
        };
        req.onsuccess = e => {
          db = e.target.result;
          resolve(db);
        };
        req.onerror = e => reject(e.target.error);
      });
    }

    // GLOBAL AUDIO CONTROL - Tek bir audio nesnesi kullanıyoruz
    let currentAudio = null;
    let currentSoundId = null;
    let currentSoundName = '';

    // Initialize UI
    document.getElementById('music-start').disabled = true;
    document.getElementById('music-stop').disabled = true;

    // NAVBAR CONTROLS - Global audio kontrolü
    document.getElementById('music-start').onclick = () => {
      if (currentAudio && currentAudio.paused) {
        currentAudio.play().catch(err => {
          console.error('Start button play failed:', err);
          showError('Could not resume playback');
        });
      }
    };
    
    document.getElementById('music-stop').onclick = () => {
      if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
      }
    };

    // Check for downloaded sounds on load
    initDB().then(() => {
      soundLibrary.forEach(async (sound) => {
        try {
          const tx = db.transaction('sounds', 'readonly');
          const store = tx.objectStore('sounds');
          const request = store.get(sound.id);
          
          request.onsuccess = () => {
            if (request.result) {
              const downloadBtn = document.getElementById(`download-${sound.id}`);
              if (downloadBtn) {
                downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 507.506 507.506" style="enable-background:new 0 0 507.506 507.506;" xml:space="preserve" width="18" height="18" fill="white"><g><path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z"/></g>';
                downloadBtn.title = 'Downloaded - Click to remove';
                downloadBtn.onclick = () => removeDownload(sound);
              }
            }
          };
        } catch (error) {
          console.warn('Could not check download status:', error);
        }
      });
    }).catch(err => showError('Database initialization failed: ' + err.message));

    // Show error messages
    function showError(message) {
      const errorContainer = document.getElementById('error-container');
      errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
      setTimeout(() => errorContainer.innerHTML = '', 5000);
    }

    // Populate sound list
    const soundList = document.getElementById('soundList');
    soundLibrary.forEach(sound => {
      const item = document.createElement('div');
      item.className = 'sound-item';
      
      const title = document.createElement('span');
      title.className = 'sound-title';
      title.textContent = sound.name;
      
      const actions = document.createElement('div');
      actions.className = 'sound-actions';
      
      const downloadBtn = document.createElement('button');
      downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="18" height="18" fill="white"><g>	<path d="M188.821,377.6c37.49,37.491,98.274,37.491,135.765,0.001c0,0,0.001-0.001,0.001-0.001l68.523-68.523   c12.712-12.278,13.064-32.536,0.786-45.248c-12.278-12.712-32.536-13.064-45.248-0.786c-0.267,0.257-0.529,0.52-0.786,0.786   l-59.371,59.349L288,32c0-17.673-14.327-32-32-32l0,0c-17.673,0-32,14.327-32,32l0.448,290.709l-58.901-58.901   c-12.712-12.278-32.97-11.926-45.248,0.786c-11.977,12.401-11.977,32.061,0,44.462L188.821,377.6z"/><path d="M480,309.333c-17.673,0-32,14.327-32,32v97.941c-0.012,4.814-3.911,8.714-8.725,8.725H72.725   c-4.814-0.012-8.714-3.911-8.725-8.725v-97.941c0-17.673-14.327-32-32-32s-32,14.327-32,32v97.941   C0.047,479.42,32.58,511.953,72.725,512h366.549c40.146-0.047,72.678-32.58,72.725-72.725v-97.941   C512,323.66,497.673,309.333,480,309.333z"/></g></svg>';
      downloadBtn.onclick = () => downloadSound(sound);
      downloadBtn.id = `download-${sound.id}`;
      downloadBtn.title = 'Download for offline use';
      
      const playBtn = document.createElement('button');
      playBtn.innerHTML ='<svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/></svg>';
      playBtn.onclick = () => playSound(sound);
      playBtn.id = `play-${sound.id}`;
      playBtn.title = 'Play sound';
      
      actions.append(downloadBtn, playBtn);
      item.append(title, actions);
      soundList.appendChild(item);
    });

    // Toggle sidebar
    function toggleAmbientMenu() {
      document.getElementById('ambientdiv').classList.toggle('open');
    }
    
  document.addEventListener('click', function(event) {
  const menu = document.getElementById('ambientdiv');

  // Menü açık değilse hiçbir şey yapma
  if (!menu.classList.contains('open')) return;

  // Eğer tıklanan yer menünün ya da açma düğmesinin içindeyse, kapatma
  if (
    menu.contains(event.target) ||
    event.target.closest('.sidebar-tab, #controls, svg')
  ) return;

  menu.classList.remove('open');
});

    // Download sound to IndexedDB
    async function downloadSound(sound) {
      try {
        const downloadBtn = document.getElementById(`download-${sound.id}`);
        
        if (downloadBtn.innerHTML ==='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 507.506 507.506" style="enable-background:new 0 0 507.506 507.506;" xml:space="preserve" width="18" height="18" fill="white"><g><path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z"/></g>') {
          return;
        }
        
        downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="m9.012,14.289l.566.45c1.225.974,2.634,2.43,3.185,4.261h-7.524c.553-1.828,1.968-3.282,3.197-4.255l.576-.456Zm14.988-2.289c0,3.314-2.686,6-6,6s-6-2.686-6-6,2.686-6,6-6,6,2.686,6,6Zm-2.793,1.793l-2.207-2.207v-3.586h-2v4.414l2.793,2.793,1.414-1.414Zm-6.307,5.581c.065.392.1.798.1,1.217v.409H3v-.409c0-3.385,2.281-5.9,4.195-7.414l1.487-1.176-1.487-1.176c-1.914-1.514-4.195-4.03-4.195-7.415,0-.226.184-.409.409-.409h11.182c.226,0,.409.183.409.409,0,.419-.036.824-.1,1.217.943-.398,1.978-.619,3.062-.624.011-.198.038-.389.038-.593,0-1.88-1.529-3.409-3.409-3.409H3.409C1.529,0,0,1.53,0,3.41c0,3.754,1.945,6.619,3.986,8.591-2.041,1.971-3.986,4.835-3.986,8.59v3.409h18v-3.409c0-.204-.027-.394-.038-.593-1.085-.005-2.12-.226-3.062-.624Z"/></svg>';
        downloadBtn.disabled = true;
        
        const response = await fetch(sound.src, {
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`Network error: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        
        if (!db) {
          await initDB();
        }
        
        return new Promise((resolve, reject) => {
          const tx = db.transaction('sounds', 'readwrite');
          const store = tx.objectStore('sounds');
          const request = store.put({ 
            id: sound.id, 
            blob: blob,
            name: sound.name,
            downloadDate: new Date().toISOString()
          });
          
          tx.oncomplete = () => {
            downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 507.506 507.506" style="enable-background:new 0 0 507.506 507.506;" xml:space="preserve" width="18" height="18" fill="white"><g><path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z"/></g>';
            downloadBtn.title = 'Downloaded - Click to remove from offline storage';
            downloadBtn.disabled = false;
            downloadBtn.onclick = () => removeDownload(sound);
            
            const errorContainer = document.getElementById('error-container');
            errorContainer.innerHTML = `<div style="color: #10b981; font-size: 0.9rem; margin-top: 0.5rem;">${sound.name} downloaded successfully!</div>`;
            setTimeout(() => errorContainer.innerHTML = '', 3000);
            
            resolve();
          };
          
          tx.onerror = () => {
            downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 511.494 511.494" style="enable-background:new 0 0 511.494 511.494;" xml:space="preserve" width="18" height="18" fill="red"><g><path d="M478.291,255.492c-16.133,0.143-29.689,12.161-31.765,28.16c-15.37,105.014-112.961,177.685-217.975,162.315   S50.866,333.006,66.236,227.992S179.197,50.307,284.211,65.677c35.796,5.239,69.386,20.476,96.907,43.959l-24.107,24.107   c-8.33,8.332-8.328,21.84,0.004,30.17c4.015,4.014,9.465,6.262,15.142,6.246h97.835c11.782,0,21.333-9.551,21.333-21.333V50.991   c-0.003-11.782-9.556-21.331-21.338-21.329c-5.655,0.001-11.079,2.248-15.078,6.246l-28.416,28.416   C320.774-29.34,159.141-19.568,65.476,86.152S-18.415,353.505,87.304,447.17s267.353,83.892,361.017-21.828   c32.972-37.216,54.381-83.237,61.607-132.431c2.828-17.612-9.157-34.183-26.769-37.011   C481.549,255.641,479.922,255.505,478.291,255.492z"/></g>';
            downloadBtn.disabled = false;
            reject(tx.error || new Error('IndexedDB transaction failed'));
          };
        });
        
      } catch (error) {
        console.error('Download failed:', error);
        showError(`Download failed for ${sound.name}: ${error.message}`);
        const downloadBtn = document.getElementById(`download-${sound.id}`);
        downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 511.494 511.494" style="enable-background:new 0 0 511.494 511.494;" xml:space="preserve" width="18" height="18" fill="red"><g><path d="M478.291,255.492c-16.133,0.143-29.689,12.161-31.765,28.16c-15.37,105.014-112.961,177.685-217.975,162.315   S50.866,333.006,66.236,227.992S179.197,50.307,284.211,65.677c35.796,5.239,69.386,20.476,96.907,43.959l-24.107,24.107   c-8.33,8.332-8.328,21.84,0.004,30.17c4.015,4.014,9.465,6.262,15.142,6.246h97.835c11.782,0,21.333-9.551,21.333-21.333V50.991   c-0.003-11.782-9.556-21.331-21.338-21.329c-5.655,0.001-11.079,2.248-15.078,6.246l-28.416,28.416   C320.774-29.34,159.141-19.568,65.476,86.152S-18.415,353.505,87.304,447.17s267.353,83.892,361.017-21.828   c32.972-37.216,54.381-83.237,61.607-132.431c2.828-17.612-9.157-34.183-26.769-37.011   C481.549,255.641,479.922,255.505,478.291,255.492z"/></g>';
        downloadBtn.disabled = false;
        
        setTimeout(() => {
          downloadBtn.innerHTML = '️<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="18" height="18" fill="white"><g><path d="M188.821,377.6c37.49,37.491,98.274,37.491,135.765,0.001c0,0,0.001-0.001,0.001-0.001l68.523-68.523   c12.712-12.278,13.064-32.536,0.786-45.248c-12.278-12.712-32.536-13.064-45.248-0.786c-0.267,0.257-0.529,0.52-0.786,0.786   l-59.371,59.349L288,32c0-17.673-14.327-32-32-32l0,0c-17.673,0-32,14.327-32,32l0.448,290.709l-58.901-58.901   c-12.712-12.278-32.97-11.926-45.248,0.786c-11.977,12.401-11.977,32.061,0,44.462L188.821,377.6z"/><path d="M480,309.333c-17.673,0-32,14.327-32,32v97.941c-0.012,4.814-3.911,8.714-8.725,8.725H72.725   c-4.814-0.012-8.714-3.911-8.725-8.725v-97.941c0-17.673-14.327-32-32-32s-32,14.327-32,32v97.941   C0.047,479.42,32.58,511.953,72.725,512h366.549c40.146-0.047,72.678-32.58,72.725-72.725v-97.941   C512,323.66,497.673,309.333,480,309.333z"/></g>';
          downloadBtn.title = 'Download for offline use';
          downloadBtn.onclick = () => downloadSound(sound);
        }, 3000);
      }
    }

    // Remove downloaded sound
    async function removeDownload(sound) {
      try {
        if (!db) return;
        
        const tx = db.transaction('sounds', 'readwrite');
        const store = tx.objectStore('sounds');
        store.delete(sound.id);
        
        await new Promise((resolve, reject) => {
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        
        const downloadBtn = document.getElementById(`download-${sound.id}`);
        downloadBtn.innerHTML = '️️<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="18" height="18" fill="white"><g><path d="M188.821,377.6c37.49,37.491,98.274,37.491,135.765,0.001c0,0,0.001-0.001,0.001-0.001l68.523-68.523   c12.712-12.278,13.064-32.536,0.786-45.248c-12.278-12.712-32.536-13.064-45.248-0.786c-0.267,0.257-0.529,0.52-0.786,0.786   l-59.371,59.349L288,32c0-17.673-14.327-32-32-32l0,0c-17.673,0-32,14.327-32,32l0.448,290.709l-58.901-58.901   c-12.712-12.278-32.97-11.926-45.248,0.786c-11.977,12.401-11.977,32.061,0,44.462L188.821,377.6z"/><path d="M480,309.333c-17.673,0-32,14.327-32,32v97.941c-0.012,4.814-3.911,8.714-8.725,8.725H72.725   c-4.814-0.012-8.714-3.911-8.725-8.725v-97.941c0-17.673-14.327-32-32-32s-32,14.327-32,32v97.941   C0.047,479.42,32.58,511.953,72.725,512h366.549c40.146-0.047,72.678-32.58,72.725-72.725v-97.941   C512,323.66,497.673,309.333,480,309.333z"/></g>';
        downloadBtn.title = 'Download for offline use';
        downloadBtn.onclick = () => downloadSound(sound);
        
      } catch (error) {
        console.error('Remove failed:', error);
        showError(`Could not remove ${sound.name}: ${error.message}`);
      }
    }

    // Update all UI elements when audio state changes
    function updateUI(state, soundName = '', soundId = null) {
      const musicText = document.getElementById('musicnametext');
      const startBtn = document.getElementById('music-start');
      const stopBtn = document.getElementById('music-stop');
      
      switch(state) {
        case 'loading':
          musicText.textContent = `Playing: ${soundName}`;
          startBtn.disabled = true;
          stopBtn.disabled = true;
          break;
        case 'playing':
          musicText.textContent = ` Playing: ${soundName}`;
          startBtn.disabled = false;
          stopBtn.disabled = false;
          break;
        case 'paused':
          musicText.textContent = ` Paused: ${soundName}`;
          startBtn.disabled = false;
          stopBtn.disabled = false;
          break;
        case 'stopped':
          musicText.textContent = 'No sound playing';
          startBtn.disabled = true;
          stopBtn.disabled = true;
          if (currentSoundId) {
            resetPlayButton(currentSoundId);
            currentSoundId = null;
            currentSoundName = '';
          }
          break;
      }
    }

    // Play sound - TEK AUDIO NESNESI KULLANIMI
    async function playSound(sound) {
      try {
        // Mevcut sesi durdur ve temizle
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          // Event listener'ları temizle
          currentAudio.onended = null;
          currentAudio.onplay = null;
          currentAudio.onpause = null;
          currentAudio.onerror = null;
          if (currentSoundId) {
            resetPlayButton(currentSoundId);
          }
          currentAudio = null;
        }

        updateUI('loading', sound.name);
        currentSoundId = sound.id;
        currentSoundName = sound.name;

        let audioSrc = null;
        let isOffline = false;
        
        // Önce IndexedDB'den dene (offline)
        if (db) {
          try {
            const tx = db.transaction('sounds', 'readonly');
            const store = tx.objectStore('sounds');
            const request = store.get(sound.id);
            
            const record = await new Promise((resolve, reject) => {
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            
            if (record && record.blob) {
              audioSrc = URL.createObjectURL(record.blob);
              isOffline = true;
              console.log(`Playing ${sound.name} from offline storage`);
            }
          } catch (dbError) {
            console.warn('IndexedDB read failed, trying online:', dbError);
          }
        }
        
        // Offline bulunamadıysa online kullan
        if (!audioSrc) {
          audioSrc = sound.src;
          console.log(`Playing ${sound.name} from online source`);
        }

        // Yeni Audio nesnesi oluştur - GLOBAL OLARAK
        currentAudio = new Audio();
        currentAudio.src = audioSrc;
        currentAudio.loop = true;
        
        // Audio event listeners - GLOBAL AUDIO İÇİN
        currentAudio.onerror = (e) => {
          console.error('Audio playback error:', e);
          const errorMsg = isOffline ? 
            `Offline audio failed for ${sound.name}. Try downloading again.` :
            `Could not load ${sound.name} from online source.`;
          showError(errorMsg);
          updateUI('stopped');
        };
        
        currentAudio.onended = () => {
          // Loop için tekrar başlat
          if (currentAudio && !currentAudio.paused) {
            currentAudio.currentTime = 0;
            currentAudio.play().catch(err => {
              console.error('Loop restart failed:', err);
              updateUI('stopped');
            });
          }
        };
        
        currentAudio.onplay = () => {
          updateUI('playing', currentSoundName, currentSoundId);
          updatePlayButton(currentSoundId, 'pause');
        };
        
        currentAudio.onpause = () => {
          updateUI('paused', currentSoundName, currentSoundId);
          updatePlayButton(currentSoundId, 'play');
        };
        
        currentAudio.onloadstart = () => {
          updateUI('loading', currentSoundName);
        };
        
        currentAudio.oncanplaythrough = () => {
          console.log(`${currentSoundName} ready to play (${isOffline ? 'offline' : 'online'})`);
        };
        
        // Play
        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        // Blob URL'i kullandıysak, audio bittiğinde temizle
        if (isOffline && audioSrc.startsWith('blob:')) {
          const originalOnPause = currentAudio.onpause;
          currentAudio.onpause = (e) => {
            if (originalOnPause) originalOnPause(e);
            setTimeout(() => {
              if (currentAudio && currentAudio.paused) {
                URL.revokeObjectURL(audioSrc);
              }
            }, 1000);
          };
        }
        
      } catch (error) {
        console.error('Play function failed:', error);
        showError(`Could not play ${sound.name}: ${error.message}`);
        updateUI('stopped');
      }
    }
    
    function updatePlayButton(soundId, action) {
      const playBtn = document.getElementById(`play-${soundId}`);
      if (!playBtn) return;
      
      const sound = soundLibrary.find(s => s.id === soundId);
      if (!sound) return;
      
      if (action === 'pause') {
        playBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="18" height="18" fill="white"><path d="M106.667,0h298.667C464.244,0,512,47.756,512,106.667v298.667C512,464.244,464.244,512,405.333,512H106.667  C47.756,512,0,464.244,0,405.333V106.667C0,47.756,47.756,0,106.667,0z"/>';
        playBtn.onclick = () => {
          if (currentAudio && currentSoundId === soundId) {
            currentAudio.pause();
          }
        };
      } else {
        playBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/></svg>';
        playBtn.onclick = () => playSound(sound);
      }
    }
    
    function resetPlayButton(soundId) {
      updatePlayButton(soundId, 'play');
    }

    // Handle browser autoplay policies
    document.addEventListener('click', function() {
      // This helps with autoplay restrictions
    }, { once: true });
    
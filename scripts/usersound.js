class UserSoundManager {
    constructor() {
        this.db = null;
        this.currentAudio = null;
        this.currentPlayingId = null;
        this.sounds = new Map();
        
        this.init();
    }

    async init() {
        await this.initDB();
        await this.loadSoundsFromDB();
        this.setupEventListeners();
    }

    // IndexedDB başlatma
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UserSoundsDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('userSounds')) {
                    const store = db.createObjectStore('userSounds', { keyPath: 'id' });
                    store.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    // Event listener'ları kurma
    setupEventListeners() {
        const uploadButton = document.getElementById('uploadButton');
        const uploadInput = document.getElementById('uploadSound');

        uploadButton.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (event) => {
            this.handleFileUpload(event);
        });
    }

    // Ses dosyası yükleme işlemi
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        
        for (const file of files) {
            if (!file.type.startsWith('audio/')) {
                console.warn(`${file.name} ses dosyası değil, atlanıyor.`);
                continue;
            }

            const soundId = await this.generateSoundId(file);
            
            // Aynı ses zaten varsa ekleme
            if (this.sounds.has(soundId)) {
                console.log(`${file.name} zaten mevcut, atlanıyor.`);
                continue;
            }

            await this.addSound(file, soundId);
        }

        // Input'u temizle
        event.target.value = '';
    }

    // Ses ID'si oluşturma (dosya içeriğine göre)
    async generateSoundId(file) {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Ses ekleme
    async addSound(file, soundId) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            const soundData = {
                id: soundId,
                name: file.name,
                type: file.type,
                size: file.size,
                data: arrayBuffer,
                uploadDate: new Date().toISOString()
            };

            // IndexedDB'ye kaydet
            await this.saveSoundToDB(soundData);
            
            // Yerel Map'e ekle
            this.sounds.set(soundId, soundData);
            
            // UI'ya ekle
            this.addSoundToUI(soundData);

            console.log(`${file.name} başarıyla eklendi.`);
        } catch (error) {
            console.error('Ses eklenirken hata:', error);
        }
    }

    // IndexedDB'ye ses kaydetme
    async saveSoundToDB(soundData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userSounds'], 'readwrite');
            const store = transaction.objectStore('userSounds');
            const request = store.put(soundData);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // IndexedDB'den sesleri yükleme
    async loadSoundsFromDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userSounds'], 'readonly');
            const store = transaction.objectStore('userSounds');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const sounds = request.result;
                sounds.forEach(sound => {
                    this.sounds.set(sound.id, sound);
                    this.addSoundToUI(sound);
                });
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    // UI'ya ses ekleme
    addSoundToUI(soundData) {
        const soundList = document.getElementById('userSoundList');
        
        // Ses öğesi oluştur
        const soundItem = document.createElement('div');
        soundItem.className = 'sound-item';
        soundItem.dataset.soundId = soundData.id;
        
        soundItem.innerHTML = `
            <div class="sound-info">
                <div class="sound-name">${this.escapeHtml(soundData.name)}</div>
                <div class="sound-details">
                    ${this.formatFileSize(soundData.size)} • ${this.formatDate(soundData.uploadDate)}
                </div>
            </div>
            <div class="sound-controls">
                            <button class="delete-button" data-sound-id="${soundData.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="18" height="18" fill="red">
<g>
	<path d="M448,85.333h-66.133C371.66,35.703,328.002,0.064,277.333,0h-42.667c-50.669,0.064-94.327,35.703-104.533,85.333H64   c-11.782,0-21.333,9.551-21.333,21.333S52.218,128,64,128h21.333v277.333C85.404,464.214,133.119,511.93,192,512h128   c58.881-0.07,106.596-47.786,106.667-106.667V128H448c11.782,0,21.333-9.551,21.333-21.333S459.782,85.333,448,85.333z    M234.667,362.667c0,11.782-9.551,21.333-21.333,21.333C201.551,384,192,374.449,192,362.667v-128   c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M320,362.667   c0,11.782-9.551,21.333-21.333,21.333c-11.782,0-21.333-9.551-21.333-21.333v-128c0-11.782,9.551-21.333,21.333-21.333   c11.782,0,21.333,9.551,21.333,21.333V362.667z M174.315,85.333c9.074-25.551,33.238-42.634,60.352-42.667h42.667   c27.114,0.033,51.278,17.116,60.352,42.667H174.315z"/>
</g>
                </button>
            
             <button class="play-button" data-sound-id="${soundData.id}">
                    <span class="play-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/></svg>
                    </span>
                    <span class="pause-icon" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="18" height="18" fill="#00bb00"><path d="M106.667,0h298.667C464.244,0,512,47.756,512,106.667v298.667C512,464.244,464.244,512,405.333,512H106.667  C47.756,512,0,464.244,0,405.333V106.667C0,47.756,47.756,0,106.667,0z"/>
                    </span>
                </button>

            </div>
        `;

        // Event listener'ları ekle
        const playButton = soundItem.querySelector('.play-button');
        const deleteButton = soundItem.querySelector('.delete-button');

        playButton.addEventListener('click', () => this.togglePlay(soundData.id));
        deleteButton.addEventListener('click', () => this.deleteSound(soundData.id));

        soundList.appendChild(soundItem);
    }

    // Ses çalma/durdurma
    async togglePlay(soundId) {
        const soundData = this.sounds.get(soundId);
        if (!soundData) return;

        // Eğer başka bir ses çalıyorsa durdur
        if (this.currentAudio && this.currentPlayingId !== soundId) {
            this.stopCurrentAudio();
        }

        // Aynı ses çalıyorsa durdur
        if (this.currentPlayingId === soundId) {
            this.stopCurrentAudio();
            return;
        }

        // Yeni sesi çal
        await this.playSound(soundId, soundData);
    }

    // Ses çalma
    async playSound(soundId, soundData) {
        try {
            const blob = new Blob([soundData.data], { type: soundData.type });
            const url = URL.createObjectURL(blob);
            
            this.currentAudio = new Audio(url);
            this.currentPlayingId = soundId;

            // Ses bittiğinde temizleme
            this.currentAudio.addEventListener('ended', () => {
                this.stopCurrentAudio();
            });

            // Hata durumunda temizleme
            this.currentAudio.addEventListener('error', (e) => {
                console.error('Ses çalma hatası:', e);
                this.stopCurrentAudio();
            });

            await this.currentAudio.play();
            this.updatePlayButton(soundId, true);

        } catch (error) {
            console.error('Ses çalınamadı:', error);
            this.stopCurrentAudio();
        }
    }

    // Mevcut sesi durdurma
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            URL.revokeObjectURL(this.currentAudio.src);
            this.currentAudio = null;
        }

        if (this.currentPlayingId) {
            this.updatePlayButton(this.currentPlayingId, false);
            this.currentPlayingId = null;
        }
    }

    // Play butonunu güncelleme
    updatePlayButton(soundId, isPlaying) {
        const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);
        if (!soundItem) return;

        const playIcon = soundItem.querySelector('.play-icon');
        const pauseIcon = soundItem.querySelector('.pause-icon');

        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }

    // Ses silme
    async deleteSound(soundId) {
        try {
            // Eğer çalıyorsa durdur
            if (this.currentPlayingId === soundId) {
                this.stopCurrentAudio();
            }

            // IndexedDB'den sil
            await this.deleteSoundFromDB(soundId);
            
            // Yerel Map'den sil
            this.sounds.delete(soundId);
            
            // UI'dan sil
            const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);
            if (soundItem) {
                soundItem.remove();
            }

            console.log('Ses başarıyla silindi.');
        } catch (error) {
            console.error('Ses silinirken hata:', error);
        }
    }

    // IndexedDB'den ses silme
    async deleteSoundFromDB(soundId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userSounds'], 'readwrite');
            const store = transaction.objectStore('userSounds');
            const request = store.delete(soundId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }


    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}
    
    
    async clearAllSounds() {
        try {
            this.stopCurrentAudio();
            
            const transaction = this.db.transaction(['userSounds'], 'readwrite');
            const store = transaction.objectStore('userSounds');
            await store.clear();
            
            this.sounds.clear();
            document.getElementById('userSoundList').innerHTML = '';
            
            console.log('Tüm sesler temizlendi.');
        } catch (error) {
            console.error('Sesler temizlenirken hata:', error);
        }
    }
}

const styles = `

    .sound-info {
        flex: 1;
    }

    .sound-name {
        font-size: 13px;
        font-weight: bold;
        margin-bottom: 4px;
        word-break: break-all;
    }

    .sound-details {
        font-size: 0.7em;
        color: #aaa;
    }

    .sound-controls {
        display: flex;
        gap: 0px;
    }

    .play-button, .delete-button {
        border: none;
        cursor: pointer;
        font-size: 16px;
    }

    .play-button {
        background: none;
    }

    .delete-button {
        background: none;
    }

    .delete-button:hover {
        background: #da190b;
    }

    #uploadButton {
        background: none;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 30px;
        margin-bottom: 5px;
    }

    #userSoundList {
        max-height: 500px;
        overflow-y: auto;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    window.userSoundManager = new UserSoundManager();
});

window.clearAllUserSounds = () => {
    if (window.userSoundManager) {
        window.userSoundManager.clearAllSounds();
    }
};
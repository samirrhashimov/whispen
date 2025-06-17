const fileInput = document.getElementById('file-input');
const pdfContainer = document.getElementById('pdf-container');
const pdfScroll = document.getElementById('pdf-scroll');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const music = document.getElementById('bg-music');
const musicStart = document.getElementById('music-start');
const musicStop = document.getElementById('music-stop');

let pdfDoc = null;  
let cssZoom = 1;  
const renderScaleBase = 2.5;  
const MAX_ZOOM = 3.5;  
const MIN_ZOOM = 0.5;  

let pageHeights = [];  
let visiblePages = new Set();
let renderingPages = new Set(); 
let scrollTimeout = null;
let isLoadingPages = false;
let currentLoadingPage = 1;

// File input'u görünür hale getir
function showFileInput() {
  
}

// File input'u gizle
function hideFileInput() {
  fileInput.style.display = 'none';
}

// Loading indicator göster
function showLoadingIndicator(pageNum, totalPages) {
  const existingIndicator = document.getElementById('loading-indicator');
  if (existingIndicator) {
    existingIndicator.textContent = `Page loading... ${pageNum}/${totalPages} `;
    return;
  }

  const indicator = document.createElement('div');
  indicator.id = 'loading-indicator';
  indicator.style.position = 'fixed';
  indicator.style.bottom = '20px';
  indicator.style.left = '50%';
  indicator.style.background = 'rgba(0, 0, 0, 0.5)';
  indicator.style.color = 'white';
  indicator.style.padding = '10px 20px';
  indicator.style.borderRadius = '5px';
  indicator.style.zIndex = '1000';
  indicator.style.fontSize = '14px';
  indicator.textContent = `Sayfa ${pageNum}/${totalPages} loading...`;
  
  document.body.appendChild(indicator);
}

// Loading indicator'ı gizle
function hideLoadingIndicator() {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Sayfa başında file input'u göster
if (!pdfDoc) {
  showFileInput();
}

fileInput.addEventListener('change', function (e) {  
  const file = e.target.files[0];  
  if (!file || file.type !== "application/pdf") {
    alert("Lütfen geçerli bir PDF dosyası seçin");
    // Input'u sıfırla
    fileInput.value = '';
    return;
  }

  // Önceki PDF'i temizle
  clearPreviousPDF();
  
  // File input'u gizle
  hideFileInput();

  const reader = new FileReader();  
  reader.onload = function () {  
    const typedarray = new Uint8Array(this.result);  
    pdfjsLib.getDocument(typedarray).promise.then(pdf => {  
      pdfDoc = pdf;  
      pageHeights = new Array(pdf.numPages).fill(0);  
      visiblePages.clear();
      renderingPages.clear();
      cssZoom = 1;
      isLoadingPages = true;
      currentLoadingPage = 1;
      
      // Container'ı sıfırla
      pdfContainer.style.transform = 'scale(1)';
      pdfContainer.style.transformOrigin = 'center center';
      
      // Input'u sıfırla - önemli!
      fileInput.value = '';
      
      // Sayfaları sıralı olarak yükle
      setTimeout(() => {
        renderPagesSequentially();
      }, 100);
    }).catch(error => {
      console.error('PDF yükleme hatası:', error);
      alert('PDF yüklenirken hata oluştu');
      fileInput.value = ''; // Hata durumunda da input'u sıfırla
      showFileInput();
    });  
  };  
  reader.readAsArrayBuffer(file);  
});

// Önceki PDF'i temizle
function clearPreviousPDF() {
  // Loading indicator'ı temizle
  hideLoadingIndicator();
  
  // Tüm canvas elementlerini kaldır
  const canvases = pdfContainer.querySelectorAll('canvas.page-canvas');
  canvases.forEach(canvas => canvas.remove());
  
  // Değişkenleri sıfırla
  pdfDoc = null;
  pageHeights = [];
  visiblePages.clear();
  renderingPages.clear();
  isLoadingPages = false;
  currentLoadingPage = 1;
  
  // Scroll pozisyonunu sıfırla
  pdfScroll.scrollTop = 0;
  pdfScroll.scrollLeft = 0;
}

// Sayfaları sıralı olarak yükle - performans için optimize edilmiş
async function renderPagesSequentially() {
  if (!pdfDoc || !isLoadingPages) return;
  
  const totalPages = pdfDoc.numPages;
  
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (!isLoadingPages) break; // Eğer başka bir PDF yükleniyorsa dur
    
    showLoadingIndicator(pageNum, totalPages);
    
    try {
      await renderPageSequential(pageNum);
      // Her sayfa arasında kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Sayfa ${pageNum} yüklenirken hata:`, error);
    }
  }
  
  hideLoadingIndicator();
  isLoadingPages = false;
  console.log('Tüm sayfalar yüklendi');
}

// Tek sayfayı yükle (Promise tabanlı)
function renderPageSequential(pageNum) {
  return new Promise((resolve, reject) => {
    if (!pdfDoc) {
      reject(new Error('PDF dokümantı bulunamadı'));
      return;
    }

    pdfDoc.getPage(pageNum).then(page => {  
      const viewport = page.getViewport({ scale: renderScaleBase });  
      const canvas = document.createElement('canvas');  
      canvas.className = 'page-canvas';  
      canvas.id = 'page-canvas-' + pageNum;  

      const ctx = canvas.getContext('2d');  
      canvas.width = viewport.width;  
      canvas.height = viewport.height;  

      const displayWidth = viewport.width / renderScaleBase;
      const displayHeight = viewport.height / renderScaleBase;

      canvas.style.width = displayWidth + 'px';  
      canvas.style.height = displayHeight + 'px';  
      canvas.style.display = 'block';
      canvas.style.marginBottom = '3px';

      pageHeights[pageNum - 1] = displayHeight;  

      page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {  
        const existingCanvas = document.getElementById(canvas.id);  
        if (!existingCanvas) {
          insertCanvasInOrder(canvas, pageNum);
        }
        
        visiblePages.add(pageNum);
        resolve(pageNum);
      }).catch(error => {
        reject(error);
      });  
    }).catch(error => {
      reject(error);
    });
  });
}

// Scroll handler - artık gereksiz ama zoom için tutalım
function handleScroll() {
  // Scroll ile sayfa yükleme artık yok - tüm sayfalar sıralı olarak yüklenmiş
  return;
}

// Canvas'ları sıralı şekilde ekle
function insertCanvasInOrder(canvas, pageNum) {
  const allCanvases = Array.from(pdfContainer.querySelectorAll('canvas.page-canvas'));
  let inserted = false;
  
  for (let i = 0; i < allCanvases.length; i++) {
    const existingId = parseInt(allCanvases[i].id.replace('page-canvas-', ''));
    if (pageNum < existingId) {
      pdfContainer.insertBefore(canvas, allCanvases[i]);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    pdfContainer.appendChild(canvas);
  }
}

// Basitleştirilmiş zoom fonksiyonu
function updateZoom() {  
  cssZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cssZoom));  
  pdfContainer.style.transform = `scale(${cssZoom})`;
  pdfContainer.style.transformOrigin = 'center center';
}  

zoomInBtn.addEventListener('click', () => {  
  cssZoom = Math.min(MAX_ZOOM, cssZoom + 0.2);  
  updateZoom();  
});  

zoomOutBtn.addEventListener('click', () => {  
  cssZoom = Math.max(MIN_ZOOM, cssZoom - 0.2);  
  updateZoom();  
});  

// Basitleştirilmiş touch kontrolleri
let isZooming = false;
let initialDistance = 0;
let initialZoom = 1;
let touchStartPos = { x: 0, y: 0 };
let scrollStartPos = { top: 0, left: 0 };

pdfContainer.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    // İki parmak - zoom modu
    isZooming = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    initialDistance = Math.sqrt(dx * dx + dy * dy);
    initialZoom = cssZoom;
    
    e.preventDefault();
  } else if (e.touches.length === 1) {
    // Tek parmak - scroll modu
    isZooming = false;
    touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    scrollStartPos = {
      top: pdfScroll.scrollTop,
      left: pdfScroll.scrollLeft
    };
  }
});

pdfContainer.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && isZooming) {
    // İki parmak zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (initialDistance > 0) {
      const scale = currentDistance / initialDistance;
      const newZoom = initialZoom * scale;
      cssZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
      updateZoom();
    }
    
    e.preventDefault();
  } else if (e.touches.length === 1 && !isZooming) {
    // Tek parmak scroll
    const deltaX = e.touches[0].clientX - touchStartPos.x;
    const deltaY = e.touches[0].clientY - touchStartPos.y;
    
    pdfScroll.scrollTop = scrollStartPos.top - deltaY;
    if (cssZoom > 1) {
      pdfScroll.scrollLeft = scrollStartPos.left - deltaX;
    }
    
    e.preventDefault();
  }
});

pdfContainer.addEventListener('touchend', (e) => {
  if (e.touches.length === 0) {
    isZooming = false;
    initialDistance = 0;
  }
});

// Mouse wheel zoom
pdfContainer.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    cssZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cssZoom + delta));
    updateZoom();
  }
});

// Scroll event listener
pdfScroll.addEventListener('scroll', handleScroll);

// ESC tuşu ile file input'u tekrar göster (yeni PDF yüklemek için)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && pdfDoc) {
    clearPreviousPDF();
    showFileInput();
  }
});

// Yeni PDF yüklemek için buton ekle (isteğe bağlı)
function addNewPDFButton() {
  if (document.getElementById('new-pdf-btn')) return;
  
  const newPdfBtn = document.createElement('button');
  newPdfBtn.id = 'new-pdf-btn';
  newPdfBtn.textContent = 'Add New PDF';
  newPdfBtn.style.position = 'fixed';
  newPdfBtn.style.top = '20px';
  newPdfBtn.style.left = '20px';
  newPdfBtn.style.zIndex = '1000';
  newPdfBtn.style.padding = '10px 15px';
  newPdfBtn.style.background = '#007bff';
  newPdfBtn.style.color = 'white';
  newPdfBtn.style.border = 'none';
  newPdfBtn.style.borderRadius = '5px';
  newPdfBtn.style.cursor = 'pointer';
  
  newPdfBtn.addEventListener('click', () => {
    clearPreviousPDF();
    showFileInput();
  });
  
  document.body.appendChild(newPdfBtn);
}

// PDF yüklendikten sonra yeni PDF butonunu ekle
function onPDFLoaded() {
  addNewPDFButton();
}
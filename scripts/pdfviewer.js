const fileInput = document.getElementById('file-input');
    const pdfContainer = document.getElementById('pdf-container');
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

    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file || file.type !== "application/pdf") return alert("PDF seçin.");

      const reader = new FileReader();
      reader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
          pdfDoc = pdf;
          pageHeights = new Array(pdf.numPages).fill(0);
          visiblePages.clear();
          renderVisiblePages();
        });
      };
      reader.readAsArrayBuffer(file);
    });

    const pdfScroll = document.getElementById('pdf-scroll');

    function renderVisiblePages() {
      const scrollTop = pdfScroll.scrollTop;
      const containerHeight = pdfScroll.clientHeight;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const top = pageHeights.slice(0, i - 1).reduce((a, b) => a + b * cssZoom, 0);
        const height = pageHeights[i - 1] * cssZoom || 800;

        if (top + height >= scrollTop - 1000 && top <= scrollTop + containerHeight + 1000) {
          if (!visiblePages.has(i)) {
            renderPage(i);
            visiblePages.add(i);
          }
        }
      }
    }

    function renderPage(pageNum) {
      pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: renderScaleBase });
        const canvas = document.createElement('canvas');
        canvas.className = 'page-canvas';
        canvas.id = 'page-canvas-' + pageNum;

        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        canvas.style.width = (viewport.width * (1 / renderScaleBase) * cssZoom) + 'px';
        canvas.style.height = (viewport.height * (1 / renderScaleBase) * cssZoom) + 'px';

        pageHeights[pageNum - 1] = viewport.height / renderScaleBase;

        page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
          const existingCanvas = document.getElementById(canvas.id);
          if (!existingCanvas) {
  // Doğru konuma ekle
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
        });
      });
    }

    function updateZoom(centerX = null, centerY = null) {
      cssZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cssZoom));

      const container = pdfContainer;
      if (centerX !== null && centerY !== null) {
        const rect = container.getBoundingClientRect();
        const x = ((centerX - rect.left) / rect.width) * 100;
        const y = ((centerY - rect.top) / rect.height) * 100;
        container.style.transformOrigin = `${x}% ${y}%`;
      } else {
        container.style.transformOrigin = 'center center';
      }
      container.style.transform = `scale(${cssZoom})`;

      // Canvas boyutlarını güncelle
      visiblePages.forEach(pageNum => {
        const canvas = document.getElementById('page-canvas-' + pageNum);
        if (canvas && pageHeights[pageNum - 1]) {
          const height = pageHeights[pageNum - 1] * cssZoom;
          const width = canvas.width * (1 / renderScaleBase) * cssZoom;
          canvas.style.height = height + 'px';
          canvas.style.width = width + 'px';
        }
      });
    }

    zoomInBtn.addEventListener('click', () => {
      cssZoom = Math.min(MAX_ZOOM, cssZoom + 0.2);
      updateZoom();
    });

    zoomOutBtn.addEventListener('click', () => {
      cssZoom = Math.max(MIN_ZOOM, cssZoom - 0.2);
      updateZoom();
    });

    // Dokunmatik zoom (pinch)
    let startDist = null;
    let lastCenter = { x: 0, y: 0 };

    pdfContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDist = Math.sqrt(dx * dx + dy * dy);
        lastCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
      }
    });

    pdfContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && startDist !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const delta = (newDist - startDist) * 0.005;
        cssZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cssZoom + delta));
        updateZoom(lastCenter.x, lastCenter.y);
        startDist = newDist;
        if (e.cancelable) e.preventDefault();
      }
    });

    pdfContainer.addEventListener('touchend', () => {
      startDist = null;
    });

    // Scroll ile görünür sayfaları yükle
    pdfScroll.addEventListener('scroll', () => {
      if (pdfDoc) renderVisiblePages();
    });
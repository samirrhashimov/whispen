function showNotifier(message) {
  const panel = document.getElementById("notifier");
  const text = document.getElementById("notifier-message");
  text.textContent = message;
  panel.style.display = "flex";
}

function closeNotifier() {
  document.getElementById("notifier").style.display = "none";
}

async function checkNotifier() {
  try {
    const res = await fetch("config.json"); // kendi hostunda olacak
    const data = await res.json();
    if (data.active) {
      showNotifier(data.message);
    } else {
      closeNotifier();
    }
  } catch (e) {
    console.error("Config alınamadı:", e);
  }
}

// ilk yüklemede çalıştır
checkNotifier();
// her 60 saniyede bir kontrol et
setInterval(checkNotifier, 60000);
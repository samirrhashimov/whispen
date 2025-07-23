// 1. Will run when page loads
document.addEventListener('DOMContentLoaded', () => {
  const languageSelector = document.getElementById('languageSelect');
  const savedLang = localStorage.getItem('language') || 'en';

  // Set the select box to the saved language
  if (languageSelector) {
    languageSelector.value = savedLang;

    // Update when language selection changes
    languageSelector.addEventListener('change', function () {
      const selectedLang = this.value;
      localStorage.setItem('language', selectedLang);
      applyLanguage(selectedLang);
    });
  }

  // Apply language on page load
  applyLanguage(savedLang);
});







//time set 
function getTimeKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// Language application function
function applyLanguage(lang) {
  fetch('lang.json')
    .then(res => res.json())
    .then(data => {
      const translations = data[lang];
      if (!translations) return;

      const timeKey = getTimeKey();

      // Translate greeting based on time
      const greetingElement = document.querySelector('[data-i18n="greeting"]');
      if (greetingElement && translations[timeKey]) {
        greetingElement.textContent = translations[timeKey];
      }

      // Translate other regular texts
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        // Skip greeting, we already handled it
        if (key === "greeting") return;

        if (translations[key]) {
          el.textContent = translations[key];
        }
      });

      // Translate placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
          el.setAttribute('placeholder', translations[key]);
        }
      });
    })
    .catch(err => {
      console.error('Could not load language file', err);
    });
}



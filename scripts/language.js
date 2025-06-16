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

// 2. Language application function
function applyLanguage(lang) {
  fetch('lang.json')
    .then(res => res.json())
    .then(data => {
      const translations = data[lang];
      if (!translations) return;

      // Translate regular texts
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
          el.textContent = translations[key];
        }
      });

      // Placeholder translate
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



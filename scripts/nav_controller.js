document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('iframeOverlay');

  const menuConfigs = [
    { buttonId: 'libraryBtn', menuId: 'library' },
    { buttonId: 'noteMenuBtn', menuId: 'noteMenu' },
    { buttonId: 'themesBtn', menuId: 'themesdiv' },
    { buttonId: 'ambientBtn', menuId: 'ambientdiv' },
    { buttonId: 'settingsBtn', menuId: 'settingsMenu' },
  ];

  function closeAllMenus() {
    menuConfigs.forEach(({ menuId }) => {
      const menu = document.getElementById(menuId);
      if (menu) menu.classList.remove('open');
    });
    if (overlay) overlay.style.display = 'none';
  }

  menuConfigs.forEach(({ buttonId, menuId }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (!button || !menu) return;

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      const isOpen = menu.classList.contains('open');
      closeAllMenus();

      if (!isOpen) {
        menu.classList.add('open');
        if (overlay) overlay.style.display = 'block';
      }
    });

    // 💡 Menü içindeki tüm tıklamaları durdur
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 💡 Menü içindeki tüm çocuklara da yayılmayı durdur
    const children = menu.querySelectorAll('*');
    children.forEach((child) => {
      child.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  });

  // Sayfa ya da overlay'e tıklanınca menüler kapanır
  document.addEventListener('click', () => {
    closeAllMenus();
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      closeAllMenus();
    });
  }
});
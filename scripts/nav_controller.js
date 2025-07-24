document.addEventListener('DOMContentLoaded', function () {
  const menus = [
    { buttonId: 'libraryBtn', menuId: 'library' },
    { buttonId: 'noteMenuBtn', menuId: 'noteMenu' },
    { buttonId: 'themesBtn', menuId: 'themesdiv' },
    { buttonId: 'ambientBtn', menuId: 'ambientdiv' },
    { buttonId: 'settingsBtn', menuId: 'settingsMenu' }
  ];

  const overlay = document.getElementById('iframeOverlay');

  function closeAllMenus() {
    menus.forEach(({ menuId }) => {
      const menu = document.getElementById(menuId);
      if (menu) menu.classList.remove('open');
    });

    // overlay'i gizle
    if (overlay) overlay.style.display = 'none';
  }

  menus.forEach(({ buttonId, menuId }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (button && menu) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();

        const isOpen = menu.classList.contains('open');
        closeAllMenus();

        if (!isOpen) {
          menu.classList.add('open');
          if (overlay) overlay.style.display = 'block';
        }
      });

      menu.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    }
  });

  // Sayfa dışı tıklamada menüyü kapat
  document.addEventListener('click', closeAllMenus);

  // Overlay'e tıklanırsa da menüyü kapat
  if (overlay) {
    overlay.addEventListener('click', closeAllMenus);
  }
});
(function() {
  'use strict';
  
  let menuElement = null;
  let isMenuVisible = false;
  
  const cursors = [
    { id: 'circle', name: 'Cercle', color: '#ffb8d9', emoji: '○' },
    { id: 'arrow', name: 'Flèche', color: '#b8e1ff', emoji: '▷' },
    { id: 'square', name: 'Carré', color: '#c5b8ff', emoji: '◇' },
    { id: 'diamond', name: 'Losange', color: '#b8ffd6', emoji: '◈' },
    { id: 'cross', name: 'Croix', color: '#ffddb8', emoji: '+' },
    { id: 'heart', name: 'Cœur', color: '#ffb8b8', emoji: '♥' }
  ];
  
  function createMenu() {
    menuElement = document.createElement('div');
    menuElement.className = 'float-cursor-menu';
    menuElement.innerHTML = `
      <h3>FloatCursor</h3>
      <div class="menu-cursor-options" id="menuCursorOptions">
        <!-- Les options seront ajoutées dynamiquement -->
      </div>
      <div class="menu-actions">
        <button class="menu-btn primary" id="menuApply">Appliquer</button>
        <button class="menu-btn secondary" id="menuClose">Fermer</button>
      </div>
    `;
    
    document.body.appendChild(menuElement);
    
    const cursorOptions = document.getElementById('menuCursorOptions');
    cursors.forEach(cursor => {
      const option = document.createElement('div');
      option.className = 'menu-cursor-option';
      option.dataset.id = cursor.id;
      
      option.innerHTML = `
        <div class="menu-cursor-preview" style="background-color: ${cursor.color}">
          ${cursor.emoji}
        </div>
        <span class="menu-cursor-name">${cursor.name}</span>
      `;
      
      option.addEventListener('click', function() {
        document.querySelectorAll('.menu-cursor-option').forEach(item => {
          item.style.background = '';
        });
        this.style.background = 'rgba(126, 107, 201, 0.1)';
        
        menuElement.dataset.selectedCursor = cursor.id;
      });
      
      cursorOptions.appendChild(option);
    });
    
    document.getElementById('menuApply').addEventListener('click', applySelectedCursor);
    document.getElementById('menuClose').addEventListener('click', hideMenu);
    
    document.addEventListener('click', handleOutsideClick);
    
    document.addEventListener('keydown', handleKeyDown);
  }
  
  function showMenu() {
    if (!menuElement) {
      createMenu();
    }
    
    menuElement.classList.add('active');
    isMenuVisible = true;
    
    menuElement.style.right = '20px';
    menuElement.style.top = '60px';
  }
  
  function hideMenu() {
    if (menuElement) {
      menuElement.classList.remove('active');
      isMenuVisible = false;
    }
  }
  
  function handleOutsideClick(e) {
    if (isMenuVisible && menuElement && !menuElement.contains(e.target)) {
      hideMenu();
    }
  }
  
  function handleKeyDown(e) {
    if (e.key === 'Escape' && isMenuVisible) {
      hideMenu();
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      if (isMenuVisible) {
        hideMenu();
      } else {
        showMenu();
      }
    }
  }
  
  function applySelectedCursor() {
    const selectedCursorId = menuElement.dataset.selectedCursor || 'circle';
    
    chrome.runtime.sendMessage({
      action: 'changeCursor',
      cursorId: selectedCursorId
    });

    chrome.storage.sync.set({ selectedCursor: selectedCursorId });
    
    hideMenu();
  }

  function initShortcut() {
    document.addEventListener('keydown', handleKeyDown);
  }
  
  function initMenu() {
    chrome.storage.sync.get(['floatCursorEnabled'], function(data) {
      if (data.floatCursorEnabled !== false) {
        initShortcut();
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();
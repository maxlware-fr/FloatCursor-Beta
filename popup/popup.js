document.addEventListener('DOMContentLoaded', function() {
  const defaultCursors = [
    { id: 'circle', name: 'Cercle', color: '#ffb8d9', emoji: '○', type: 'default' },
    { id: 'arrow', name: 'Flèche', color: '#b8e1ff', emoji: '▷', type: 'default' },
    { id: 'square', name: 'Carré', color: '#c5b8ff', emoji: '◇', type: 'default' },
    { id: 'diamond', name: 'Losange', color: '#b8ffd6', emoji: '◈', type: 'default' },
    { id: 'cross', name: 'Croix', color: '#ffddb8', emoji: '+', type: 'default' },
    { id: 'heart', name: 'Cœur', color: '#ffb8b8', emoji: '♥', type: 'default' }
  ];
  
  const cursorGrid = document.getElementById('cursorGrid');
  const customCursorsList = document.getElementById('customCursorsList');
  const toggleExtension = document.getElementById('toggleExtension');
  const autoChange = document.getElementById('autoChange');
  const clickAnimation = document.getElementById('clickAnimation');
  const darkMode = document.getElementById('darkMode');
  const resetDefault = document.getElementById('resetDefault');
  const currentSiteInfo = document.getElementById('currentSiteInfo');
  const assignCursor = document.getElementById('assignCursor');
  const addCustomCursor = document.getElementById('addCustomCursor');
  const themeToggle = document.getElementById('themeToggle');
  const openWelcome = document.getElementById('openWelcome');
  const openDocs = document.getElementById('openDocs');
  const exportSettings = document.getElementById('exportSettings');
  const importSettings = document.getElementById('importSettings');
  
  const addCursorModal = document.getElementById('addCursorModal');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const saveCustomCursor = document.getElementById('saveCustomCursor');
  const cursorTypeRadios = document.querySelectorAll('input[name="cursorType"]');
  const cssCodeGroup = document.getElementById('cssCodeGroup');
  const imageUploadGroup = document.getElementById('imageUploadGroup');
  const cursorImage = document.getElementById('cursorImage');
  const imagePreview = document.getElementById('imagePreview');
  
  let customCursors = [];
  let currentTheme = 'dark';
  
  init();
  
  async function init() {
    await loadSettings();

    renderCursorGrid();
    renderCustomCursorsList();

    themeToggle.addEventListener('click', toggleTheme);

    toggleExtension.addEventListener('change', saveSetting);
    autoChange.addEventListener('change', saveSetting);
    clickAnimation.addEventListener('change', saveSetting);
    darkMode.addEventListener('change', saveSetting);

    resetDefault.addEventListener('click', resetToDefault);
    assignCursor.addEventListener('click', assignCursorToSite);
    addCustomCursor.addEventListener('click', () => showModal());
    openWelcome.addEventListener('click', openWelcomePage);
    openDocs.addEventListener('click', openDocsPage);
    exportSettings.addEventListener('click', exportSettingsToFile);
    importSettings.addEventListener('click', importSettingsFromFile);

    closeModalButtons.forEach(btn => {
      btn.addEventListener('click', () => hideModal());
    });
    
    cursorTypeRadios.forEach(radio => {
      radio.addEventListener('change', handleCursorTypeChange);
    });
    
    cursorImage.addEventListener('change', handleImageUpload);
    saveCustomCursor.addEventListener('click', saveCustomCursorHandler);

    addCursorModal.addEventListener('click', (e) => {
      if (e.target === addCursorModal) hideModal();
    });

    updateCurrentSiteInfo();
  }
  
  async function loadSettings() {
    const data = await chrome.storage.sync.get([
      'floatCursorEnabled',
      'selectedCursor',
      'autoChangeEnabled',
      'clickAnimationEnabled',
      'darkModeEnabled',
      'customCursors',
      'siteAssignments',
      'theme'
    ]);

    currentTheme = data.theme || 'dark';
    document.body.className = currentTheme + '-theme';

    toggleExtension.checked = data.floatCursorEnabled !== false;
    autoChange.checked = data.autoChangeEnabled !== false;
    clickAnimation.checked = data.clickAnimationEnabled !== false;
    darkMode.checked = data.darkModeEnabled !== false;

    customCursors = data.customCursors || [];
  }
  
  function renderCursorGrid() {
    cursorGrid.innerHTML = '';

    defaultCursors.forEach(cursor => {
      const cursorItem = createCursorItem(cursor);
      cursorGrid.appendChild(cursorItem);
    });

    customCursors.forEach(cursor => {
      const cursorItem = createCursorItem(cursor);
      cursorGrid.appendChild(cursorItem);
    });
  }
  
  function renderCustomCursorsList() {
    customCursorsList.innerHTML = '';
    
    if (customCursors.length === 0) {
      customCursorsList.innerHTML = `
        <div class="empty-state">
          <span>🎨</span>
          <p>Aucun curseur personnalisé</p>
        </div>
      `;
      return;
    }
    
    customCursors.forEach(cursor => {
      const item = document.createElement('div');
      item.className = 'custom-cursor-item';
      item.innerHTML = `
        <div class="custom-cursor-preview" style="background-color: ${cursor.color}">
          ${cursor.type === 'image' ? '🖼️' : '🎨'}
        </div>
        <span class="cursor-name">${cursor.name}</span>
        <button class="cursor-remove" data-id="${cursor.id}">×</button>
      `;
      
      customCursorsList.appendChild(item);
    });

    document.querySelectorAll('.cursor-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cursorId = btn.dataset.id;
        removeCustomCursor(cursorId);
      });
    });
  }
  
  function createCursorItem(cursor) {
    const cursorItem = document.createElement('div');
    cursorItem.className = 'cursor-item';
    cursorItem.dataset.id = cursor.id;
    
    let previewContent = cursor.emoji || '🎨';
    if (cursor.type === 'image' && cursor.imageData) {
      previewContent = `<img src="${cursor.imageData}" alt="${cursor.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
    }
    
    cursorItem.innerHTML = `
      <div class="cursor-preview" style="background-color: ${cursor.color}">
        ${previewContent}
      </div>
      <span class="cursor-name">${cursor.name}</span>
      ${cursor.type === 'custom' ? '<button class="cursor-remove">×</button>' : ''}
    `;
    
    cursorItem.addEventListener('click', function() {
      if (cursor.type === 'custom' && this.querySelector('.cursor-remove').contains(event.target)) {
        return;
      }
      
      document.querySelectorAll('.cursor-item').forEach(item => {
        item.classList.remove('active');
      });
      this.classList.add('active');

      chrome.storage.sync.set({ selectedCursor: cursor.id }, () => {
        updateActiveTabCursor(cursor.id);
      });
    });

    if (cursor.type === 'custom') {
      const removeBtn = cursorItem.querySelector('.cursor-remove');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomCursor(cursor.id);
      });
    }
    
    return cursorItem;
  }
  
  function removeCustomCursor(cursorId) {
    if (confirm('Supprimer ce curseur personnalisé ?')) {
      customCursors = customCursors.filter(c => c.id !== cursorId);
      chrome.storage.sync.set({ customCursors }, () => {
        renderCursorGrid();
        renderCustomCursorsList();
      });
    }
  }
  
  function updateActiveTabCursor(cursorId) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'changeCursor',
          cursorId: cursorId
        });
      }
    });
  }
  
  function saveSetting() {
    const settings = {
      floatCursorEnabled: toggleExtension.checked,
      autoChangeEnabled: autoChange.checked,
      clickAnimationEnabled: clickAnimation.checked,
      darkModeEnabled: darkMode.checked
    };
    
    chrome.storage.sync.set(settings);
  }
  
  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.className = currentTheme + '-theme';
    chrome.storage.sync.set({ theme: currentTheme });
  }
  
  function updateCurrentSiteInfo() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        
        chrome.storage.sync.get(['selectedCursor', 'siteAssignments'], (data) => {
          const siteAssignments = data.siteAssignments || {};
          const currentCursor = siteAssignments[hostname] || data.selectedCursor || 'circle';
          
          currentSiteInfo.innerHTML = `
            <div class="site-url">${hostname || "Site inconnu"}</div>
            <div class="site-cursor">Curseur: <span class="cursor-name">${currentCursor}</span></div>
          `;
        });
      }
    });
  }
  
  function assignCursorToSite() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        
        chrome.storage.sync.get(['selectedCursor', 'siteAssignments'], (data) => {
          const selectedCursor = data.selectedCursor || 'circle';
          const siteAssignments = data.siteAssignments || {};

          const allCursors = [...defaultCursors, ...customCursors];
          const cursor = allCursors.find(c => c.id === selectedCursor) || defaultCursors[0];

          siteAssignments[hostname] = selectedCursor;
          
          chrome.storage.sync.set({ siteAssignments }, () => {
            updateCurrentSiteInfo();
            updateActiveTabCursor(selectedCursor);

            showNotification(`Curseur "${cursor.name}" assigné à ${hostname}`);
          });
        });
      }
    });
  }
  
  function resetToDefault() {
    if (confirm('Réinitialiser tous les paramètres par défaut ?')) {
      chrome.storage.sync.set({
        floatCursorEnabled: true,
        selectedCursor: 'circle',
        autoChangeEnabled: true,
        clickAnimationEnabled: true,
        darkModeEnabled: true,
        customCursors: [],
        siteAssignments: {},
        theme: 'dark'
      }, () => {
        loadSettings().then(() => {
          renderCursorGrid();
          renderCustomCursorsList();
          updateCurrentSiteInfo();
          
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.reload(tabs[0].id);
            }
          });
          
          showNotification('Paramètres réinitialisés avec succès');
        });
      });
    }
  }
  
  function showModal() {
    addCursorModal.classList.add('active');
    document.getElementById('cursorName').value = '';
    document.getElementById('cursorCSS').value = '';
    document.getElementById('cursorColor').value = '#ff6b6b';
    imagePreview.innerHTML = '<span>Aperçu de l\'image</span>';
  }
  
  function hideModal() {
    addCursorModal.classList.remove('active');
  }
  
  function handleCursorTypeChange() {
    const type = document.querySelector('input[name="cursorType"]:checked').value;
    cssCodeGroup.classList.toggle('hidden', type !== 'css');
    imageUploadGroup.classList.toggle('hidden', type !== 'image');
  }
  
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.innerHTML = `<img src="${event.target.result}" alt="Aperçu">`;
    };
    reader.readAsDataURL(file);
  }
  
  function saveCustomCursorHandler() {
    const name = document.getElementById('cursorName').value.trim();
    const type = document.querySelector('input[name="cursorType"]:checked').value;
    const color = document.getElementById('cursorColor').value;
    
    if (!name) {
      alert('Veuillez donner un nom au curseur');
      return;
    }
    
    const cursorData = {
      id: 'custom_' + Date.now(),
      name,
      type: 'custom',
      cursorType: type,
      color,
      createdAt: new Date().toISOString()
    };
    
    if (type === 'css') {
      const css = document.getElementById('cursorCSS').value.trim();
      if (!css) {
        alert('Veuillez ajouter du code CSS');
        return;
      }
      cursorData.css = css;
    } else if (type === 'image') {
      const file = cursorImage.files[0];
      if (!file) {
        alert('Veuillez sélectionner une image');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        cursorData.imageData = event.target.result;
        cursorData.imageType = file.type;
        saveCustomCursorToStorage(cursorData);
      };
      reader.readAsDataURL(file);
      return;
    }
    
    saveCustomCursorToStorage(cursorData);
  }
  
  function saveCustomCursorToStorage(cursorData) {
    customCursors.push(cursorData);
    chrome.storage.sync.set({ customCursors }, () => {
      renderCursorGrid();
      renderCustomCursorsList();
      hideModal();
      showNotification(`Curseur "${cursorData.name}" ajouté avec succès`);
    });
  }
  
  function openWelcomePage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome/welcome.html') });
  }
  
  function openDocsPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('docs/docs.html') });
  }
  
  function exportSettingsToFile() {
    chrome.storage.sync.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'floatcursor-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Paramètres exportés avec succès');
    });
  }
  
  function importSettingsFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          chrome.storage.sync.set(data, () => {
            showNotification('Paramètres importés avec succès');
            setTimeout(() => {
              chrome.runtime.reload();
            }, 1000);
          });
        } catch (error) {
          alert('Fichier invalide. Veuillez importer un fichier JSON valide.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});
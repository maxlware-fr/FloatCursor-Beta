(function() {
  'use strict';
  
  let cursorElement = null;
  let isCursorEnabled = true;
  let currentCursorId = 'circle';
  let currentCursorData = null;
  let clickAnimationEnabled = true;
  let isMouseDown = false;
  let customCursors = {};
  
  const colorPalette = [
    '#ffb8d9', '#b8e1ff', '#c5b8ff', '#b8ffd6',
    '#ffddb8', '#ffb8b8', '#e1b8ff', '#b8fff9'
  ];
  
  function initFloatCursor() {
    chrome.storage.sync.get([
      'floatCursorEnabled', 
      'selectedCursor', 
      'clickAnimationEnabled',
      'autoChangeEnabled',
      'siteAssignments',
      'customCursors'
    ], function(data) {
      isCursorEnabled = data.floatCursorEnabled !== false;
      currentCursorId = data.selectedCursor || 'circle';
      clickAnimationEnabled = data.clickAnimationEnabled !== false;
      customCursors = data.customCursors || [];
      
      customCursors.forEach(cursor => {
        if (cursor.css) {
          // Injecter le CSS personnalisé
          const style = document.createElement('style');
          style.id = `floatcursor-custom-${cursor.id}`;
          style.textContent = cursor.css;
          document.head.appendChild(style);
        }
      });
      
      if (data.autoChangeEnabled !== false) {
        const hostname = window.location.hostname;
        const siteAssignments = data.siteAssignments || {};
        
        if (siteAssignments[hostname]) {
          currentCursorId = siteAssignments[hostname];
        } else {
          selectCursorByHostname(hostname);
        }
      }
      
      findCursorData(currentCursorId);
      
      if (isCursorEnabled) {
        applyCursor();
      }
    });
  }
  
  function findCursorData(cursorId) {
    const customCursor = customCursors.find(c => c.id === cursorId);
    if (customCursor) {
      currentCursorData = customCursor;
      return;
    }
    
    const defaultCursors = [
      { id: 'circle', name: 'Cercle', color: '#ffb8d9', emoji: '○' },
      { id: 'arrow', name: 'Flèche', color: '#b8e1ff', emoji: '▷' },
      { id: 'square', name: 'Carré', color: '#c5b8ff', emoji: '◇' },
      { id: 'diamond', name: 'Losange', color: '#b8ffd6', emoji: '◈' },
      { id: 'cross', name: 'Croix', color: '#ffddb8', emoji: '+' },
      { id: 'heart', name: 'Cœur', color: '#ffb8b8', emoji: '♥' }
    ];
    
    const defaultCursor = defaultCursors.find(c => c.id === cursorId) || defaultCursors[0];
    currentCursorData = defaultCursor;
  }
  
  function selectCursorByHostname(hostname) {
    let hash = 0;
    for (let i = 0; i < hostname.length; i++) {
      hash = ((hash << 5) - hash) + hostname.charCodeAt(i);
      hash = hash & hash;
    }
    
    const allCursors = customCursors.length > 0 ? 
      ['circle', 'arrow', 'square', 'diamond', 'cross', 'heart', ...customCursors.map(c => c.id)] :
      ['circle', 'arrow', 'square', 'diamond', 'cross', 'heart'];
    
    const cursorIndex = Math.abs(hash) % allCursors.length;
    currentCursorId = allCursors[cursorIndex];
    
    const colorIndex = Math.abs(hash) % colorPalette.length;
    if (currentCursorData) {
      currentCursorData.color = colorPalette[colorIndex];
    }
  }
  
  function applyCursor() {
    cursorElement = document.createElement('div');
    
    let cursorClass = 'float-cursor';
    
    if (currentCursorData && currentCursorData.cursorType === 'image') {
      cursorClass += ' custom-image-cursor';
    } else if (currentCursorData && currentCursorData.cursorType === 'css') {
      cursorClass += ' custom-cursor';
    } else {
      cursorClass += ' ' + currentCursorId;
    }
    
    cursorElement.className = cursorClass;
    
    if (currentCursorData) {
      if (currentCursorData.cursorType === 'image' && currentCursorData.imageData) {
        cursorElement.style.backgroundImage = `url('${currentCursorData.imageData}')`;
        cursorElement.style.backgroundSize = 'contain';
        cursorElement.style.backgroundRepeat = 'no-repeat';
        cursorElement.style.width = '32px';
        cursorElement.style.height = '32px';
      } else {
        cursorElement.style.color = currentCursorData.color || '#ffb8d9';
      }
    }
    
    cursorElement.id = 'float-cursor-main';
    
    document.body.appendChild(cursorElement);
    
    document.body.classList.add('float-cursor-active');
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick);
    
    document.addEventListener('mouseleave', () => {
      if (cursorElement) {
        cursorElement.style.opacity = '0';
      }
    });
    
    document.addEventListener('mouseenter', () => {
      if (cursorElement) {
        cursorElement.style.opacity = '1';
      }
    });
    
    cursorElement.style.left = '0px';
    cursorElement.style.top = '0px';
    
    enhanceInteractiveElements();
  }
  
  function enhanceInteractiveElements() {
    const interactiveSelectors = [
      'a', 'button', 'input', 'textarea', 'select',
      '[role="button"]', '[tabindex]', '.clickable'
    ];
    
    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelectors.join(',')).forEach(el => {
        if (!el.hasAttribute('data-floatcursor-enhanced')) {
          el.setAttribute('data-floatcursor-enhanced', 'true');
          
          el.addEventListener('mouseenter', () => {
            if (cursorElement) {
              cursorElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            }
          });
          
          el.addEventListener('mouseleave', () => {
            if (cursorElement && !isMouseDown) {
              cursorElement.style.transform = 'translate(-50%, -50%) scale(1)';
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  function handleMouseMove(e) {
    if (!cursorElement) return;
    
    requestAnimationFrame(() => {
      cursorElement.style.left = `${e.clientX}px`;
      cursorElement.style.top = `${e.clientY}px`;
      
      if (isMouseDown) {
        cursorElement.style.transform = `translate(-50%, -50%) scale(0.8)`;
      } else {
        cursorElement.style.transform = `translate(-50%, -50%) scale(1)`;
      }
    });
  }
  
  function handleMouseDown() {
    isMouseDown = true;
    if (cursorElement) {
      cursorElement.style.transform = `translate(-50%, -50%) scale(0.8)`;
    }
  }
  
  function handleMouseUp() {
    isMouseDown = false;
    if (cursorElement) {
      cursorElement.style.transform = `translate(-50%, -50%) scale(1)`;
    }
  }
  
  function handleClick(e) {
    if (!clickAnimationEnabled || !cursorElement) return;
    
    const clickAnimation = document.createElement('div');
    clickAnimation.className = 'click-animation';
    clickAnimation.style.left = `${e.clientX}px`;
    clickAnimation.style.top = `${e.clientY}px`;
    clickAnimation.style.color = currentColor;
    
    document.body.appendChild(clickAnimation);
    
    setTimeout(() => {
      if (clickAnimation.parentNode) {
        clickAnimation.parentNode.removeChild(clickAnimation);
      }
    }, 500);
  }
  
  function cleanupFloatCursor() {
    if (cursorElement && cursorElement.parentNode) {
      cursorElement.parentNode.removeChild(cursorElement);
      cursorElement = null;
    }
    
    document.body.classList.remove('float-cursor-active');
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('click', handleClick);
    
    document.querySelectorAll('[id^="floatcursor-custom-"]').forEach(el => {
      el.remove();
    });
  }
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'changeCursor') {
      currentCursorId = request.cursorId;
      findCursorData(currentCursorId);
      
      if (cursorElement) {
        let cursorClass = 'float-cursor';
        
        if (currentCursorData && currentCursorData.cursorType === 'image') {
          cursorClass += ' custom-image-cursor';
        } else if (currentCursorData && currentCursorData.cursorType === 'css') {
          cursorClass += ' custom-cursor';
        } else {
          cursorClass += ' ' + currentCursorId;
        }
        
        cursorElement.className = cursorClass;
        
        if (currentCursorData) {
          if (currentCursorData.cursorType === 'image' && currentCursorData.imageData) {
            cursorElement.style.backgroundImage = `url('${currentCursorData.imageData}')`;
            cursorElement.style.color = '';
          } else {
            cursorElement.style.color = currentCursorData.color || '#ffb8d9';
            cursorElement.style.backgroundImage = '';
          }
        }
      }
      
      sendResponse({success: true});
    }
    
    if (request.action === 'toggleCursor') {
      isCursorEnabled = request.enabled;
      
      if (isCursorEnabled && !cursorElement) {
        applyCursor();
      } else if (!isCursorEnabled && cursorElement) {
        cleanupFloatCursor();
      }
      
      sendResponse({success: true});
    }
    
    if (request.action === 'getCursorInfo') {
      sendResponse({
        currentCursorId,
        currentCursorData,
        isEnabled: isCursorEnabled
      });
    }
  });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatCursor);
  } else {
    initFloatCursor();
  }
})();

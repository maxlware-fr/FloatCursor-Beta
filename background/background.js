chrome.runtime.onInstalled.addListener(() => {
  console.log('FloatCursor installé avec succès!');
  
  chrome.storage.sync.set({
    floatCursorEnabled: true,
    selectedCursor: 'circle',
    autoChangeEnabled: true,
    clickAnimationEnabled: true,
    siteAssignments: {}
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'changeCursor') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'changeCursor',
          cursorId: request.cursorId
        });
      }
    });
    
    sendResponse({success: true});
  }
  
  return true;
});

// Mettre à jour l'icône de l'extension en fonction de l'état
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.floatCursorEnabled) {
    const isEnabled = changes.floatCursorEnabled.newValue;

    if (isEnabled) {
      chrome.action.setBadgeText({text: 'ON'});
      chrome.action.setBadgeBackgroundColor({color: '#7e6bc9'});
    } else {
      chrome.action.setBadgeText({text: 'OFF'});
      chrome.action.setBadgeBackgroundColor({color: '#9d94b5'});
    }
  }
});

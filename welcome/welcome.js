document.addEventListener('DOMContentLoaded', function() {
  const openPopupBtn = document.getElementById('openPopup');
  const openDocsBtn = document.getElementById('openDocs');
  const startTutorialBtn = document.getElementById('startTutorial');
  const feedbackBtn = document.getElementById('feedback');
  const reportIssueBtn = document.getElementById('reportIssue');
  const viewSourceBtn = document.getElementById('viewSource');
  
  openPopupBtn.addEventListener('click', function() {
    chrome.action.openPopup();
  });
  
  openDocsBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('docs/docs.html') });
  });
  
  startTutorialBtn.addEventListener('click', function() {
    showTutorial();
  });
  
  feedbackBtn.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({ 
      url: 'https://forms.gle/your-feedback-form-link' 
    });
  });
  
  reportIssueBtn.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({ 
      url: 'https://github.com/your-username/floatcursor/issues' 
    });
  });
  
  viewSourceBtn.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({ 
      url: 'https://github.com/your-username/floatcursor' 
    });
  });
  
  function showTutorial() {
    const steps = [
      {
        title: "Bienvenue dans le tutoriel FloatCursor",
        content: "Nous allons vous guider à travers les fonctionnalités principales de l'extension.",
        position: "center"
      },
      {
        title: "L'icône de l'extension",
        content: "Cliquez sur l'icône FloatCursor dans votre barre d'outils Chrome pour ouvrir les paramètres.",
        position: "top"
      },
      {
        title: "Choisir un curseur",
        content: "Sélectionnez un curseur parmi les options disponibles. Vous pouvez aussi créer vos propres curseurs !",
        position: "center"
      },
      {
        title: "Mode sombre/clair",
        content: "Basculer entre les thèmes sombre et clair selon vos préférences.",
        position: "bottom"
      },
      {
        title: "Raccourci clavier",
        content: "Appuyez sur Ctrl+Shift+C pour ouvrir rapidement le menu des curseurs sur n'importe quel site.",
        position: "center"
      }
    ];
    
    let currentStep = 0;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: var(--bg-secondary);
      border-radius: var(--radius);
      padding: 30px;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    function showStep(stepIndex) {
      if (stepIndex >= steps.length) {
        document.body.removeChild(overlay);
        return;
      }
      
      const step = steps[stepIndex];
      
      dialog.innerHTML = `
        <h3 style="margin-bottom: 20px; color: var(--primary); font-size: 24px;">${step.title}</h3>
        <p style="margin-bottom: 30px; color: var(--text-secondary); line-height: 1.6;">${step.content}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-muted);">${stepIndex + 1}/${steps.length}</span>
          <div style="display: flex; gap: 10px;">
            ${stepIndex > 0 ? '<button class="tutorial-btn" id="prevBtn">Précédent</button>' : ''}
            <button class="tutorial-btn primary" id="nextBtn">
              ${stepIndex === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      `;
      
      dialog.style.position = 'absolute';
      switch(step.position) {
        case 'top':
          dialog.style.top = '100px';
          break;
        case 'bottom':
          dialog.style.bottom = '100px';
          dialog.style.top = 'auto';
          break;
        default:
          dialog.style.top = '50%';
          dialog.style.transform = 'translateY(-50%)';
      }
      
      document.getElementById('nextBtn').addEventListener('click', () => {
        showStep(stepIndex + 1);
      });
      
      if (stepIndex > 0) {
        document.getElementById('prevBtn').addEventListener('click', () => {
          showStep(stepIndex - 1);
        });
      }
    }
    
    const style = document.createElement('style');
    style.textContent = `
      .tutorial-btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-tertiary);
        color: var(--text-primary);
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .tutorial-btn:hover {
        background: var(--border-color);
      }
      
      .tutorial-btn.primary {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
      
      .tutorial-btn.primary:hover {
        background: var(--primary-dark);
      }
    `;
    document.head.appendChild(style);
    
    showStep(0);
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
      }
    });
  }
  
  const demoCursors = document.querySelectorAll('.cursor-demo');
  demoCursors.forEach((cursor, index) => {
    cursor.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(1.1)';
    });
    
    cursor.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
    });
  });
});
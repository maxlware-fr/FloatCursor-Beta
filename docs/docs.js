document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const backToWelcome = document.getElementById('backToWelcome');
  const openSettings = document.getElementById('openSettings');

  chrome.storage.sync.get(['theme'], function(data) {
    const theme = data.theme || 'dark';
    document.body.className = theme + '-theme';
  });

  themeToggle.addEventListener('click', function() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.className = newTheme + '-theme';
    chrome.storage.sync.set({ theme: newTheme });
  });

  backToWelcome.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome/welcome.html') });
  });

  openSettings.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.action.openPopup();
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const correspondingLink = document.querySelector(`.sidebar-nav a[href="#${id}"]`);
        
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
          link.style.background = '';
          link.style.color = '';
        });
        
        if (correspondingLink) {
          correspondingLink.style.background = 'var(--primary)';
          correspondingLink.style.color = 'white';
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.doc-section article').forEach(article => {
    if (article.id) {
      observer.observe(article);
    }
  });

  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.innerHTML = '↑';
  scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(scrollToTopBtn);
  
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollToTopBtn.style.display = 'flex';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  });

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Rechercher dans la documentation...';
  searchInput.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    width: 300px;
    padding: 12px 20px;
    border-radius: 25px;
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 14px;
    z-index: 99;
    display: none;
  `;
  
  document.body.appendChild(searchInput);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      searchInput.style.display = searchInput.style.display === 'none' ? 'block' : 'none';
      if (searchInput.style.display === 'block') {
        searchInput.focus();
      }
    }
    
    if (e.key === 'Escape') {
      searchInput.style.display = 'none';
    }
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm.length < 2) {
      document.querySelectorAll('.doc-section *').forEach(el => {
        el.style.background = '';
      });
      return;
    }

    const elements = document.querySelectorAll('.doc-section p, .doc-section h3, .doc-section h4, .doc-section li, .doc-section code');
    
    elements.forEach(el => {
      const text = el.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        el.style.background = 'rgba(139, 92, 246, 0.2)';
        el.style.padding = '2px 4px';
        el.style.borderRadius = '4px';
      } else {
        el.style.background = '';
        el.style.padding = '';
      }
    });
  });
  
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && e.target !== searchInput) {
      searchInput.style.display = 'none';
    }
  });
});
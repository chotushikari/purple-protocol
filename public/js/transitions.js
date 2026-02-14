// Page transition system
const PageTransition = {
  duration: 800,
  
  init() {
    document.body.style.opacity = '0';
    setTimeout(() => {
      gsap.to(document.body, {
        opacity: 1,
        duration: this.duration / 1000,
        ease: 'power2.out'
      });
    }, 100);
  },
  
  fadeOut(callback) {
    gsap.to(document.body, {
      opacity: 0,
      duration: this.duration / 1000,
      ease: 'power2.in',
      onComplete: callback
    });
  },
  
  navigateTo(url) {
    this.fadeOut(() => {
      window.location.href = url;
    });
  },
  
  glitchTransition(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #b25cff;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(overlay);
    
    gsap.timeline()
      .to(overlay, { opacity: 0.8, duration: 0.15, ease: 'power2.in' })
      .to(overlay, { opacity: 0, duration: 0.15, ease: 'power2.out' })
      .to(overlay, { opacity: 0.6, duration: 0.1, ease: 'power2.in' })
      .to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.out', onComplete: () => {
        overlay.remove();
        if (callback) callback();
      }});
  }
};

// Preloader
const Preloader = {
  create() {
    const loader = document.createElement('div');
    loader.id = 'preloader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <div class="loader-text">INITIALIZING PURPLE_PROTOCOL</div>
        <div class="loader-bar">
          <div class="loader-progress"></div>
        </div>
      </div>
    `;
    document.body.appendChild(loader);
    return loader;
  },
  
  hide(delay = 800) {
    setTimeout(() => {
      const loader = document.getElementById('preloader');
      if (loader) {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => loader.remove()
        });
      }
    }, delay);
  }
};

// Smooth scroll for mobile
if ('scrollBehavior' in document.documentElement.style) {
  document.documentElement.style.scrollBehavior = 'smooth';
}

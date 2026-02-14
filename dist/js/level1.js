const input = document.getElementById("name-input");
const typedTarget = document.getElementById("typed");
const terminal = document.getElementById("terminal");
const accessBanner = document.getElementById("access-banner");
const userNameSpan = document.getElementById("user-name");
const statusEl = document.getElementById("status");

// Hide preloader
Preloader.hide(1200);

// Initialize page transition
PageTransition.init();

const defaultName = localStorage.getItem("pp_name") || "NANDINI";
input.value = defaultName;

// Enhanced typing animation
const typed = new Typed("#typed", {
  strings: [
    "INITIALIZING SECURITY PROTOCOLS...",
    "SCANNING QUANTUM SIGNATURES...",
    "IDENTIFICATION REQUIRED.",
    "WHO IS THE COOLEST MATHEMATICS GIRLY POP?",
    "ENTER DESIGNATION TO PROCEED ▸"
  ],
  typeSpeed: 35,
  backSpeed: 0,
  backDelay: 800,
  startDelay: 400,
  showCursor: true,
  cursorChar: "█",
  fadeOut: false,
  onComplete: () => {
    input.focus();
    gsap.to(input.parentElement, {
      boxShadow: "0 0 20px rgba(108, 255, 142, 0.3)",
      duration: 0.6,
      repeat: -1,
      yoyo: true
    });
  }
});

function validateName() {
  const name = input.value.trim();
  
  if (!name) {
    terminal.classList.add("shake");
    statusEl.textContent = "STATUS: DENIED";
    statusEl.style.color = "#ff4444";
    
    gsap.to(terminal, {
      x: [-10, 10, -8, 8, -5, 5, 0],
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        terminal.classList.remove("shake");
        statusEl.textContent = "STATUS: LOCKED";
        statusEl.style.color = "";
      }
    });
    
    input.focus();
    return;
  }

  // Success sequence
  localStorage.setItem("pp_name", name);
  userNameSpan.textContent = name;
  statusEl.textContent = "STATUS: AUTHORIZED";
  statusEl.style.color = "#b25cff";
  
  // Disable input
  input.disabled = true;
  input.style.opacity = "0.5";
  
  // Show access banner with animation
  gsap.to(accessBanner, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.6,
    ease: "back.out(1.7)"
  });
  
  // Terminal glitch effect
  terminal.classList.add("glitch");
  
  // Background color shift
  gsap.to(document.body, {
    background: "radial-gradient(circle at top, #1d0b34 0%, #2a0f4a 45%, #120726 100%)",
    duration: 1.2,
    ease: "power2.inOut"
  });
  
  // Terminal border color shift
  terminal.classList.add("purple-shift");
  
  // Navigate with glitch transition
  setTimeout(() => {
    PageTransition.glitchTransition(() => {
      window.location.href = "universe.html";
    });
  }, 2200);
}

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    validateName();
  }
});

input.addEventListener("blur", () => {
  if (!input.value.trim()) {
    input.placeholder = "⚠ NAME REQUIRED";
    gsap.to(input, {
      borderColor: "#ff4444",
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  }
});

input.addEventListener("focus", () => {
  input.placeholder = "TYPE NAME HERE";
});

// Easter egg: Konami code
let konamiCode = [];
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  if (konamiCode.join(',') === konami.join(',')) {
    terminal.style.animation = "rainbow 2s linear infinite";
  }
});


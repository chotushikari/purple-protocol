const stage = document.getElementById("stage");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const audio = document.getElementById("bgm");

let scene, camera, renderer, heart;
let noButtonAttempts = 0;

// Initialize page
PageTransition.init();

function initHeart() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const count = 3000;
  const positions = [];
  const colors = [];
  
  for (let i = 0; i < count; i++) {
    const t = Math.PI * Math.random();
    const p = 2 * Math.PI * Math.random();
    const x = 16 * Math.pow(Math.sin(t), 3) * Math.cos(p);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = 16 * Math.pow(Math.sin(t), 3) * Math.sin(p);
    positions.push(x, y, z);
    
    const colorChoice = Math.random();
    if (colorChoice > 0.7) {
      colors.push(1, 0.42, 0.84);
    } else {
      colors.push(0.7, 0.36, 1);
    }
  }
  
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({ 
    size: 0.4, 
    transparent: true, 
    opacity: 0.95,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });
  heart = new THREE.Points(geometry, material);
  scene.add(heart);

  const ambient = new THREE.AmbientLight(0xb25cff, 1);
  scene.add(ambient);
  
  const point1 = new THREE.PointLight(0xff8be9, 2, 100);
  point1.position.set(15, 10, 8);
  scene.add(point1);
  
  const point2 = new THREE.PointLight(0xb25cff, 1.5, 80);
  point2.position.set(-12, -8, 15);
  scene.add(point2);
  
  // Start with subtle music
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

function animate() {
  const time = Date.now() * 0.0015;
  heart.rotation.y += 0.004;
  heart.rotation.x = Math.sin(time * 0.7) * 0.12;
  
  const scale = 1 + Math.sin(time * 3.5) * 0.1;
  heart.scale.setScalar(scale);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function moveNoButton() {
  noButtonAttempts++;
  
  const messages = [
    "Think carefully...",
    "Are you sure?",
    "Really?",
    "Last chance...",
    "You'll regret this"
  ];
  
  if (noButtonAttempts <= messages.length) {
    noBtn.textContent = messages[noButtonAttempts - 1];
  }
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 100;
  
  const nextX = Math.random() * (viewportWidth - 200 - padding * 2) + padding;
  const nextY = Math.random() * (viewportHeight - 80 - padding * 2) + padding;
  
  gsap.to(noBtn, {
    x: nextX - noBtn.offsetLeft,
    y: nextY - noBtn.offsetTop,
    duration: 0.3,
    ease: "power2.out"
  });
  
  gsap.to(noBtn, {
    scale: [1, 0.8, 1.1, 1],
    duration: 0.4
  });
}

function swellMusic() {
  const swell = setInterval(() => {
    if (audio.volume >= 0.95) {
      clearInterval(swell);
      return;
    }
    audio.volume = Math.min(1, audio.volume + 0.08);
  }, 150);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const name = localStorage.getItem("pp_name") || "NANDINI";
  const today = formatDate(new Date());

  // Background
  doc.setFillColor(245, 240, 255);
  doc.rect(0, 0, 210, 297, "F");

  // Purple gradient effect (simulated with rects)
  doc.setFillColor(230, 220, 255);
  doc.rect(15, 15, 180, 40, "F");

  // Title
  doc.setTextColor(102, 51, 153);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("OFFICIAL GIRLFRIEND", 105, 32, null, null, "center");
  doc.text("AGREEMENT 2026", 105, 44, null, null, "center");

  // Decorative line
  doc.setDrawColor(178, 92, 255);
  doc.setLineWidth(1);
  doc.line(30, 52, 180, 52);

  // Date
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Executed on ${today}`, 105, 64, null, null, "center");

  // Parties
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("BETWEEN:", 20, 80);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`${name.toUpperCase()}`, 30, 92);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("(\"The Cool Mathematics Girly Pop\", hereinafter \"The Heart\")", 30, 100);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("AND:", 20, 115);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("YOUR FAVORITE DEVELOPER", 30, 127);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("(\"The Architect of Purple Universes\", hereinafter \"The Mind\")", 30, 135);

  // Agreement clauses
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(102, 51, 153);
  doc.text("TERMS & CONDITIONS:", 20, 155);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  
  const clauses = [
    "1. Unlimited love, support, and hype for every dream, big or small.",
    "2. Shared playlists, matching energy, and purple universe adventures.",
    "3. Trust without question. Laughter without limits. Forever vibes.",
    "4. Automatic renewal every 365 days. No expiration. No returns.",
    "5. Mutual commitment to create legendary memories together.",
    "6. Emergency hugs available 24/7 with zero notice required."
  ];
  
  let yPos = 168;
  clauses.forEach(clause => {
    doc.text(clause, 25, yPos, { maxWidth: 160 });
    yPos += 12;
  });

  // Signature section
  doc.setDrawColor(178, 92, 255);
  doc.setLineWidth(0.5);
  doc.line(25, 245, 95, 245);
  doc.line(115, 245, 185, 245);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("The Heart", 60, 252, null, null, "center");
  doc.text("The Mind", 150, 252, null, null, "center");

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("This agreement is digitally signed and eternally binding.", 105, 275, null, null, "center");
  doc.text("PURPLE_PROTOCOL v1.0 | Made with 💜 and Three.js", 105, 282, null, null, "center");

  // Border
  doc.setDrawColor(178, 92, 255);
  doc.setLineWidth(2);
  doc.rect(10, 10, 190, 277);

  doc.save(`${name}_Love_Contract_2026.pdf`);
}

yesBtn.addEventListener("click", async () => {
  yesBtn.disabled = true;
  noBtn.style.display = "none";
  
  // Epic celebration
  swellMusic();
  
  // Multiple confetti bursts
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({ 
        particleCount: 120, 
        spread: 80 + i * 10, 
        origin: { y: 0.6 - i * 0.05 },
        colors: ['#b25cff', '#ff6ad5', '#8a2be2', '#f7eaff', '#ff8be9']
      });
    }, i * 300);
  }
  
  // Animate heart
  gsap.to(heart.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 2,
    ease: "elastic.out(1, 0.5)"
  });
  
  // Generate PDF
  await generatePDF();
  
  // Show success message
  setTimeout(() => {
    yesBtn.textContent = "💜 CONTRACT SEALED 💜";
    gsap.to(yesBtn, {
      scale: [1, 1.2, 1.1],
      duration: 0.6,
      ease: "back.out(2)"
    });
  }, 1200);
});

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
});
noBtn.addEventListener("click", moveNoButton);

window.addEventListener("resize", () => {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

initHeart();
animate();

function initHeart() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const count = 2600;
  const positions = [];
  for (let i = 0; i < count; i++) {
    const t = Math.PI * Math.random();
    const p = 2 * Math.PI * Math.random();
    const x = 16 * Math.pow(Math.sin(t), 3) * Math.cos(p);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = 16 * Math.pow(Math.sin(t), 3) * Math.sin(p);
    positions.push(x, y, z);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({ color: 0xb25cff, size: 0.35, transparent: true, opacity: 0.9 });
  heart = new THREE.Points(geometry, material);
  scene.add(heart);

  const ambient = new THREE.AmbientLight(0xb25cff, 0.8);
  scene.add(ambient);
  const point = new THREE.PointLight(0xff8be9, 1.2, 100);
  point.position.set(10, 8, 6);
  scene.add(point);
}

function animate() {
  const time = Date.now() * 0.0015;
  heart.rotation.y += 0.003;
  heart.rotation.x = Math.sin(time * 0.8) * 0.1;
  const scale = 1 + Math.sin(time * 3) * 0.08;
  heart.scale.setScalar(scale);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function moveNoButton() {
  const bounds = noBtn.parentElement.getBoundingClientRect();
  const nextX = Math.random() * (bounds.width - 120) + bounds.left;
  const nextY = Math.random() * (bounds.height - 40) + bounds.top;
  noBtn.style.position = "fixed";
  noBtn.style.left = `${nextX}px`;
  noBtn.style.top = `${nextY}px`;
}

function swellMusic() {
  audio.volume = 0.4;
  audio.play().catch(() => {});
  const swell = setInterval(() => {
    if (audio.volume >= 1) {
      clearInterval(swell);
      return;
    }
    audio.volume = Math.min(1, audio.volume + 0.08);
  }, 180);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const name = localStorage.getItem("pp_name") || "NANDINI";
  const today = formatDate(new Date());

  doc.setFillColor(240, 234, 255);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(122, 44, 196);
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text("OFFICIAL GIRLFRIEND AGREEMENT 2026", 105, 28, null, null, "center");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(30, 20, 40);
  doc.text(`This agreement is made on ${today}.`, 105, 46, null, null, "center");

  doc.setFontSize(14);
  doc.text(`Between ${name} (Cool Mathematics Girly Pop)`, 105, 64, null, null, "center");
  doc.text("and Your Favorite Developer.", 105, 74, null, null, "center");

  doc.setFontSize(12);
  doc.text("Clauses:", 20, 94);
  doc.text("1. Unlimited love, support, and hype for every dream.", 24, 108);
  doc.text("2. Shared playlists, matching energy, and purple universe dates.", 24, 120);
  doc.text("3. Trust, laughter, and forever vibes in every timeline.", 24, 132);
  doc.text("4. Auto-renewal every 365 days, no expiration.", 24, 144);

  doc.setFontSize(12);
  doc.text("Signed with full heart and zero doubts:", 20, 170);
  doc.setLineWidth(0.6);
  doc.line(20, 188, 120, 188);
  doc.text("Your Name", 20, 196);

  doc.setDrawColor(122, 44, 196);
  doc.setLineWidth(1);
  doc.rect(14, 18, 182, 260);

  doc.save("Girlfriend_Agreement_2026.pdf");
}

yesBtn.addEventListener("click", () => {
  confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
  swellMusic();
  generatePDF();
});

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("click", moveNoButton);
noBtn.addEventListener("touchstart", moveNoButton);

window.addEventListener("resize", () => {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

initHeart();
animate();

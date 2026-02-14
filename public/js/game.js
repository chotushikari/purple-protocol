const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const targetEl = document.getElementById("target");
const messageOverlay = document.getElementById("message");
const messageTitle = document.getElementById("message-title");
const messageBody = document.getElementById("message-body");
const retryBtn = document.getElementById("retry-btn");
const nextBtn = document.getElementById("next-btn");

const targetScore = 12;
const totalTime = 30;
const hearts = [];
const particles = [];
const player = { x: 0, y: 0, width: 140, height: 32 };

let score = 0;
let timeLeft = totalTime;
let lastSpawn = 0;
let running = true;
let combo = 0;

// Initialize page
PageTransition.init();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.y = canvas.height - 90;
  player.x = canvas.width / 2 - player.width / 2;
}

function spawnHeart() {
  const size = 22 + Math.random() * 20;
  hearts.push({
    x: Math.random() * (canvas.width - size * 2) + size,
    y: -size,
    size,
    speed: 1.8 + Math.random() * 2.6,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.03
  });
}

function drawHeart(x, y, size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, 0, -10, 0, -10, 6);
  ctx.bezierCurveTo(-10, 14, 0, 16, 0, 24);
  ctx.bezierCurveTo(0, 16, 10, 14, 10, 6);
  ctx.bezierCurveTo(10, 0, 0, 0, 0, 6);
  ctx.closePath();
  
  const gradient = ctx.createRadialGradient(0, 10, 0, 0, 10, 20);
  gradient.addColorStop(0, \"rgba(178, 92, 255, 1)\");
  gradient.addColorStop(1, \"rgba(138, 43, 226, 0.9)\");
  ctx.fillStyle = gradient;
  ctx.shadowColor = \"rgba(178, 92, 255, 0.8)\";\n  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.fillStyle = \"rgba(255, 255, 255, 0.15)\";\n  ctx.strokeStyle = \"rgba(178, 92, 255, 0.8)\";\n  ctx.lineWidth = 3;
  ctx.shadowColor = \"rgba(178, 92, 255, 0.6)\";\n  ctx.shadowBlur = 20;
  
  const radius = player.height / 2;
  ctx.beginPath();
  ctx.moveTo(player.x + radius, player.y);
  ctx.lineTo(player.x + player.width - radius, player.y);
  ctx.quadraticCurveTo(player.x + player.width, player.y, player.x + player.width, player.y + radius);
  ctx.lineTo(player.x + player.width, player.y + player.height - radius);
  ctx.quadraticCurveTo(player.x + player.width, player.y + player.height, player.x + player.width - radius, player.y + player.height);
  ctx.lineTo(player.x + radius, player.y + player.height);
  ctx.quadraticCurveTo(player.x, player.y + player.height, player.x, player.y + player.height - radius);
  ctx.lineTo(player.x, player.y + radius);
  ctx.quadraticCurveTo(player.x, player.y, player.x + radius, player.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function createParticles(x, y) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      size: 4 + Math.random() * 6,
      hue: 280 + Math.random() * 40
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= p.decay;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
    ctx.shadowColor = `hsl(${p.hue}, 100%, 65%)`;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function update(dt) {
  if (!running) return;

  if (Date.now() - lastSpawn > 480) {
    spawnHeart();
    lastSpawn = Date.now();
  }

  hearts.forEach((heart) => {
    heart.y += heart.speed * dt * 0.06;
    heart.wobble += heart.wobbleSpeed;
    heart.x += Math.sin(heart.wobble) * 0.5;
  });

  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];
    if (heart.y > canvas.height + 40) {
      hearts.splice(i, 1);
      combo = 0;
      continue;
    }

    if (
      heart.y + heart.size > player.y &&
      heart.y < player.y + player.height &&
      heart.x > player.x - heart.size &&
      heart.x < player.x + player.width + heart.size
    ) {
      hearts.splice(i, 1);
      score += 1;
      combo += 1;
      scoreEl.textContent = `❤ ${score}`;
      
      createParticles(heart.x, heart.y);
      confetti({
        particleCount: 8,
        spread: 40,
        origin: { x: heart.x / canvas.width, y: heart.y / canvas.height },
        colors: ['#b25cff', '#ff6ad5', '#8a2be2']
      });
      
      gsap.fromTo(scoreEl, 
        { scale: 1.4, color: \"#ff6ad5\" }, 
        { scale: 1, color: \"#f7eaff\", duration: 0.3 }
      );
      
      if (score >= targetScore) {
        endGame(true);
        return;
      }
    }
  }
  
  updateParticles(dt);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 1.5);
  gradient.addColorStop(0, \"rgba(18, 7, 38, 0.5)\");
  gradient.addColorStop(1, \"rgba(5, 3, 10, 0.8)\");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  hearts.forEach((heart) => {
    const wobbleOffset = Math.sin(heart.wobble) * 3;
    drawHeart(heart.x + wobbleOffset, heart.y, heart.size);
  });
  
  drawParticles();
  drawPlayer();
}

let lastTime = Date.now();
function gameLoop() {
  const now = Date.now();
  const dt = now - lastTime;
  lastTime = now;

  update(dt);
  render();

  if (running) {
    requestAnimationFrame(gameLoop);
  }
}

function tickTimer() {
  if (!running) return;
  timeLeft -= 1;
  timerEl.textContent = `⏱ ${timeLeft}s`;
  
  if (timeLeft <= 5) {
    gsap.to(timerEl, { scale: 1.2, color: \"#ff4444\", duration: 0.2, yoyo: true, repeat: 1 });
  }
  
  if (timeLeft <= 0) {
    endGame(false);
  }
}

let timerId;
function startGame() {
  score = 0;
  timeLeft = totalTime;
  combo = 0;
  hearts.length = 0;
  particles.length = 0;
  lastSpawn = Date.now();
  running = true;
  scoreEl.textContent = `❤ ${score}`;
  timerEl.textContent = `⏱ ${timeLeft}s`;
  targetEl.textContent = `🎯 ${targetScore}`;
  messageOverlay.style.display = \"none\";
  clearInterval(timerId);
  timerId = setInterval(tickTimer, 1000);
  lastTime = Date.now();
  requestAnimationFrame(gameLoop);
}

function endGame(win) {
  running = false;
  clearInterval(timerId);
  messageOverlay.style.display = \"flex\";
  
  if (win) {
    messageTitle.textContent = \"Perfect Catch!\";
    messageBody.textContent = \"You've captured enough love. Ready for the final question?\";
    nextBtn.style.display = \"inline-flex\";
    
    confetti({ 
      particleCount: 150, 
      spread: 90, 
      origin: { y: 0.6 },
      colors: ['#b25cff', '#ff6ad5', '#8a2be2', '#f7eaff']
    });
    
    setTimeout(() => {
      confetti({ 
        particleCount: 100, 
        spread: 70, 
        origin: { y: 0.65 } 
      });
    }, 400);
  } else {
    messageTitle.textContent = \"Time's Up\";
    messageBody.textContent = `You caught ${score}/${targetScore} hearts. Want to try again?\`;
    nextBtn.style.display = \"none\";
    
    gsap.to(messageOverlay.querySelector('.panel'), {
      scale: [0.9, 1],
      duration: 0.5,
      ease: \"back.out(1.7)\"
    });
  }
}

canvas.addEventListener(\"pointermove\", (event) => {
  const x = event.clientX - player.width / 2;
  player.x = Math.min(Math.max(0, x), canvas.width - player.width);
});

retryBtn.addEventListener(\"click\", () => {
  startGame();
});

nextBtn.addEventListener(\"click\", () => {
  PageTransition.navigateTo(\"proposal.html\");
});

window.addEventListener(\"resize\", resize);

resize();
startGame();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.y = canvas.height - 80;
  player.x = canvas.width / 2 - player.width / 2;
}

function spawnHeart() {
  const size = 20 + Math.random() * 18;
  hearts.push({
    x: Math.random() * (canvas.width - size * 2) + size,
    y: -size,
    size,
    speed: 1.6 + Math.random() * 2.4
  });
}

function drawHeart(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, 0, -10, 0, -10, 6);
  ctx.bezierCurveTo(-10, 14, 0, 16, 0, 24);
  ctx.bezierCurveTo(0, 16, 10, 14, 10, 6);
  ctx.bezierCurveTo(10, 0, 0, 0, 0, 6);
  ctx.closePath();
  ctx.fillStyle = "rgba(178, 92, 255, 0.9)";
  ctx.shadowColor = "rgba(178, 92, 255, 0.7)";
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  const radius = player.height / 2;
  ctx.beginPath();
  ctx.moveTo(player.x + radius, player.y);
  ctx.lineTo(player.x + player.width - radius, player.y);
  ctx.quadraticCurveTo(player.x + player.width, player.y, player.x + player.width, player.y + radius);
  ctx.lineTo(player.x + player.width, player.y + player.height - radius);
  ctx.quadraticCurveTo(player.x + player.width, player.y + player.height, player.x + player.width - radius, player.y + player.height);
  ctx.lineTo(player.x + radius, player.y + player.height);
  ctx.quadraticCurveTo(player.x, player.y + player.height, player.x, player.y + player.height - radius);
  ctx.lineTo(player.x, player.y + radius);
  ctx.quadraticCurveTo(player.x, player.y, player.x + radius, player.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function update(dt) {
  if (!running) return;

  if (Date.now() - lastSpawn > 520) {
    spawnHeart();
    lastSpawn = Date.now();
  }

  hearts.forEach((heart) => {
    heart.y += heart.speed * dt * 0.06;
  });

  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];
    if (heart.y > canvas.height + 40) {
      hearts.splice(i, 1);
      continue;
    }

    if (
      heart.y + heart.size > player.y &&
      heart.y < player.y + player.height &&
      heart.x > player.x - heart.size &&
      heart.x < player.x + player.width + heart.size
    ) {
      hearts.splice(i, 1);
      score += 1;
      scoreEl.textContent = `Score: ${score}`;
      if (score >= targetScore) {
        endGame(true);
        return;
      }
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(5, 3, 10, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  hearts.forEach((heart) => drawHeart(heart.x, heart.y, heart.size));
  drawPlayer();
}

let lastTime = Date.now();
function gameLoop() {
  const now = Date.now();
  const dt = now - lastTime;
  lastTime = now;

  update(dt);
  render();

  if (running) {
    requestAnimationFrame(gameLoop);
  }
}

function tickTimer() {
  if (!running) return;
  timeLeft -= 1;
  timerEl.textContent = `Time: ${timeLeft}`;
  if (timeLeft <= 0) {
    endGame(false);
  }
}

let timerId;
function startGame() {
  score = 0;
  timeLeft = totalTime;
  hearts.length = 0;
  lastSpawn = Date.now();
  running = true;
  scoreEl.textContent = `Score: ${score}`;
  timerEl.textContent = `Time: ${timeLeft}`;
  targetEl.textContent = `Target: ${targetScore}`;
  messageOverlay.style.display = "none";
  clearInterval(timerId);
  timerId = setInterval(tickTimer, 1000);
  lastTime = Date.now();
  requestAnimationFrame(gameLoop);
}

function endGame(win) {
  running = false;
  clearInterval(timerId);
  messageOverlay.style.display = "flex";
  if (win) {
    messageTitle.textContent = "You did it!";
    messageBody.textContent = "Purple hearts secured. Ready for the final protocol?";
    nextBtn.style.display = "inline-flex";
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  } else {
    messageTitle.textContent = "Almost there";
    messageBody.textContent = "The hearts escaped. Try again and show them your reflexes.";
    nextBtn.style.display = "none";
  }
}

canvas.addEventListener("pointermove", (event) => {
  const x = event.clientX - player.width / 2;
  player.x = Math.min(Math.max(0, x), canvas.width - player.width);
});

retryBtn.addEventListener("click", () => {
  startGame();
});

nextBtn.addEventListener("click", () => {
  window.location.href = "proposal.html";
});

window.addEventListener("resize", resize);

resize();
startGame();

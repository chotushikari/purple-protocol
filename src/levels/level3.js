import confetti from 'canvas-confetti';
import { config } from '../config.js';
import '../styles/glitch.css';
import gsap from 'gsap';

export function mountLevel3(container, onNextLevel) {
    container.innerHTML = `
    <div id="calculator-ui">
      <h2 class="calc-title">${config.loveCalculator.question}</h2>
      
      <div class="slider-container" id="slider-bounds">
        <div class="slider-track"></div>
        <div class="slider-fill" id="slider-fill"></div>
        <div class="slider-handle" id="slider-handle">💜</div>
      </div>
      
      <div class="percentage-text" id="percentage">0%</div>
      <div id="troll-msg" class="troll-msg">TOO LOW! TRY AGAIN! 😈</div>
    </div>
  `;

    initPhysicsSlider(onNextLevel);
}

function initPhysicsSlider(onNextLevel) {
    const handle = document.getElementById('slider-handle');
    const fill = document.getElementById('slider-fill');
    const text = document.getElementById('percentage');
    const bounds = document.getElementById('slider-bounds');
    const trollMsg = document.getElementById('troll-msg');

    let rect = bounds.getBoundingClientRect();
    let handlePos = 0; // 0 to 1 progress
    let isDragging = false;
    let velocity = 0;

    // Repulsion Logic
    const mouse = { x: 0, y: 0 };

    // Update Rect on resize
    window.addEventListener('resize', () => {
        rect = bounds.getBoundingClientRect();
    });

    // Mouse Move / Touch Move
    const onMove = (clientX, clientY) => {
        mouse.x = clientX;
        mouse.y = clientY;

        // Repulsion Zone
        const handleX = rect.left + 20 + handlePos * (rect.width - 40);
        const dist = Math.abs(clientX - handleX);
        const startY = rect.top;
        const endY = rect.bottom;

        // Only repel if near the slider vertically and horizontally
        const isNearY = clientY > startY - 50 && clientY < endY + 50;

        if (!isDragging && isNearY && dist < 100 && handlePos < 0.9) {
            // Push away!
            const direction = clientX < handleX ? 1 : -1;
            // Stronger force if closer
            const force = (100 - dist) * 0.002 * direction;
            velocity += force;

            showTroll(trollMsg, clientX, clientY - 50);
        }
    };

    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY));

    // Drag Logic (Only allows dragging FORWARD easily, hard to drag backward if we wanted, but here we just want dodge)
    // Actually, standard drag logic but with the "dodge" interference

    handle.addEventListener('mousedown', () => isDragging = true);
    handle.addEventListener('touchstart', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('touchend', () => isDragging = false);

    window.addEventListener('mousemove', e => {
        if (isDragging) {
            // Map mouse X to progress
            const x = e.clientX - rect.left - 20;
            const width = rect.width - 40;
            let p = x / width;
            p = Math.max(0, Math.min(1, p));

            // If user tries to drag low, maybe force it high? Or just standard drag.
            // The "Dodge" is mainly for when they *approach* it to set it low.
            handlePos = p;
            velocity = 0;
        }
    });

    // Physics Loop
    function update() {
        if (!isDragging) {
            handlePos += velocity;
            velocity *= 0.9; // Friction

            // Bounds
            if (handlePos < 0) { handlePos = 0; velocity = -velocity * 0.5; }
            if (handlePos > 1) { handlePos = 1; velocity = 0; }
        }

        // Update UI
        const width = rect.width - 40;
        const px = handlePos * width;

        handle.style.left = (20 + px) + 'px';
        fill.style.width = (handlePos * 100) + '%';

        let percentage = Math.round(handlePos * 100);
        // Glitch Text near 100
        if (percentage > 95) percentage = Math.floor(Math.random() * 1000) + 100;

        text.innerText = percentage + '%';

        // Win Condition
        if (handlePos >= 0.98) {
            win();
            return; // Stop loop
        }

        requestAnimationFrame(update);
    }
    update();

    function showTroll(el, x, y) {
        el.style.opacity = 1;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        setTimeout(() => el.style.opacity = 0, 1000);
    }

    function win() {
        text.innerText = "∞%"; // Infinity
        text.style.color = "var(--neon-pink)";
        handle.style.left = 'calc(100% - 20px)'; /* Snap to end */
        fill.style.width = '100%';

        // Confetti
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#b25cff', '#ff6ad5']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#b25cff', '#ff6ad5']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            } else {
                onNextLevel();
            }
        }());
    }
}

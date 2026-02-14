import Typed from 'typed.js';
import { config } from '../config.js';
import '../styles/terminal.css';

let matrixInterval;

export function mountLevel1(container, onComplete, onCreatorMode) {
    container.innerHTML = `
    <canvas id="matrix-canvas"></canvas>
    <div id="terminal-ui">
      <div id="typewriter" class="terminal-text"></div>
      <div class="input-group" id="input-container">
        <span style="color: var(--neon-green)">></span>
        <input type="text" id="name-input" autocomplete="off" autofocus>
      </div>
    </div>
  `;

    startMatrixRain();
    startTerminalSequence(onComplete, onCreatorMode);
}

function startMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const symbols = "∑π∞∫√≈≠≤≥÷COMBINATORICS10";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#6cff8e'; // Matrix Green
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = symbols.charAt(Math.floor(Math.random() * symbols.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    matrixInterval = setInterval(draw, 33);
}

function startTerminalSequence(onComplete, onCreatorMode) {
    const typed = new Typed('#typewriter', {
        strings: [
            "SYSTEM BOOT SEQUENCE INITIATED...",
            "SCANNING BIOMETRICS...",
            "ANALYZING AURA...",
            "SUBJECT DETECTED: HIGH INTELLIGENCE.",
            "IDENTIFY YOURSELF."
        ],
        typeSpeed: 30,
        backSpeed: 10,
        onComplete: () => {
            document.getElementById('input-container').classList.add('visible');
            const input = document.getElementById('name-input');
            input.focus();
            input.addEventListener('keypress', (e) => handleInput(e, onComplete, onCreatorMode));
        }
    });
}

function handleInput(e, onComplete, onCreatorMode) {
    if (e.key === 'Enter') {
        const value = e.target.value.trim().toLowerCase();
        const ui = document.getElementById('terminal-ui');
        const input = document.getElementById('name-input');
        const typewriter = document.getElementById('typewriter');

        // Creator Mode
        if (value === config.creator.password.toLowerCase()) {
            ui.classList.add('glitch-mode');
            typewriter.innerHTML = `<span style="color:var(--neon-green)">CREATOR ACCESS GRANTED.</span>`;
            setTimeout(() => {
                onCreatorMode();
            }, 1000);
            return;
        }

        // Easter Eggs
        if (config.terminal.easterEggs[value]) {
            // Show easter egg temporarily then clear
            typewriter.innerHTML = `<span style="color:var(--neon-pink)">${config.terminal.easterEggs[value]}</span>`;
            input.value = "";
            setTimeout(() => {
                typewriter.innerHTML = "IDENTIFY YOURSELF.";
            }, 3000);
            return;
        }

        // Success
        if (value === config.identity.name.toLowerCase()) {
            // Glitch Effect
            ui.classList.add('glitch-mode');
            input.disabled = true;

            // Change Matrix Color to Purple
            clearInterval(matrixInterval); // Stop green rain
            // (Optional: restart purple rain, but simpler to just glitch out)

            typewriter.innerHTML = `<span style="color:var(--neon-purple)">ACCESS GRANTED.<br>WELCOME, ${config.identity.title}.</span>`;

            setTimeout(() => {
                onComplete(); // Transition to Level 2
            }, 2000);
        } else {
            // Failure
            ui.style.animation = "shake 0.5s";
            input.value = "";
            input.placeholder = "ACCESS DENIED";
            setTimeout(() => ui.style.animation = "", 500);
        }
    }
}

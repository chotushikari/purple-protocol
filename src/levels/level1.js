import Typed from 'typed.js';
import { config } from '../config.js';
import '../styles/terminal.css'; // We will overhaul the CSS file itself next

let particleInterval;

export function mountLevel1(container, onComplete, onCreatorMode) {
    // New Structure: Glass Card in the center
    container.innerHTML = `
    <div id="cute-bg"></div>
    <canvas id="emoji-canvas"></canvas>
    
    <div id="love-portal" class="glass-card">
        <h1 class="bounce-title">✨ The Vibe Check ✨</h1>
        <div id="funny-text" class="status-msg"></div>
        
        <div class="input-zone hidden" id="input-zone">
            <input type="text" id="name-input" placeholder="Who are you?" autocomplete="off">
            <button id="go-btn">💅</button>
        </div>
    </div>
  `;

    startEmojiRain(); // Background chaos
    startSassyDialogue(onComplete, onCreatorMode);
}

function startEmojiRain() {
    const canvas = document.getElementById('emoji-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // The "Math & Love" Chaos Mix
    const emojis = ["❤️", "💖", "✨", "∫", "π", "x²", "🦋", "🧸", "⚛️", "🍬"];
    const particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 20 + 10;
            this.speedY = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 1;
            this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
            this.spin = Math.random() * 0.2 - 0.1;
            this.angle = 0;
        }
        update() {
            this.y -= this.speedY; // Float UP floating bubbles
            this.x += this.speedX;
            this.angle += this.spin;

            if (this.y < -50) {
                this.y = canvas.height + 50;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.font = `${this.size}px Arial`;
            ctx.fillText(this.emoji, 0, 0);
            ctx.restore();
        }
    }

    // Create 50 particles
    for (let i = 0; i < 50; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function startSassyDialogue(onComplete, onCreatorMode) {
    const typed = new Typed('#funny-text', {
        strings: [
            "Wait... who is this?",
            "Are you like... the chosen one? 🤨",
            "Or just a random fan?",
            "Let's test your math...",
            "Just kidding, tell me your name! 💖"
        ],
        typeSpeed: 40,
        backSpeed: 20,
        backDelay: 1500,
        showCursor: false,
        onComplete: () => {
            document.getElementById('input-zone').classList.remove('hidden');
            const input = document.getElementById('name-input');
            input.focus();

            // Handle interactions
            const checkName = () => {
                const val = input.value.trim().toLowerCase();
                const portal = document.getElementById('love-portal');

                if (val === config.creator.password.toLowerCase()) {
                    // Creator
                    portal.innerHTML = "<h1>👑 QUEEN/KING DETECTED 👑</h1>";
                    setTimeout(onCreatorMode, 1000);
                } else if (val === config.identity.name.toLowerCase()) {
                    // The Soulmate
                    portal.innerHTML = `
                        <h1 class="success-anim">OMG IT'S YOU! 😱💖</h1>
                        <p>Calculations correct!</p>
                    `;
                    launchConfetti();
                    setTimeout(onComplete, 2500);
                } else {
                    // Wrong person
                    input.classList.add('shake');
                    input.value = "";
                    input.placeholder = "Nah, try again bestie 💅";
                    setTimeout(() => input.classList.remove('shake'), 500);
                }
            };

            document.getElementById('go-btn').addEventListener('click', checkName);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkName();
            });
        }
    });
}


function launchConfetti() {
    // Simple placeholder for the confetti visual effect logic
    // We assume confetti library surrounds this or global canvas-confetti
    import('canvas-confetti').then((module) => {
        const confetti = module.default;
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ff9a9e', '#a18cd1', '#fbc2eb']
        });
    });
}

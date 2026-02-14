import { config } from '../config.js';
import gsap from 'gsap';
import canvasConfetti from 'canvas-confetti';

export function mountValentine(container, onComplete) {
    container.innerHTML = `
        <div class="valentine-container">
            <h1 class="valentine-title">${config.valentineProposal.question}</h1>
            <div class="valentine-buttons">
                <button id="yes-btn" class="valentine-btn yes-btn">${config.valentineProposal.yesButton}</button>
                <button id="no-btn" class="valentine-btn no-btn">${config.valentineProposal.noButton}</button>
            </div>
            <div class="floating-hearts"></div>
        </div>
    `;

    const yesBtn = container.querySelector('#yes-btn');
    const noBtn = container.querySelector('#no-btn');
    let noHoverCount = 0;

    // Animations
    gsap.from(".valentine-title", { duration: 1.5, y: -50, opacity: 0, ease: "bounce" });
    gsap.from(".valentine-btn", { duration: 1, scale: 0, stagger: 0.2, ease: "back" });

    // Yes Button Click
    yesBtn.addEventListener('click', () => {
        canvasConfetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        gsap.to(".valentine-container", {
            duration: 1,
            opacity: 0,
            onComplete: onComplete
        });
    });

    // No Button Interaction (The "Glitchy" Part)
    const moveNoButton = () => {
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;

        gsap.to(noBtn, { duration: 0.2, x: x, y: y });

        // Increase Yes Button Size
        const currentScale = gsap.getProperty(yesBtn, "scale");
        gsap.to(yesBtn, { duration: 0.2, scale: currentScale + 0.2 });

        // Change Text
        if (noHoverCount < config.valentineProposal.noButtonHoverText.length) {
            noBtn.innerText = config.valentineProposal.noButtonHoverText[noHoverCount];
            noHoverCount++;
        } else {
            noBtn.style.display = 'none'; // Disappear eventually
        }
    };

    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('click', moveNoButton);
    // Mobile touch support
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveNoButton();
    });
}

import { config } from '../config.js';
import gsap from 'gsap';
import canvasConfetti from 'canvas-confetti';
import { jsPDF } from "jspdf";

export function mountContract(container) {
    const termsList = config.loveContract.terms.map(term => `<li>${term}</li>`).join('');

    container.innerHTML = `
        <div class="contract-container">
            <h1 class="contract-title">${config.loveContract.title}</h1>
            <div class="contract-paper premium-paper">
                <div class="paper-texture"></div> <!-- Noise overlay -->
                <ul class="contract-terms">
                    ${termsList}
                </ul>
                <div class="signature-section">
                    <input type="text" id="signature-input" placeholder="${config.loveContract.signaturePlaceholder}" />
                    <div class="signature-line"></div>
                </div>
                <div id="wax-seal" class="wax-seal hidden">
                    <div class="seal-inner">💜</div>
                </div>
            </div>
            <button id="confirm-btn" class="confirm-btn" disabled>${config.loveContract.confirmButton}</button>
        </div>
        <div class="celebration-overlay"></div>
    `;

    const input = container.querySelector('#signature-input');
    const confirmBtn = container.querySelector('#confirm-btn');
    const waxSeal = container.querySelector('#wax-seal');

    // Animations
    gsap.from(".contract-paper", { duration: 1.2, y: 150, rotate: -2, opacity: 0, ease: "power3.out" });

    // Input Logic
    input.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 0) {
            confirmBtn.removeAttribute('disabled');
            confirmBtn.classList.add('active');
        } else {
            confirmBtn.setAttribute('disabled', 'true');
            confirmBtn.classList.remove('active');
        }
    });

    // Confirm Logic
    confirmBtn.addEventListener('click', () => {
        const signature = input.value;
        if (!signature) return;

        // 1. Stamp the Wax Seal
        waxSeal.classList.remove('hidden');
        gsap.fromTo(waxSeal,
            { scale: 3, opacity: 0 },
            {
                scale: 1, opacity: 1, duration: 0.5, ease: "bounce.out", onComplete: () => {
                    // 2. Celebrate after seal lands
                    canvasConfetti({ particleCount: 300, spread: 100, origin: { y: 0.6 } });

                    // 3. Show Success
                    showSuccess(container, signature);
                }
            }
        );
    });
}

function showSuccess(container, signature) {
    container.innerHTML = `
        <div class="success-container">
            <h1>OFFICIALLY SEALED! 💜</h1>
            <p>Welcome to forever, ${signature}.</p>
            <button id="download-btn" class="download-btn">Download Contract</button>
        </div>
    `;

    gsap.from(".success-container", { duration: 1, scale: 0.5, opacity: 0, ease: "elastic" });

    document.getElementById('download-btn').addEventListener('click', () => {
        const doc = new jsPDF();
        doc.setFont("courier");
        doc.setFontSize(22);
        doc.text(config.loveContract.title, 20, 20);
        doc.setFontSize(14);
        let y = 50;
        config.loveContract.terms.forEach(term => {
            doc.text(`- ${term}`, 20, y);
            y += 12;
        });
        doc.text(`\n\nSigned by: ${signature}`, 20, y + 20);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y + 35);
        doc.save("Love_Contract.pdf");
    });
}

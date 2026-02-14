import { jsPDF } from 'jspdf';
import { config } from '../config.js';
import '../styles/scanner.css';
import confetti from 'canvas-confetti';

export function mountLevel4(container) {
    container.innerHTML = `
    <div id="scanner-ui">
      <div class="scanner-title">IDENTITY VERIFICATION REQUIRED</div>
      <div class="fingerprint-container" id="fp-scan">
        <div class="scan-beam"></div>
        <svg class="fingerprint-svg" viewBox="0 0 24 24">
            <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.03-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
      </div>
      <div class="status-text" id="scan-status">LONG PRESS TO SCAN</div>
    </div>

    <div id="success-overlay" class="success-overlay">
      <div class="success-title">SOULMATE CONFIRMED 💜</div>
      <div class="download-msg">Generating Official Contract...</div>
    </div>
  `;

    initScanner();
}

function initScanner() {
    const fp = document.getElementById('fp-scan');
    const status = document.getElementById('scan-status');
    let scanTimeout;
    let isComplete = false;

    const startScan = (e) => {
        if (isComplete) return;
        e.preventDefault(); // Prevent text selection/menu
        fp.classList.add('scanning');
        status.innerText = config.proposal.scanMessage;
        status.style.color = "var(--neon-green)";

        scanTimeout = setTimeout(() => {
            completeScan();
        }, 2500); // 2.5s to scan
    };

    const cancelScan = () => {
        if (isComplete) return;
        fp.classList.remove('scanning');
        status.innerText = "SCAN FAILED. TRY AGAIN.";
        status.style.color = "red";
        clearTimeout(scanTimeout);
    };

    fp.addEventListener('mousedown', startScan);
    fp.addEventListener('touchstart', startScan);
    fp.addEventListener('mouseup', cancelScan);
    fp.addEventListener('mouseleave', cancelScan);
    fp.addEventListener('touchend', cancelScan);

    function completeScan() {
        isComplete = true;
        fp.classList.remove('scanning');
        status.innerText = config.proposal.matchMessage;
        status.style.color = "var(--neon-pink)";

        // Show Overlay
        const overlay = document.getElementById('success-overlay');
        overlay.style.opacity = 1;
        overlay.style.pointerEvents = 'auto';

        // Confetti
        fireConfetti();

        // Generate PDF
        setTimeout(generatePDF, 2000);
    }
}

function fireConfetti() {
    const duration = 5000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#b25cff', '#ff6ad5']
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#b25cff', '#ff6ad5']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function generatePDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(178, 92, 255); // Purple
    doc.text(config.proposal.contractTitle, pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

    // Body
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text(`This document certifies that`, 20, 50);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(config.identity.name, pageWidth / 2, 65, { align: 'center' }); // Name

    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text(`has been officially confirmed as the SOULMATE of the undersigned.`, 20, 80);

    // Clauses
    let y = 100;
    doc.setFontSize(14);
    config.proposal.clauses.forEach((clause, i) => {
        doc.text(`${i + 1}. ${clause}`, 20, y);
        y += 12;
    });

    // Footer
    y += 20;
    doc.setFontVersion("bold");
    doc.text("Signed:", 140, y);
    doc.setFont("cursive"); // Fallback to standard
    doc.setTextColor(178, 92, 255);
    doc.text(config.proposal.signer, 140, y + 10);

    doc.save("Soulmate_Agreement.pdf");
}

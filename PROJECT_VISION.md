# PURPLE_PROTOCOL - GOD TIER EDITION 💜👾

## The New Experience Flow

### Level 1: The "Sentient" Terminal (Hacker Vibe) 🔐
**The Upgrade**: The terminal "talks" to her, analyzing her "aura".
- **Visual**: CRT scanlines, glitch effects, neon purple text.
- **Matrix Rain**: Background rains purple math symbols ($\pi, \sum, \infty, \heartsuit$) instead of numbers.
- **Interaction**: She types "Nandini". The screen cracks (CSS glitch), code turns neon purple.
- **Easter Eggs**: Typing "3.14" or "143" triggers secret nerdy love messages.

### Level 2: The "BTS Math" Galaxy (Interactive 3D) 🌌
**The Upgrade**: A cinematic 3D tunnel of floating items and memories.
- **Visual**: 3D tunnel/galaxy with floating 3D hearts, BTS logos, math symbols ($\pi, \sum$), and polaroid photos.
- **Interaction**: Drag to explore, hover to see "Reasons I Love You" on stars.
- **Audio**: "Jaane Kyun" fades in with vinyl crackle.
- **Customization**: All texts/images driven by a simple `config.js` file.

### Level 3: The "Love Calculator" Glitch (Viral/Funny) 🤣
**The Upgrade**: A fake "compatibility test" that trolls her.
- **Mechanic**: A slider: "How much do you love [Your Name]?".
- **The Hack**: If she tries to slide <100%, the handle physically dodges her finger (Matter.js/physics).
- **Resolution**: She forces it to 100% -> Confetti explosion -> Level 4.

### Level 4: The "Infinite" Contract (Emotional Finale) 💍
**The Upgrade**: "Fingerprint Scanner" proposal.
- **Interaction**: Long-press thumb on screen to "Scan Biometrics".
- **Result**: "Match Found: Soulmate" -> PDF Contract auto-generates & downloads.
- **Visual**: High-tech scanning animation, emotional reveal.

---

## 🛠️ The Tech Stack (Vercel Ready)

- **Framework**: Vite (Vanilla JS) - Lightning fast, hot reloading.
- **3D Library**: Three.js (Galaxy/Tunnel).
- **Physics**: Matter.js (Love Calculator Glitch).
- **Animations**: GSAP (GreenSock) for buttery smooth UI motion.
- **Deployment**: Vercel (Zero config).
- **No Docker**: Pure static build.

---

## 📁 Project Structure (Refactored)

```
purple-protocol/
├── src/
│   ├── config.js         # 🛠️ THE MASTER CONFIG (Edit everything here)
│   ├── main.js           # App entry point
│   ├── levels/
│   │   ├── level1.js     # Sentient Terminal
│   │   ├── level2.js     # 3D Math Galaxy
│   │   ├── level3.js     # Love Calculator Glitch
│   │   └── level4.js     # Fingerprint Scanner
│   ├── styles/
│   │   ├── main.css      # Core styles
│   │   ├── terminal.css
│   │   ├── galaxy.css
│   │   ├── glitch.css
│   │   └── scanner.css
│   └── assets/           # Images/Audio
├── index.html            # Single page app
├── package.json          # Dependencies
└── vite.config.js        # Build config
```

---

## 🎯 Implementation Roadmap

1. **Setup Vite**: Migrate from raw HTML/JS to structured Vite app.
2. **Master Config**: Create `src/config.js` for easy customization.
3. **Level 1 (Terminal)**: Implement Sentient AI logic + Matrix Rain.
4. **Level 2 (Galaxy)**: Port existing 3D code, add floating specific 3D objects (Math/BTS).
5. **Level 3 (Calculator)**: Build the "Dodge Slider" mechanic with physics.
6. **Level 4 (Scanner)**: Build the DOM-based fingerprint scanner animation & PDF logic.
7. **Deploy**: Verify Vercel build.

Let's build this. 🚀

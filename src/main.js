// Main Entry Point
import { config } from './config.js';
import { mountLevel1 } from './levels/level1.js';
import { mountLevel2 } from './levels/level2.js';
import { mountLevel3 } from './levels/level3.js';
import { mountLevel4 } from './levels/level4.js'; // Keep for reference or delete later
import { mountValentine } from './levels/valentine.js';
import { mountContract } from './levels/contract.js';
import { mountCreator } from './levels/creator.js'; // Import Creator Mode
import './styles/main.css';

const app = document.getElementById('app');

const state = {
    currentLevel: 1,
};

export function loadLevel(levelNumber) {
    app.innerHTML = '';
    // Cleanup if needed

    state.currentLevel = levelNumber;

    if (levelNumber === 'CREATOR') {
        mountCreator(app);
        return;
    }

    switch (levelNumber) {
        case 1:
            mountLevel1(app, nextLevel, loadCreatorMode);
            break;
        case 2:
            mountLevel2(app, nextLevel);
            break;
        case 3:
            mountLevel3(app, nextLevel);
            break;
        case 4:
            // mountLevel4 was the fingerprint scanner, replacing with Valentine Proposal
            mountValentine(app, nextLevel);
            break;
        case 5:
            mountContract(app);
            break;
        default:
            console.error("Unknown Level");
    }
}

function nextLevel() {
    loadLevel(state.currentLevel + 1);
}

function loadCreatorMode() {
    loadLevel('CREATOR');
}

// Start
loadLevel(1);

import { config } from '../config.js';
import '../styles/creator.css';

// Simple in-memory store for the session
let memories = [];
let mode = 'photo'; // 'photo' or 'note'

export function mountCreator(container) {
  container.innerHTML = `
    <div id="creator-ui">
      <div class="creator-header">
        <h1 class="creator-title">💜 CREATOR DASHBOARD: ${config.creator.name}</h1>
        <p>Upload photos, add captions, and export your galaxy config.</p>
      </div>

      <div class="upload-section">
        <div class="toggle-group">
            <button class="toggle-btn active" id="btn-photo">📸 Photos</button>
            <button class="toggle-btn" id="btn-note">💌 Love Notes</button>
        </div>

        <!-- Photo Form -->
        <div class="memory-form" id="form-photo">
            <input type="file" id="photo-input" accept="image/*">
            <input type="text" id="caption-input" placeholder="Enter caption (e.g., 'Our first date')">
            <button class="btn-primary" id="add-photo-btn">Add Photo to Universe</button>
        </div>

        <!-- Note Form -->
        <div class="memory-form hidden-section" id="form-note">
            <input type="text" id="symbol-input" placeholder="Enter Symbol (e.g. ❤️, ∞, 🍇)" maxlength="2" style="font-size:1.5rem; width: 50px; text-align:center;">
            <input type="text" id="note-input" placeholder="Enter hidden note (e.g. 'You are my universe')">
            <button class="btn-primary" id="add-note-btn">Add Note to Universe</button>
        </div>
      </div>

      <div class="upload-section">
        <h3>2. Your Galaxy Preview</h3>
        <div id="preview-list" class="preview-container">
            <!-- Cards go here -->
        </div>
      </div>

      <div class="export-section">
        <h3>3. Finalize</h3>
        <p>Click below to download 'memories.json'. <strong>IMPORTANT:</strong> Place this file in your project's <code>public/</code> folder!</p>
        <button class="btn-primary" id="export-btn" style="background: var(--neon-green); color: #000;">DOWNLOAD GALAXY DATA ⬇️</button>
      </div>
    </div>
  `;

  setupEvents();
}

function setupEvents() {
  const btnPhoto = document.getElementById('btn-photo');
  const btnNote = document.getElementById('btn-note');
  const formPhoto = document.getElementById('form-photo');
  const formNote = document.getElementById('form-note');
  const previewList = document.getElementById('preview-list');

  // Toggles
  btnPhoto.addEventListener('click', () => {
    mode = 'photo';
    btnPhoto.classList.add('active');
    btnNote.classList.remove('active');
    formPhoto.classList.remove('hidden-section');
    formNote.classList.add('hidden-section');
  });

  btnNote.addEventListener('click', () => {
    mode = 'note';
    btnPhoto.classList.remove('active');
    btnNote.classList.add('active');
    formPhoto.classList.add('hidden-section');
    formNote.classList.remove('hidden-section');
  });

  // Add Photo
  document.getElementById('add-photo-btn').addEventListener('click', () => {
    const photoInput = document.getElementById('photo-input');
    const captionInput = document.getElementById('caption-input');
    const file = photoInput.files[0];

    if (!file) { alert("Select a photo!"); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const memory = {
        id: Date.now(),
        type: 'photo',
        image: e.target.result, // Base64 is fine for small <5MB json files usually
        caption: captionInput.value || "Memory"
      };
      memories.push(memory);
      renderCard(memory, previewList);
      photoInput.value = ""; captionInput.value = "";
    };
    reader.readAsDataURL(file);
  });

  // Add Note
  document.getElementById('add-note-btn').addEventListener('click', () => {
    const symbol = document.getElementById('symbol-input').value;
    const note = document.getElementById('note-input').value;

    if (!symbol || !note) { alert("Enter both symbol and note!"); return; }

    const memory = {
      id: Date.now(),
      type: 'note',
      symbol: symbol,
      caption: note
    };
    memories.push(memory);
    renderCard(memory, previewList);
    document.getElementById('symbol-input').value = "";
    document.getElementById('note-input').value = "";
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    if (memories.length === 0) { alert("Add something first!"); return; }

    const dataStr = JSON.stringify(memories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'memories.json');
    linkElement.click();

    alert("Downloaded! IMPORTANT: Move this file to the 'public' folder in your project directory.");
  });
}

function renderCard(memory, container) {
  const card = document.createElement('div');

  if (memory.type === 'photo') {
    card.className = 'memory-card';
    card.innerHTML = `
            <img src="${memory.image}" class="memory-img">
            <div class="memory-caption">${memory.caption}</div>
        `;
  } else {
    card.className = 'note-card';
    card.innerHTML = `
            <div class="note-symbol">${memory.symbol}</div>
            <div class="note-msg">${memory.caption}</div>
        `;
  }

  const removeBtn = document.createElement('button');
  removeBtn.innerText = "Remove";
  removeBtn.style.color = "red";
  removeBtn.style.marginTop = "auto";
  removeBtn.onclick = () => {
    memories = memories.filter(m => m.id !== memory.id);
    card.remove();
  };

  card.appendChild(removeBtn);
  container.appendChild(card);
}

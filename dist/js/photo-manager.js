// PROFESSIONAL PRECISION IMAGE PROCESSOR - Pointer Events Based
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const gallery = document.getElementById('gallery');
const cropModal = document.getElementById('crop-modal');
const cropCanvas = document.getElementById('crop-canvas');
const cropBox = document.getElementById('crop-box');
const canvasWrapper = document.getElementById('canvas-wrapper');

let currentImage = null;
let currentFile = null;
let ctx = null;
let db = null;

// Cropper state - all calculations in NATURAL image coordinates
let cropState = {
  x: 0, y: 0,
  width: 0, height: 0,
  rotation: 0,
  scale: 1,
  imgNaturalWidth: 0,
  imgNaturalHeight: 0,
  displayWidth: 0,
  displayHeight: 0,
  scaleRatio: 1 // natural / display
};

let currentRatio = 16/10;
let isDragging = false;
let dragHandle = null;
let dragStart = { x: 0, y: 0 };
let pointerID = null;

// IndexedDB setup
function initDB() {
  const request = indexedDB.open('PurpleProtocolPhotos', 1);
  request.onerror = () => console.error('IndexedDB error');
  request.onsuccess = (e) => {
    db = e.target.result;
    loadGallery();
  };
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('memories')) {
      db.createObjectStore('memories', { keyPath: 'id', autoIncrement: true });
    }
  };
}

// Upload handling with URL.createObjectURL
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragging');
});

uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragging'));

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragging');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
  Array.from(files).forEach((file, index) => {
    if (file.type.match(/image.*/)) {
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        openCropModal(url, file);
      }, index * 100);
    }
  });
}

function openCropModal(imageUrl, file) {
  currentFile = file;
  
  currentImage = new Image();
  currentImage.onload = () => {
    URL.revokeObjectURL(imageUrl);
    setupCropper();
    cropModal.classList.add('active');
    gsap.from('.crop-container', {
      scale: 0.9, opacity: 0, duration: 0.3, ease: 'back.out(1.7)'
    });
  };
  
  currentImage.src = imageUrl;
}

function setupCropper() {
  ctx = cropCanvas.getContext('2d');
  
  // Get natural image dimensions
  cropState.imgNaturalWidth = currentImage.naturalWidth;
  cropState.imgNaturalHeight = currentImage.naturalHeight;
  
  // Calculate display size based on viewport - leave room for sidebar and padding
  const maxWidth = Math.min(800, window.innerWidth - 400);
  const maxHeight = Math.min(600, window.innerHeight - 300);
  
  let displayWidth = cropState.imgNaturalWidth;
  let displayHeight = cropState.imgNaturalHeight;
  
  const ratio = displayWidth / displayHeight;
  
  // Scale down if too large
  if (displayWidth > maxWidth) {
    displayWidth = maxWidth;
    displayHeight = displayWidth / ratio;
  }
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = displayHeight * ratio;
  }
  
  // Set canvas to display dimensions
  cropCanvas.width = displayWidth;
  cropCanvas.height = displayHeight;
  
  cropState.displayWidth = displayWidth;
  cropState.displayHeight = displayHeight;
  cropState.scaleRatio = cropState.imgNaturalWidth / displayWidth;
  
  // Initialize crop box in NATURAL coordinates
  const cropW = cropState.imgNaturalWidth * 0.7;
  const cropH = currentRatio === 'free' ? cropW * 0.6 : cropW / currentRatio;
  
  cropState.x = (cropState.imgNaturalWidth - cropW) / 2;
  cropState.y = (cropState.imgNaturalHeight - cropH) / 2;
  cropState.width = cropW;
  cropState.height = cropH;
  
  redraw();
  updateCropBoxDisplay();
}

function redraw() {
  ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  
  // Save for transformations
  ctx.save();
  
  if (cropState.rotation !== 0) {
    const centerX = cropCanvas.width / 2;
    const centerY = cropCanvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((cropState.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }
  
  // Apply scale
  if (cropState.scale !== 1) {
    const centerX = cropCanvas.width / 2;
    const centerY = cropCanvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(cropState.scale, cropState.scale);
    ctx.translate(-centerX, -centerY);
  }
  
  // Draw image
  ctx.drawImage(currentImage, 0, 0, cropCanvas.width, cropCanvas.height);
  ctx.restore();
  
  // Draw overlay and grid
  drawOverlay();
}

function drawOverlay() {
  const displayX = cropState.x / cropState.scaleRatio;
  const displayY = cropState.y / cropState.scaleRatio;
  const displayW = cropState.width / cropState.scaleRatio;
  const displayH = cropState.height / cropState.scaleRatio;
  
  // Darken outside
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, cropCanvas.width, displayY);
  ctx.fillRect(0, displayY + displayH, cropCanvas.width, cropCanvas.height - (displayY + displayH));
  ctx.fillRect(0, displayY, displayX, displayH);
  ctx.fillRect(displayX + displayW, displayY, cropCanvas.width - (displayX + displayW), displayH);
  
  // Border
  ctx.strokeStyle = '#4aa3ff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(displayX, displayY, displayW, displayH);
  ctx.setLineDash([]);
  
  // Grid - rule of thirds
  const thirdW = displayW / 3;
  const thirdH = displayH / 3;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  
  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(displayX + thirdW, displayY);
  ctx.lineTo(displayX + thirdW, displayY + displayH);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(displayX + thirdW * 2, displayY);
  ctx.lineTo(displayX + thirdW * 2, displayY + displayH);
  ctx.stroke();
  
  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(displayX, displayY + thirdH);
  ctx.lineTo(displayX + displayW, displayY + thirdH);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(displayX, displayY + thirdH * 2);
  ctx.lineTo(displayX + displayW, displayY + thirdH * 2);
  ctx.stroke();
}

function updateCropBoxDisplay() {
  const canvasRect = cropCanvas.getBoundingClientRect();
  const wrapperRect = canvasWrapper.getBoundingClientRect();
  
  const displayX = cropState.x / cropState.scaleRatio;
  const displayY = cropState.y / cropState.scaleRatio;
  const displayW = cropState.width / cropState.scaleRatio;
  const displayH = cropState.height / cropState.scaleRatio;
  
  const left = displayX * (canvasRect.width / cropCanvas.width) + canvasRect.left - wrapperRect.left;
  const top = displayY * (canvasRect.height / cropCanvas.height) + canvasRect.top - wrapperRect.top;
  const width = displayW * (canvasRect.width / cropCanvas.width);
  const height = displayH * (canvasRect.height / cropCanvas.height);
  
  cropBox.style.left = left + 'px';
  cropBox.style.top = top + 'px';
  cropBox.style.width = width + 'px';
  cropBox.style.height = height + 'px';
}

// Pointer Events (better than mouse events)
cropCanvas.addEventListener('pointerdown', startDrag);
document.addEventListener('pointermove', doDrag);
document.addEventListener('pointerup', endDrag);

function getNativeCoords(e) {
  const rect = cropCanvas.getBoundingClientRect();
  // Convert display coordinates to natural image coordinates
  const displayX = (e.clientX - rect.left) * (cropCanvas.width / rect.width);
  const displayY = (e.clientY - rect.top) * (cropCanvas.height / rect.height);
  
  return {
    x: displayX * cropState.scaleRatio,
    y: displayY * cropState.scaleRatio
  };
}

function getHandleAtPos(x, y) {
  const threshold = 20; // pixels in natural coordinates
  
  const corners = [
    { name: 'nw', x: cropState.x, y: cropState.y },
    { name: 'n', x: cropState.x + cropState.width / 2, y: cropState.y },
    { name: 'ne', x: cropState.x + cropState.width, y: cropState.y },
    { name: 'w', x: cropState.x, y: cropState.y + cropState.height / 2 },
    { name: 'e', x: cropState.x + cropState.width, y: cropState.y + cropState.height / 2 },
    { name: 'sw', x: cropState.x, y: cropState.y + cropState.height },
    { name: 's', x: cropState.x + cropState.width / 2, y: cropState.y + cropState.height },
    { name: 'se', x: cropState.x + cropState.width, y: cropState.y + cropState.height }
  ];
  
  for (let corner of corners) {
    if (Math.abs(x - corner.x) < threshold && Math.abs(y - corner.y) < threshold) {
      return corner.name;
    }
  }
  
  // Inside box - move
  if (x > cropState.x && x < cropState.x + cropState.width &&
      y > cropState.y && y < cropState.y + cropState.height) {
    return 'move';
  }
  
  return null;
}

function startDrag(e) {
  if (e.button !== 0) return; // Only left click
  
  pointerID = e.pointerId;
  cropCanvas.setPointerCapture(pointerID);
  
  const pos = getNativeCoords(e);
  dragHandle = getHandleAtPos(pos.x, pos.y);
  
  // If clicking outside the current box, start a new selection
  if (!dragHandle) {
    dragHandle = 'new';
    isDragging = true;
    dragStart = pos;
    cropState.x = Math.max(0, Math.min(pos.x, cropState.imgNaturalWidth));
    cropState.y = Math.max(0, Math.min(pos.y, cropState.imgNaturalHeight));
    cropState.width = 1;
    cropState.height = 1;
    redraw();
    updateCropBoxDisplay();
    e.preventDefault();
    return;
  }
  
  isDragging = true;
  dragStart = pos;
  e.preventDefault();
}

function doDrag(e) {
  if (!isDragging || e.pointerId !== pointerID) return;
  
  const pos = getNativeCoords(e);
  const dx = pos.x - dragStart.x;
  const dy = pos.y - dragStart.y;
  
  const minSize = 50;
  
  if (dragHandle === 'new') {
    const start = dragStart;
    let x2 = pos.x;
    let y2 = pos.y;
    
    if (e.shiftKey) {
      const size = Math.max(Math.abs(dx), Math.abs(dy));
      x2 = start.x + Math.sign(dx || 1) * size;
      y2 = start.y + Math.sign(dy || 1) * size;
    }
    
    const x1 = Math.max(0, Math.min(start.x, cropState.imgNaturalWidth));
    const y1 = Math.max(0, Math.min(start.y, cropState.imgNaturalHeight));
    const xClamped = Math.max(0, Math.min(x2, cropState.imgNaturalWidth));
    const yClamped = Math.max(0, Math.min(y2, cropState.imgNaturalHeight));
    
    const newX = Math.min(x1, xClamped);
    const newY = Math.min(y1, yClamped);
    const newW = Math.abs(xClamped - x1);
    const newH = Math.abs(yClamped - y1);
    
    if (newW >= minSize && newH >= minSize) {
      cropState.x = newX;
      cropState.y = newY;
      cropState.width = newW;
      cropState.height = newH;
    }
  } else if (dragHandle === 'move') {
    // Allow 360-degree free movement
    let newX = cropState.x + dx;
    let newY = cropState.y + dy;
    
    // Clamp to image bounds
    newX = Math.max(0, Math.min(newX, cropState.imgNaturalWidth - cropState.width));
    newY = Math.max(0, Math.min(newY, cropState.imgNaturalHeight - cropState.height));
    
    cropState.x = newX;
    cropState.y = newY;
  } else {
    resizeBox(dragHandle, dx, dy, minSize);
  }
  
  if (dragHandle !== 'new') {
    dragStart = pos;
  }
  redraw();
  updateCropBoxDisplay();
}

function resizeBox(handle, dx, dy, minSize) {
  let newX = cropState.x;
  let newY = cropState.y;
  let newW = cropState.width;
  let newH = cropState.height;
  
  const aspectLocked = currentRatio !== 'free';
  
  switch(handle) {
    case 'nw':
      newX += dx;
      newY += dy;
      newW -= dx;
      newH -= dy;
      break;
    case 'n':
      newY += dy;
      newH -= dy;
      if (aspectLocked) {
        newW = newH * currentRatio;
        newX = cropState.x - (newW - cropState.width) / 2;
      }
      break;
    case 'ne':
      newY += dy;
      newW += dx;
      newH -= dy;
      break;
    case 'w':
      newX += dx;
      newW -= dx;
      if (aspectLocked) {
        newH = newW / currentRatio;
        newY = cropState.y - (newH - cropState.height) / 2;
      }
      break;
    case 'e':
      newW += dx;
      if (aspectLocked) {
        newH = newW / currentRatio;
        newY = cropState.y - (newH - cropState.height) / 2;
      }
      break;
    case 'sw':
      newX += dx;
      newW -= dx;
      newH += dy;
      break;
    case 's':
      newH += dy;
      if (aspectLocked) {
        newW = newH * currentRatio;
        newX = cropState.x - (newW - cropState.width) / 2;
      }
      break;
    case 'se':
      newW += dx;
      newH += dy;
      break;
  }
  
  // Enforce constraints
  if (newW >= minSize && newH >= minSize &&
      newX >= 0 && newY >= 0 &&
      newX + newW <= cropState.imgNaturalWidth &&
      newY + newH <= cropState.imgNaturalHeight) {
    cropState.x = newX;
    cropState.y = newY;
    cropState.width = newW;
    cropState.height = newH;
  }
}

function endDrag(e) {
  if (e.pointerId === pointerID) {
    isDragging = false;
    dragHandle = null;
    cropCanvas.releasePointerCapture(pointerID);
  }
}

// Ratio buttons
document.querySelectorAll('.ratio-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const ratio = btn.dataset.ratio;
    if (ratio === '16:10') currentRatio = 16/10;
    else if (ratio === '4:3') currentRatio = 4/3;
    else if (ratio === '3:2') currentRatio = 3/2;
    else if (ratio === '1:1') currentRatio = 1;
    else currentRatio = 'free';
    
    if (currentRatio !== 'free') {
      const centerX = cropState.x + cropState.width / 2;
      const centerY = cropState.y + cropState.height / 2;
      
      let newW = cropState.width * 0.9;
      let newH = newW / currentRatio;
      
      if (newH > cropState.imgNaturalHeight * 0.9) {
        newH = cropState.imgNaturalHeight * 0.9;
        newW = newH * currentRatio;
      }
      
      cropState.x = Math.max(0, Math.min(centerX - newW / 2, cropState.imgNaturalWidth - newW));
      cropState.y = Math.max(0, Math.min(centerY - newH / 2, cropState.imgNaturalHeight - newH));
      cropState.width = newW;
      cropState.height = newH;
    }
    
    redraw();
    updateCropBoxDisplay();
  });
});

// Toolbar
window.cropZoom = function(factor) {
  cropState.scale *= factor;
  cropState.scale = Math.max(0.5, Math.min(cropState.scale, 3));
  redraw();
  updateCropBoxDisplay();
};

window.cropRotate = function() {
  cropState.rotation = (cropState.rotation + 90) % 360;
  redraw();
  updateCropBoxDisplay();
};

window.cropReset = function() {
  cropState.rotation = 0;
  cropState.scale = 1;
  setupCropper();
};

window.cropDeselect = function() {
  currentRatio = 'free';
  document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
  const freeBtn = document.querySelector('.ratio-btn[data-ratio="free"]');
  if (freeBtn) freeBtn.classList.add('active');

  cropState.x = 0;
  cropState.y = 0;
  cropState.width = cropState.imgNaturalWidth;
  cropState.height = cropState.imgNaturalHeight;
  redraw();
  updateCropBoxDisplay();
};

window.saveCroppedImage = function() {
  if (cropState.width < 50 || cropState.height < 50) {
    showNotification('❌ Crop area too small!', 'error');
    return;
  }
  
  // Render to output canvas from natural coordinates
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = cropState.width;
  outputCanvas.height = cropState.height;
  const outCtx = outputCanvas.getContext('2d');
  
  // Draw cropped portion from original image
  outCtx.drawImage(
    currentImage,
    cropState.x, cropState.y,
    cropState.width, cropState.height,
    0, 0,
    cropState.width, cropState.height
  );
  
  outputCanvas.toBlob((blob) => {
    savePhotoToDB(blob);
    cancelCrop();
  }, 'image/jpeg', 0.95);
};

window.cancelCrop = function() {
  gsap.to('.crop-container', {
    scale: 0.95, opacity: 0, duration: 0.2,
    onComplete: () => {
      cropModal.classList.remove('active');
      currentImage = null;
      currentFile = null;
      fileInput.value = '';
    }
  });
};

function savePhotoToDB(blob) {
  const reader = new FileReader();
  reader.onload = () => {
    // Add to UniverseStore first
    const universeId = window.universeStore.addImage(reader.result, {
      x: cropState.x, y: cropState.y,
      width: cropState.width, height: cropState.height
    });
    
    // Then add to IndexedDB with universeId reference
    const transaction = db.transaction(['memories'], 'readwrite');
    const store = transaction.objectStore('memories');
    
    const photo = {
      data: reader.result,
      timestamp: Date.now(),
      size: blob.size,
      universeId: universeId
    };
    
    const request = store.add(photo);
    request.onsuccess = () => {
      loadGallery();
      showNotification('✨ Photo saved!', 'success');
    };
  };
  reader.readAsDataURL(blob);
}

function loadGallery() {
  gallery.innerHTML = '';
  
  const transaction = db.transaction(['memories'], 'readonly');
  const store = transaction.objectStore('memories');
  const request = store.openCursor();
  
  const photos = [];
  
  request.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      photos.push({ id: cursor.key, ...cursor.value });
      cursor.continue();
    } else {
      photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const universeId = photo.universeId || photo.id;
        
        // Check if already in galaxy
        const inGalaxy = window.universeStore.images.find(img => img.id === universeId)?.added;
        const buttonText = inGalaxy ? 'In Galaxy ✓' : 'Add to Galaxy 🌌';
        const buttonStyle = inGalaxy ? 'opacity: 0.5; cursor: not-allowed;' : '';
        
        item.innerHTML = `
          <img src="${photo.data}" alt="Memory ${index + 1}">
          <div class="gallery-item-info">
            <span>Memory ${index + 1}</span>
            <button class="delete-btn" onclick="deletePhoto(${photo.id})">🗑️</button>
          </div>
          <button class="add-to-galaxy-btn" style="${buttonStyle}" onclick="addToGalaxy('${universeId}')">${buttonText}</button>
        `;
        gallery.appendChild(item);
        
        gsap.from(item, {
          scale: 0, opacity: 0, duration: 0.5,
          delay: index * 0.03, ease: 'back.out(1.7)'
        });
      });
      
      updateStats(photos);
    }
  };
}

window.deletePhoto = function(id) {
  if (!confirm('Remove this photo from your gallery?')) return;
  
  const transaction = db.transaction(['memories'], 'readwrite');
  const store = transaction.objectStore('memories');
  store.delete(id);
  
  transaction.oncomplete = () => {
    loadGallery();
    showNotification('🗑️ Photo removed', 'info');
  };
};



function updateStats(photos) {
  document.getElementById('photo-count').textContent = photos.length;
  
  const totalSize = photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
  const sizeInKB = Math.round(totalSize / 1024);
  document.getElementById('storage-used').textContent = sizeInKB > 1024 
    ? `${(sizeInKB / 1024).toFixed(1)} MB` 
    : `${sizeInKB} KB`;
}

function showNotification(message, type = 'success') {
  const colors = {
    success: 'rgba(108, 255, 142, 0.9)',
    error: 'rgba(255, 68, 68, 0.9)',
    info: 'rgba(178, 92, 255, 0.9)'
  };
  
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 600;
  `;
  document.body.appendChild(notification);
  
  gsap.from(notification, { x: 100, opacity: 0, duration: 0.3 });
  gsap.to(notification, { 
    opacity: 0, x: 100, duration: 0.3, delay: 2.5,
    onComplete: () => notification.remove()
  });
}

window.addToGalaxy = function(imageId) {
  const universeStore = window.universeStore;
  if (!universeStore) {
    showNotification('⚠️ Galaxy system not ready', 'error');
    return;
  }

  // Find the photo in the store
  const photo = universeStore.images.find(img => img.id === imageId);
  if (!photo) {
    showNotification('📸 Photo not found', 'error');
    return;
  }

  // Check if already added
  if (photo.added) {
    showNotification('ℹ️ Already in galaxy!', 'info');
    return;
  }

  // Generate a spiral position for this node
  const nodeCount = universeStore.memoryNodes.length;
  const spiralArms = 3;
  const angle = (nodeCount / 30) * Math.PI * 8 + ((nodeCount % spiralArms) * Math.PI * 2 / spiralArms);
  const radius = 30 + (nodeCount / 30) * 150;
  const height = Math.sin(nodeCount * 0.15) * 50;

  const position = {
    x: Math.cos(angle) * radius,
    y: height,
    z: Math.sin(angle) * radius
  };

  // Add to galaxy
  universeStore.addToGalaxy(imageId, position);

  // Reload gallery to update button state
  loadGallery();
  
  showNotification('✨ Added to galaxy!', 'success');
};


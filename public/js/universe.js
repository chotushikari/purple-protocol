// 3D STELLAR NODE GALAXY - Cinema Grade
let scene, camera, renderer, controls;
let galaxyGroup, memoryNodes = [];
let starField, bloomPass;
let raycaster, mouse = { x: 0, y: 0 };
let scrollVelocity = 0;
let cameraSpeed = 0;

PageTransition.init();

// Galaxy scene manager
class GalaxyScene {
  constructor() {
    this.scene = scene;
    this.memoryMeshes = new Map();
    this.nodeCount = 0;
  }

  addMemoryNode(imageId) {
    const imageData = universeStore.images.find(img => img.id === imageId);
    if (!imageData) return;

    // Get or create position
    let position = universeStore.memoryNodes.find(n => n.imageId === imageId)?.position;
    if (!position) {
      position = this.generateSpiralPosition(this.nodeCount++);
    }

    // Create billboarded sprite
    const texture = this.createTextureFromData(imageData.data);
    const geometry = new THREE.PlaneGeometry(10, 6.67);
    
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color(0xb25cff),
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.userData = { imageId, isMemoryNode: true };

    // Add glow layer
    const glowGeometry = new THREE.PlaneGeometry(10.5, 7.2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xb25cff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -0.1;
    mesh.add(glowMesh);
    mesh.userData.glowMesh = glowMesh;

    galaxyGroup.add(mesh);
    this.memoryMeshes.set(imageId, mesh);

    // Animate in
    gsap.from(mesh.position, {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      duration: 1.5,
      ease: 'power3.out'
    });

    gsap.from(mesh.scale, {
      x: 0, y: 0, z: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)'
    });
  }

  generateSpiralPosition(index) {
    const spiralArms = 3;
    const angle = (index / 30) * Math.PI * 8 + ((index % spiralArms) * Math.PI * 2 / spiralArms);
    const radius = 30 + (index / 30) * 150;
    const height = Math.sin(index * 0.15) * 50;

    return {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius
    };
  }

  createTextureFromData(imageData) {
    const image = new Image();
    const canvas = document.createElement('canvas');
    
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
    };
    image.src = imageData;

    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    return texture;
  }
}

async function initScene() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05030a);
  scene.fog = new THREE.FogExp2(0x05030a, 0.002);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('universe-canvas'),
    antialias: true,
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xb25cff, 1.5, 500);
  pointLight.position.set(100, 100, 100);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // Galaxy group
  galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  // Create starfield
  createStarfield();

  // Post-processing with Bloom
  setupBloom();

  // Raycaster for interactions
  raycaster = new THREE.Raycaster();

  // Controls
  setupInteraction();

  // Initialize galaxy scene
  window.galaxyScene = new GalaxyScene();

  // Load existing photos
  loadExistingPhotos();

  animate();
}

function createStarfield() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 5000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const purpleColor = new THREE.Color(0xb25cff);
  const pinkColor = new THREE.Color(0xff6ad5);
  const whiteColor = new THREE.Color(0xffffff);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;

    // Spherical distribution
    const radius = 400 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Color variation
    const colorChoice = Math.random();
    const color = colorChoice < 0.3 ? purpleColor :
      colorChoice < 0.5 ? pinkColor : whiteColor;

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });

  starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
}

function setupBloom() {
  const renderPass = new THREE.RenderPass(scene, camera);

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,    // strength
    0.4,    // radius
    0.85    // threshold
  );

  const effectComposer = new THREE.EffectComposer(renderer);
  effectComposer.setSize(window.innerWidth, window.innerHeight);
  effectComposer.addPass(renderPass);
  effectComposer.addPass(bloomPass);

  window.effectComposer = effectComposer;
}

function setupInteraction() {
  let scrollTimeout;

  // Scroll traversal
  window.addEventListener('wheel', (e) => {
    scrollVelocity = e.deltaY * 0.05;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scrollVelocity *= 0.98;
    }, 100);
  }, { passive: true });

  // Mouse parallax
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Hover effects with raycaster
  window.addEventListener('mousemove', (e) => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(galaxyGroup.children);

    galaxyGroup.children.forEach(child => {
      if (child.userData.isMemoryNode && child.userData.glowMesh) {
        child.userData.glowMesh.material.opacity = 0;
      }
    });

    for (let intersection of intersects) {
      if (intersection.object.userData.isMemoryNode) {
        intersection.object.userData.glowMesh.material.opacity = 0.6;
        gsap.to(intersection.object.scale, {
          x: 1.1, y: 1.1, z: 1.1,
          duration: 0.3,
          overwrite: 'auto'
        });
      }
    }
  });

  // Resize handling
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    window.effectComposer.setSize(width, height);
  });
}

function loadExistingPhotos() {
  // Load only photos that have been added to galaxy
  universeStore.memoryNodes.forEach((node, index) => {
    const image = universeStore.images.find(img => img.id === node.imageId);
    if (!image) return;

    const textureImage = new Image();

    textureImage.onload = () => {
      const texture = new THREE.Texture(textureImage);
      texture.needsUpdate = true;

      const geometry = new THREE.PlaneGeometry(10, 6.67);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0xb25cff),
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.4
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.position.x, node.position.y, node.position.z);
      mesh.userData = { imageId: image.id, isMemoryNode: true };

      // Glow
      const glowGeometry = new THREE.PlaneGeometry(10.5, 7.2);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xb25cff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.z = -0.1;
      mesh.add(glowMesh);
      mesh.userData.glowMesh = glowMesh;

      galaxyGroup.add(mesh);
      window.galaxyScene.memoryMeshes.set(image.id, mesh);
    };

    textureImage.src = image.data;
  });
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0005;

  // Camera movement based on scroll
  camera.position.z -= scrollVelocity;
  scrollVelocity *= 0.95;

  // Parallax
  camera.position.x += (mouse.x * 30 - camera.position.x) * 0.05;
  camera.position.y += (mouse.y * 30 - camera.position.y) * 0.05;

  // Look ahead
  camera.lookAt(
    camera.position.x,
    camera.position.y,
    camera.position.z - 50
  );

  // Rotate galaxy slowly
  galaxyGroup.rotation.y += 0.00005;

  // Animate memory nodes
  galaxyGroup.children.forEach(child => {
    if (child.userData.isMemoryNode) {
      // Floating animation
      child.position.y += Math.sin(time + child.position.x * 0.01) * 0.02;

      // Billboard effect - always face camera
      const direction = camera.position.clone().sub(child.position);
      const rotation = new THREE.Euler();
      rotation.setFromVector3(direction);
      child.quaternion.setFromEuler(rotation);
    }
  });

  // Starfield rotation
  if (starField) {
    starField.rotation.y += 0.00002;
    starField.rotation.x = Math.sin(time * 0.2) * 0.05;
  }

  // Render with post-processing
  if (window.effectComposer) {
    window.effectComposer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// Start screen
const startScreen = document.getElementById('start-screen');
const beginBtn = document.getElementById('start-btn');

// Helper to load script dynamically
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Load Three.js extensions and initialize
async function loadAndInitialize() {
  try {
    // Load all three required scripts in parallel
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/postprocessing/EffectComposer.js'),
      loadScript('https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/postprocessing/RenderPass.js'),
      loadScript('https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/postprocessing/UnrealBloomPass.js')
    ]);
    // Scripts loaded, now safe to initialize
    initScene();
  } catch (err) {
    console.warn('Some Three.js extensions failed to load, initializing without bloom:', err);
    initScene();
  }
}

beginBtn.addEventListener('click', () => {
  const music = document.getElementById('universe-music');
  music.play().catch(() => console.log('Audio autoplay blocked'));

  gsap.to(startScreen, {
    opacity: 0,
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      startScreen.style.display = 'none';
      document.getElementById('ui').style.opacity = 1;
    }
  });

  loadAndInitialize();
});

// Controls
const continueBtn = document.getElementById('continue-btn');
const muteBtn = document.getElementById('mute-btn');
const music = document.getElementById('universe-music');

continueBtn.addEventListener('click', () => {
  PageTransition.navigateTo('game.html');
});

muteBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    muteBtn.textContent = '🔊 Music';
  } else {
    music.pause();
    muteBtn.textContent = '🔇 Music';
  }
});



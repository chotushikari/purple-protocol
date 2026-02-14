import * as THREE from 'three';
import gsap from 'gsap';
import { config } from '../config.js';
import '../styles/galaxy.css';

// === CONFIGURATION ===
const GALAXY_CONFIG = {
    cameraSpeed: 0.05,
    colors: [0xb25cff, 0xff6ad5, 0x6a00ff, 0x00f0ff], // Vaporwave palette
    infiniteCopies: 20, // MASSIVE scale
    viralSymbols: ['❤️', '✨', '🪐', '🚀', '💿', '🦋', '11:11', '444', '777', '😍', '💍', '🧿', '🍀'],
    notes: [
        "You are my universe", "Gravity pulls me to you", "Infinite love", "Written in the stars",
        "Soulmate status", "My favorite notification", "Loading: Forever...", "Error: Too cute",
        "System overload: Love", "Glitch in my heart", "Data: 100% Love"
    ]
};

export function mountLevel2(container, onNextLevel) {
    container.innerHTML = `
    <canvas id="universe-canvas"></canvas>
    <div id="galaxy-ui">
      <div class="galaxy-caption" style="opacity:0; transition: opacity 2s;">
        <h1 style="text-shadow: 0 0 20px #b25cff;">${config.identity.name}'s Infiniteverse 🌌</h1>
        <p>Scroll to Travel • Click to Remember</p>
      </div>
      <div id="loading-indicator">Generating Galaxy...</div>
      <div id="hover-tooltip"></div>
      <button class="next-btn hidden" id="lvl2-next">Find Our Destiny &rarr;</button>
    </div>
    <!-- Modal Container -->
    <div id="photo-modal" class="photo-modal-overlay" style="display:none;">
        <div class="photo-modal-content">
            <button class="close-modal">&times;</button>
            <img id="modal-img" src="" alt="Memory">
            <div id="modal-caption" class="photo-modal-caption"></div>
        </div>
    </div>
  `;

    const canvas = document.getElementById('universe-canvas');
    const loadingParams = document.getElementById('loading-indicator');

    loadMemories().then(data => {
        loadingParams.style.display = 'none';
        initThreeJS(canvas, data, onNextLevel);

        setTimeout(() => {
            document.querySelector('.galaxy-caption').style.opacity = 1;
        }, 1000);

        setTimeout(() => {
            const btn = document.getElementById('lvl2-next');
            btn.classList.remove('hidden');
            btn.addEventListener('click', () => {
                cleanup();
                onNextLevel();
            });
        }, 5000);
    });
}

// === DATA LOADING ===
async function loadMemories() {
    try {
        const response = await fetch('/memories.json?t=' + Date.now());
        if (!response.ok) throw new Error("No custom memories found");
        let data = await response.json();
        if (!Array.isArray(data)) data = [];
        return data;
    } catch (e) {
        console.error("Loading Failed:", e);
        // User feedback for failure
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.innerText = "Error loading memories. Please check console.";
            loader.style.color = "red";
        }
        return [];
    }
}

// === THREE.JS LOGIC ===
let scene, camera, renderer, animationId;
let interactables = [];
let particles = [];
let scrollY = 0;
let targetScrollY = 0;
let isModalOpen = false;

function initThreeJS(canvas, rawMemories, onNextLevel) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020005);
    scene.fog = new THREE.FogExp2(0x020005, 0.0015);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2500);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const pl = new THREE.PointLight(0xff6ad5, 2, 1000);
    pl.position.set(0, 0, 100);
    scene.add(pl);

    // 1. Core Content: The Memory Helix
    // If no memories, we fill it with love notes
    let helixItems = [];
    if (rawMemories.length > 0) {
        // Multiply memories to create volume
        for (let i = 0; i < GALAXY_CONFIG.infiniteCopies * 2; i++) {
            helixItems = [...helixItems, ...rawMemories];
        }
    } else {
        // Generate placeholder notes if no photos
        for (let i = 0; i < 50; i++) {
            helixItems.push({
                type: 'note',
                symbol: GALAXY_CONFIG.viralSymbols[i % GALAXY_CONFIG.viralSymbols.length],
                caption: GALAXY_CONFIG.notes[i % GALAXY_CONFIG.notes.length]
            });
        }
    }

    createHelix(helixItems);

    // 2. Ambient Fillers: "Viral" Symbols everywhere
    createAmbientFloaters();

    // 3. Environment: Stars & Dust
    createStarfield();
    createShootingStars();
    createLightning(); // NEW: Lightning Storm
    createFloatingGeo(); // NEW: 3D Shapes

    // 4. Interaction
    setupInteraction();

    // NEW: Audio Logic
    const audio = new Audio(config.galaxy.musicTrack);
    audio.loop = true;
    audio.volume = 0.5;

    const playAudio = () => {
        audio.play().catch(() => {
            // Autoplay blocked, waiting for interaction
            // Add a one-time click listener to start audio
            const enableAudio = () => {
                audio.play();
                window.removeEventListener('click', enableAudio);
            };
            window.addEventListener('click', enableAudio);
        });
    };
    playAudio();

    // Animation
    const animate = () => {
        animationId = requestAnimationFrame(animate);

        if (!isModalOpen) {
            // Scroll flight
            targetScrollY += (scrollY - targetScrollY) * 0.05;
            camera.position.z = 100 - (targetScrollY * 0.8);

            // Dynamic rotation
            scene.rotation.z += 0.0005;

            // Infinite Loop Logic
            if (camera.position.z < -10000) {
                targetScrollY = 0;
                scrollY = 0;
                camera.position.z = 100;
            }
        }

        // Object Animations
        interactables.forEach((mesh, i) => {
            if (mesh.userData.type === 'photo') {
                mesh.lookAt(camera.position);
            } else if (mesh.userData.type === 'geo') {
                mesh.rotation.x += 0.01;
                mesh.rotation.y += 0.02;
            } else {
                mesh.rotation.y += 0.01;
                mesh.rotation.z += 0.005;
            }
        });

        // Ambient particles drift & Pulse
        particles.forEach((p, i) => {
            p.position.y += Math.sin(Date.now() * 0.001 + i) * 0.1;
            // Pulse size
            if (i % 3 === 0) {
                p.scale.setScalar(1 + Math.sin(Date.now() * 0.005 + i) * 0.5);
            }
        });

        // Effect Updates
        updateShootingStars();
        updateLightning();

        renderer.render(scene, camera);
    };
    animate();
}

// === NEW VISUAL SYSTEMS ===

// 1. Lightning System
let lightnings = [];
function createLightning() {
    for (let i = 0; i < 3; i++) {
        const geo = new THREE.BufferGeometry();
        const count = 20; // Segments
        const pos = new Float32Array(count * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff, // White hot
            transparent: true,
            opacity: 0,
            linewidth: 2
        });

        const line = new THREE.Line(geo, mat);
        scene.add(line);
        lightnings.push(line);
    }
}

function updateLightning() {
    lightnings.forEach(line => {
        if (Math.random() < 0.01) { // 1% chance to strike per frame
            // Randomize position
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = camera.position.z - 200 - Math.random() * 500;

            const positions = line.geometry.attributes.position.array;
            let currentY = y;
            for (let i = 0; i < 20; i++) {
                positions[i * 3] = x + (Math.random() - 0.5) * 50; // Jitter X
                positions[i * 3 + 1] = currentY;
                positions[i * 3 + 2] = z;
                currentY -= 20 + Math.random() * 20; // Downward
            }
            line.geometry.attributes.position.needsUpdate = true;

            // Flash on
            line.material.opacity = 1;
            line.userData.flash = 10; // Frames to stay visible
        } else if (line.userData.flash > 0) {
            line.userData.flash--;
            line.material.opacity = Math.random(); // Flicker effect
        } else {
            line.material.opacity = 0;
        }
    });
}

// 2. Floating 3D Geometry
function createFloatingGeo() {
    const geometries = [
        new THREE.IcosahedronGeometry(10, 0),
        new THREE.TorusKnotGeometry(8, 3, 100, 16),
        new THREE.OctahedronGeometry(12)
    ];

    for (let i = 0; i < 30; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = new THREE.MeshBasicMaterial({
            color: getRandomColor(),
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 600,
            (Math.random() - 0.5) * 600,
            -Math.random() * 4000
        );
        mesh.userData = { type: 'geo' };

        scene.add(mesh);
        interactables.push(mesh);
    }
}

// Shooting Stars System
let shootingStars = [];
function createShootingStars() {
    for (let i = 0; i < 5; i++) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array([0, 0, 0, 0, 0, 20]); // Tail length
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        const line = new THREE.Line(geo, mat);

        resetShootingStar(line);
        scene.add(line);
        shootingStars.push(line);
    }
}

function resetShootingStar(star) {
    star.position.x = (Math.random() - 0.5) * 1000;
    star.position.y = (Math.random() - 0.5) * 1000;
    star.position.z = (Math.random() - 0.5) * 500;
    star.userData = {
        speed: 5 + Math.random() * 10,
        delay: Math.random() * 200
    };
    star.material.opacity = 0;
}

function updateShootingStars() {
    shootingStars.forEach(star => {
        if (star.userData.delay > 0) {
            star.userData.delay--;
            return;
        }

        star.position.z += star.userData.speed;
        star.material.opacity = Math.sin((star.position.z + 500) * 0.01); // Fade in/out logic simplified

        if (star.position.z > 200) {
            resetShootingStar(star);
        }
    });
}

function createHelix(items) {
    const radius = 120; // BIG & WIDE!
    const step = 30; // Dense vertically

    items.forEach((item, i) => {
        const angle = i * 0.25; // Gentle rotation
        // Organic Jitter (so it looks like a galaxy, not a math equation)
        const jitter = (Math.random() - 0.5) * 60;

        const x = Math.cos(angle) * radius + jitter;
        const y = Math.sin(angle) * radius + jitter;
        const z = -i * step;

        if (item.type === 'photo' || item.image) {
            createPolaroid(item, x, y, z);
        } else {
            createLoveNote(item, x, y, z);
        }
    });
}

function createAmbientFloaters() {
    // Add random floating symbols OUTSIDE the main helix to fill space
    for (let i = 0; i < 200; i++) {
        const symbol = GALAXY_CONFIG.viralSymbols[i % GALAXY_CONFIG.viralSymbols.length];
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = "40px Arial";
        ctx.fillStyle = getRandomColor();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol, 32, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.7 });
        const sprite = new THREE.Sprite(mat);

        // Random placement in a large cylinder
        const r = 80 + Math.random() * 200; // Farther out
        const theta = Math.random() * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = -Math.random() * 5000; // Deep into space

        sprite.position.set(x, y, z);
        sprite.scale.set(15, 15, 1);

        scene.add(sprite);
        particles.push(sprite);
    }
}

function createPolaroid(item, x, y, z) {
    // Doubled the size for better visibility!
    const geometry = new THREE.PlaneGeometry(40, 50);
    const texture = createPolaroidTexture(item);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.rotation.z = (Math.random() - 0.5) * 0.5;
    mesh.userData = { type: 'photo', data: item }; // Store full item data

    scene.add(mesh);
    interactables.push(mesh);
}

function createLoveNote(item, x, y, z) {
    // 3D Text illusion with sprite
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Purple Glow Box
    ctx.shadowColor = "#b25cff";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "rgba(20, 0, 40, 0.8)";
    ctx.fillRect(10, 10, 236, 108);

    ctx.fillStyle = "#fff";
    ctx.font = "30px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0;
    ctx.fillText(item.symbol || "💜", 128, 40);
    ctx.font = "16px Arial";
    ctx.fillText(item.caption || "Love", 128, 80);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);

    sprite.position.set(x, y, z);
    sprite.scale.set(20, 10, 1);
    sprite.userData = { type: 'note', data: item };

    scene.add(sprite);
    interactables.push(sprite);
}

function createPolaroidTexture(item) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 640;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 512, 640);
    ctx.fillStyle = '#222';
    ctx.fillRect(25, 25, 462, 462); // Dark bg for image

    ctx.fillStyle = '#000';
    ctx.font = '30px Courier';
    ctx.textAlign = 'center';
    ctx.fillText(item.caption ? item.caption.substring(0, 20) : '', 256, 580);

    const tex = new THREE.CanvasTexture(canvas);
    if (item.image) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 25, 25, 462, 462);
            tex.needsUpdate = true;
        }
        img.src = item.image;
    }
    return tex;
}

function createStarfield() {
    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 3000;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(geo, mat));
}

function getRandomColor() {
    return GALAXY_CONFIG.colors[Math.floor(Math.random() * GALAXY_CONFIG.colors.length)];
}

function setupInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('hover-tooltip');

    // Modal Elements
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCap = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.close-modal');

    // Close Modal Logic
    const closeModal = () => {
        modal.style.display = 'none';
        isModalOpen = false;
    };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('wheel', (e) => {
        if (!isModalOpen) scrollY += e.deltaY;
    });

    window.addEventListener('click', (e) => {
        if (isModalOpen) return;

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(interactables);
        if (intersects.length > 0) {
            const item = intersects[0].object.userData.data;
            if (item.type === 'photo' || item.image) {
                // Open Lightbox
                modalImg.src = item.image;
                modalCap.innerText = item.caption;
                modal.style.display = 'flex';
                isModalOpen = true;
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isModalOpen) return;

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(interactables);
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            // Scale up
            gsap.to(intersects[0].object.scale, { x: 1.5, y: 1.5, duration: 0.2 });
        } else {
            document.body.style.cursor = 'default';
            // Reset scales
            interactables.forEach(obj => {
                const baseScale = obj.userData.type === 'note' ? 20 : 1;
                gsap.to(obj.scale, { x: baseScale, y: (obj.userData.type === 'note' ? 10 : 1), duration: 0.2 });
            });
        }
    });
}

function cleanup() {
    cancelAnimationFrame(animationId);
    scene.clear();
    renderer.dispose();
}

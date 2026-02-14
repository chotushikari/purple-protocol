// UNIVERSAL MEMORY GALAXY - State Management Store
class UniverseStore {
  constructor() {
    this.images = [];
    this.memoryNodes = [];
    this.galaxy = null;
    this.observers = [];
  }

  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  notify() {
    this.observers.forEach(callback => callback(this.getState()));
  }

  addImage(imageData, cropData) {
    const id = Date.now().toString();
    const image = {
      id,
      data: imageData,
      crop: cropData,
      timestamp: Date.now(),
      added: false
    };
    
    this.images.push(image);
    this.notify();
    return id;
  }

  addToGalaxy(imageId, position) {
    const image = this.images.find(img => img.id === imageId);
    if (!image) return;
    
    const node = {
      imageId,
      position,
      mesh: null,
      added: true,
      timestamp: Date.now()
    };
    
    this.memoryNodes.push(node);
    image.added = true;
    this.notify();
  }

  removeImage(imageId) {
    this.images = this.images.filter(img => img.id !== imageId);
    this.memoryNodes = this.memoryNodes.filter(node => node.imageId !== imageId);
    this.notify();
  }

  getState() {
    return {
      images: this.images,
      memoryNodes: this.memoryNodes
    };
  }

  setGalaxy(galaxy) {
    this.galaxy = galaxy;
  }
}

// Global store instance
const universeStore = new UniverseStore();

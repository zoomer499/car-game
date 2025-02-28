import { jest } from '@jest/globals';  // ✅ Импортируем jest

export const Scene = class {
  constructor() {}
  add() {}
};

export const PerspectiveCamera = class {
  constructor() {}
  position = { set: () => {} };
  lookAt = () => {};
  updateProjectionMatrix = () => {};
};

export const WebGLRenderer = class {
  constructor() {
      this.domElement = document.createElement('canvas'); // ✅ Добавляем реальный `canvas`
  }
  setSize = () => {};
  shadowMap = { enabled: false };
  render = () => {};
};
export const BoxGeometry = class {
  constructor(width, height, depth) {
      this.parameters = { height };  // ✅ Добавляем `parameters.height`
      this.width = width;
      this.height = height;
      this.depth = depth;
  }
};

export const HemisphereLight = class {};
export const AmbientLight = class {};
export const Group = class {
  constructor() {
      this.children = [];
      this.position = { x: 0, y: 0, z: 0, set: jest.fn() };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.add = jest.fn((child) => this.children.push(child));
  }
};
export const DirectionalLight = class {
  constructor() {}
  position = { set: () => {} };  // ✅ Добавляем `set()`
  castShadow = false;
};
export const TextureLoader = class {
  load = () => ({
      wrapS: null,
      wrapT: null,
      repeat: { set: () => {} }
  });
};
export const MeshStandardMaterial = class {};
export const PlaneGeometry = class {};

export const Mesh = class {
  constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = { set: jest.fn() };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.castShadow = false;
      this.receiveShadow = false;
  }
};

export const CylinderGeometry = class {
  constructor(radiusTop, radiusBottom, height, radialSegments) {
      this.parameters = { height };  // ✅ Добавляем `parameters.height`
      this.radiusTop = radiusTop;
      this.radiusBottom = radiusBottom;
      this.height = height;
      this.radialSegments = radialSegments;
  }
};

export const SphereGeometry = class {
  constructor(radius, widthSegments, heightSegments) {
      this.parameters = { height: radius * 2 };  // ✅ Сферу можно считать "высотой"
      this.radius = radius;
      this.widthSegments = widthSegments;
      this.heightSegments = heightSegments;
  }
};

export const ConeGeometry = class {
  constructor(radius, height, radialSegments) {
      this.parameters = { height };
      this.radius = radius;
      this.radialSegments = radialSegments;
  }
};

export const DodecahedronGeometry = class {
  constructor(radius) {
    this.parameters = { radius };
    this.radius = radius;
  }
};
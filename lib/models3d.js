import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const cache = new Map();

export const MODEL_PATHS = {
  roadStraight: '/models/roads/road-straight.glb',
  roadLightposts: '/models/roads/road-straight-lightposts.glb',
  roadIntersection: '/models/roads/road-intersection.glb',
  roadCorner: '/models/roads/road-corner.glb',
  roadSplit: '/models/roads/road-split.glb',
  buildingA: '/models/buildings/building-small-a.glb',
  buildingB: '/models/buildings/building-small-b.glb',
  buildingC: '/models/buildings/building-small-c.glb',
  buildingD: '/models/buildings/building-small-d.glb',
  gatehouse: '/models/buildings/building-garage.glb',
  trees: '/models/trees/grass-trees.glb',
  treesTall: '/models/trees/grass-trees-tall.glb',
  grass: '/models/trees/grass.glb',
  fountain: '/models/amenities/pavement-fountain.glb',
  pavement: '/models/amenities/pavement.glb',
};

export function loadGlbTemplate(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((resolve, reject) => {
        loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
      })
    );
  }
  return cache.get(url);
}

/**
 * Clones a cached GLB scene, normalizes its base to y=0, scales uniformly,
 * and applies status-appropriate materials so Completed / Under Construction / Upcoming
 * are visually unmistakable without misrepresenting unbuilt structures.
 */
export function instantiateModel(template, { scale = 1, status = 'Completed', rotationY = 0 } = {}) {
  const clone = template.clone(true);
  clone.scale.setScalar(scale);
  clone.rotation.y = rotationY;
  clone.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(clone);
  clone.position.y -= box.min.y;

  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = status === 'Completed';
    child.receiveShadow = true;

    const origMat = child.material;
    if (status === 'Completed') {
      child.material = origMat.clone();
    } else if (status === 'Under Construction') {
      const m = origMat.clone();
      m.color.lerp(new THREE.Color(0xf2b230), 0.45);
      m.transparent = true;
      m.opacity = 0.78;
      child.material = m;

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(child.geometry, 25),
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 })
      );
      child.add(edges);
    } else {
      // Upcoming: translucent architectural blueprint ghost
      child.material = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.22,
        roughness: 0.7,
        depthWrite: false,
      });
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(child.geometry, 24),
        new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.65 })
      );
      child.add(edges);
    }
  });

  return clone;
}

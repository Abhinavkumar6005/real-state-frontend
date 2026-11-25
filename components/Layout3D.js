'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API, mediaUrl } from '@/lib/api';
import { MODEL_PATHS, instantiateModel, loadGlbTemplate } from '@/lib/models3d';

gsap.registerPlugin(ScrollTrigger);

const STATUS_STYLE = {
  Completed: { badge: 'bg-field text-white', dot: 'bg-emerald-400', label: 'Completed' },
  'Under Construction': { badge: 'bg-marigold text-dusk', dot: 'bg-amber-400', label: 'Under Construction' },
  Upcoming: { badge: 'bg-slate-600 text-white', dot: 'bg-sky-300', label: 'Upcoming' },
};

const PLOT_COLORS = {
  Available: 0x2f6b4f,
  Reserved: 0xf2b230,
  Booked: 0xf2b230,
  Sold: 0x475569,
};

const ZONE_MODELS_TO_LOAD = [
  MODEL_PATHS.roadLightposts,
  MODEL_PATHS.roadStraight,
  MODEL_PATHS.roadIntersection,
  MODEL_PATHS.gatehouse,
  MODEL_PATHS.buildingA,
  MODEL_PATHS.buildingB,
  MODEL_PATHS.buildingC,
  MODEL_PATHS.buildingD,
  MODEL_PATHS.trees,
  MODEL_PATHS.treesTall,
  MODEL_PATHS.grass,
  MODEL_PATHS.fountain,
  MODEL_PATHS.pavement,
];

function createZoneGroup(zone, modelMap) {
  const g = new THREE.Group();
  const w = Number(zone.width) || 2.6;
  const d = Number(zone.depth) || 2.6;
  const status = zone.status || 'Upcoming';
  const isDone = status === 'Completed';
  const isOngoing = status === 'Under Construction';

  const addTile = (url, x, z, scale = 1.98, rot = 0) => {
    const tpl = modelMap[url];
    if (!tpl) return;
    const m = instantiateModel(tpl, { scale, status, rotationY: rot });
    m.position.set(x, m.position.y, z);
    g.add(m);
  };

  if (zone.shape === 'road') {
    const count = Math.max(3, Math.round(d / 2));
    for (let i = 0; i < count; i++) {
      const z = -d / 2 + 1 + i * (d / count);
      const url = i === Math.floor(count / 2) ? MODEL_PATHS.roadIntersection : MODEL_PATHS.roadLightposts;
      addTile(url, 0, z, 2.005, 0);
    }
    // Cross-avenue branches connecting left & right sectors
    [-4, -2, 2, 4].forEach((rx) => {
      addTile(MODEL_PATHS.roadLightposts, rx, 1, 2.005, Math.PI / 2);
    });
  } else if (zone.shape === 'gate') {
    addTile(MODEL_PATHS.roadStraight, 0, 0, 2.005, 0);
    addTile(MODEL_PATHS.gatehouse, -2.0, 0, 1.85, Math.PI / 2);
    addTile(MODEL_PATHS.trees, 2.0, 0, 1.85, 0);
  } else if (zone.shape === 'park') {
    addTile(MODEL_PATHS.fountain, 0, 0, 2.005, 0);
    addTile(MODEL_PATHS.treesTall, -1.75, -1.05, 1.7, 0);
    addTile(MODEL_PATHS.trees, 1.75, -1.05, 1.7, Math.PI / 2);
    addTile(MODEL_PATHS.trees, -1.75, 1.05, 1.7, Math.PI);
    addTile(MODEL_PATHS.grass, 1.75, 1.05, 1.7, 0);
  } else if (zone.shape === 'clubhouse') {
    addTile(MODEL_PATHS.buildingC, 0, 0, 1.95, 0);
    addTile(MODEL_PATHS.pavement, -1.95, 0, 1.75, 0);
    addTile(MODEL_PATHS.trees, 1.95, 0, 1.75, 0);
  } else if (zone.shape === 'utility') {
    addTile(MODEL_PATHS.pavement, 0, 0, 2.4, 0);
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, d),
      new THREE.MeshStandardMaterial({ color: isDone ? 0x334155 : 0x475569, roughness: 0.9 })
    );
    pad.position.y = 0.05;
    g.add(pad);
    const col = isDone ? 0x0ea5e9 : isOngoing ? 0xf2b230 : 0x60a5fa;
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([cx, cz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.12), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      leg.position.set(cx, 0.68, cz);
      g.add(leg);
    });
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: col, transparent: !isDone, opacity: isDone ? 1 : 0.65, roughness: 0.45 })
    );
    tank.position.set(0, 1.5, 0);
    g.add(tank);
  } else if (zone.shape === 'sectorA') {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.08, d),
      new THREE.MeshStandardMaterial({ color: isDone ? 0x1e3a34 : 0x475569, roughness: 0.9 })
    );
    pad.position.y = 0.04;
    g.add(pad);
    addTile(MODEL_PATHS.buildingA, -1.5, -1.6, 1.65, 0);
    addTile(MODEL_PATHS.buildingD, 1.3, -1.6, 1.65, 0);
    addTile(MODEL_PATHS.trees, -1.5, 1.7, 1.65, 0);
  } else if (zone.shape === 'sectorB') {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.08, d),
      new THREE.MeshStandardMaterial({ color: isOngoing ? 0x5c4727 : 0x334155, roughness: 0.9 })
    );
    pad.position.y = 0.04;
    g.add(pad);
    addTile(MODEL_PATHS.buildingB, 1.2, -1.1, 1.75, Math.PI);
    addTile(MODEL_PATHS.grass, -1.2, 1.1, 1.75, 0);
  } else {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.08, d),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: status === 'Upcoming', opacity: status === 'Upcoming' ? 0.5 : 1 })
    );
    pad.position.y = 0.04;
    g.add(pad);
    addTile(MODEL_PATHS.buildingD, 0, 0, 1.55, 0);
  }

  // Animated tower crane for Under Construction zones
  if (isOngoing && zone.shape !== 'road') {
    const crane = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 0.1), new THREE.MeshStandardMaterial({ color: 0xf2b230, roughness: 0.4 }));
    mast.position.y = 1.05;
    crane.add(mast);
    const jib = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.09, 0.09), new THREE.MeshStandardMaterial({ color: 0xf2b230, roughness: 0.4 }));
    jib.position.set(0.45, 2.08, 0);
    crane.add(jib);
    crane.position.set(w * 0.3, 0.08, -d * 0.25);
    crane.userData.isCrane = true;
    g.add(crane);
  }

  g.position.set(Number(zone.gridX) || 0, 0, Number(zone.gridZ) || 0);
  return g;
}

export default function Layout3D({ s, construction: initialConstruction, plots: initialPlots }) {
  const wrap = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [construction, setConstruction] = useState(initialConstruction || null);
  const [plots, setPlots] = useState(initialPlots || []);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [scrollZoom, setScrollZoom] = useState(false);
  const [viewMode, setViewMode] = useState('3d');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    if (!initialConstruction) {
      fetch(API + '/api/public/construction', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setConstruction(d))
        .catch(() => {});
    }
    if (!initialPlots) {
      fetch(API + '/api/public/plots', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => Array.isArray(d) && setPlots(d))
        .catch(() => {});
    }
  }, [initialConstruction, initialPlots]);

  const zones = useMemo(() => construction?.zones || [], [construction]);

  useEffect(() => {
    if (!selected && zones.length > 0) setSelected({ kind: 'zone', data: zones[0] });
  }, [zones, selected]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let disposed = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
    camera.position.set(17.5, 16.5, 21.5);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, el);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = scrollZoom;
    controls.minDistance = 8;
    controls.maxDistance = 38;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xdbeafe, 1.0));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x0d2b45, 0.7));
    const sun = new THREE.DirectionalLight(0xfffbeb, 2.1);
    sun.position.set(10, 17, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const world = new THREE.Group();
    scene.add(world);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 0.28, 16.5),
      new THREE.MeshStandardMaterial({ color: 0x091d30, roughness: 0.95 })
    );
    base.position.y = -0.15;
    base.receiveShadow = true;
    world.add(base);

    const grid = new THREE.GridHelper(17, 17, 0x1e3a5f, 0x132c47);
    grid.position.y = 0.005;
    world.add(grid);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    [
      [17.2, 0.28, 0.18, 0, 0.14, -8.1],
      [17.2, 0.28, 0.18, 0, 0.14, 8.1],
      [0.18, 0.28, 16.2, -8.5, 0.14, 0],
      [0.18, 0.28, 16.2, 8.5, 0.14, 0],
    ].forEach(([bw, bh, bd, wx, wy, wz]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), wallMat);
      m.position.set(wx, wy, wz);
      world.add(m);
    });

    const interactive = [];
    const cranes = [];

    Promise.all(ZONE_MODELS_TO_LOAD.map((u) => loadGlbTemplate(u).then((t) => [u, t]))).then((entries) => {
      if (disposed) return;
      const modelMap = Object.fromEntries(entries);
      setModelsLoaded(true);

      zones.forEach((zone) => {
        const zg = createZoneGroup(zone, modelMap);
        zg.userData = { kind: 'zone', data: zone };
        zg.traverse((child) => {
          if (child.userData?.isCrane) cranes.push(child);
          if (child.isMesh) {
            child.userData = { rootGroup: zg };
            interactive.push(child);
          }
        });
        if (statusFilter !== 'All' && zone.status !== statusFilter) {
          zg.traverse((c) => {
            if (c.isMesh && c.material) {
              c.material.transparent = true;
              c.material.opacity = 0.12;
            }
          });
        }
        world.add(zg);
      });

      plots.slice(0, 12).forEach((plot, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const isRight = row >= 2;
        const px = isRight ? 2.5 + col * 1.65 : -5.8 + col * 1.65;
        const pz = isRight ? -4.4 + (row - 2) * 2.1 : 0.4 + row * 2.1;
        const pg = new THREE.Group();
        const padColor = PLOT_COLORS[plot.availability] || PLOT_COLORS.Available;
        const pad = new THREE.Mesh(
          new THREE.BoxGeometry(1.35, 0.24, 1.65),
          new THREE.MeshStandardMaterial({ color: padColor, roughness: 0.55 })
        );
        pad.position.y = 0.2;
        pad.castShadow = true;
        pg.add(pad);
        const border = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(1.37, 0.26, 1.67)),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
        );
        border.position.y = 0.2;
        pg.add(border);
        pg.position.set(px, 0, pz);
        pg.userData = { kind: 'plot', data: plot };
        pad.userData = { rootGroup: pg };
        interactive.push(pad);
        world.add(pg);
      });
    }).catch(() => {});

    let ctx;
    if (!reduce) {
      world.scale.y = 0.05;
      ctx = gsap.context(() => {
        gsap.to(world.scale, {
          y: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: { trigger: wrap.current, start: 'top 75%', once: true },
        });
      }, wrap);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const onPointerDown = (e) => { downPos = { x: e.clientX, y: e.clientY }; };
    const onPointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactive, false);
      el.style.cursor = hits.length ? 'pointer' : 'grab';
    };
    const onPointerUp = (e) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) return;
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactive, false);
      if (hits.length) {
        const rootGroup = hits[0].object.userData.rootGroup;
        if (rootGroup?.userData) setSelected(rootGroup.userData);
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      if (!reduce) {
        cranes.forEach((c, idx) => { c.rotation.y = Math.sin(elapsed * 0.5 + idx) * 0.6; });
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      ctx && ctx.revert();
      controls.dispose();
      renderer.dispose();
    };
  }, [zones, plots, statusFilter, scrollZoom]);

  const setCameraPreset = (mode) => {
    setViewMode(mode);
    if (!cameraRef.current || !controlsRef.current) return;
    if (mode === 'top') {
      gsap.to(cameraRef.current.position, { x: 0, y: 26, z: 0.5, duration: 0.9, ease: 'power2.out' });
      gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 0.9 });
    } else {
      gsap.to(cameraRef.current.position, { x: 17.5, y: 16.5, z: 21.5, duration: 0.9, ease: 'power2.out' });
      gsap.to(controlsRef.current.target, { x: 0, y: 0.2, z: 0, duration: 0.9 });
    }
  };

  const zoomBy = (factor) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = new THREE.Vector3().subVectors(cameraRef.current.position, controlsRef.current.target);
    dir.multiplyScalar(factor);
    const len = dir.length();
    if (len >= 7 && len <= 38) {
      gsap.to(cameraRef.current.position, {
        x: controlsRef.current.target.x + dir.x,
        y: controlsRef.current.target.y + dir.y,
        z: controlsRef.current.target.z + dir.z,
        duration: 0.35,
      });
    }
  };

  const planImage = construction?.architecturalPlanImage || s?.image;

  return (
    <section id="layout-3d" ref={wrap} className="relative z-10 overflow-hidden bg-dusk py-20 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-marigold">{s?.label || 'Interactive 3D Masterplan'}</p>
            <h2 className="display text-4xl md:text-6xl">{s?.headline || 'Inspect the real site layout in 3D.'}</h2>
            <p className="mt-4 max-w-xl text-white/75">{s?.text}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'Completed', 'Under Construction', 'Upcoming'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${statusFilter === st ? 'border-marigold bg-marigold text-dusk' : 'border-white/20 bg-white/5 text-white hover:bg-white/15'}`}
              >
                {st !== 'All' && <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[st].dot}`} />}
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <div className="relative h-[460px] overflow-hidden rounded-3xl border border-white/15 bg-[#071929] shadow-2xl md:h-[580px]">
            {viewMode === 'plan' && planImage ? (
              <img src={mediaUrl(planImage)} alt="Official Architectural Site Plan" className="h-full w-full bg-dusk object-contain p-4" />
            ) : (
              <canvas
                ref={canvasRef}
                data-cursor="Drag 3D"
                className="h-full w-full touch-pan-y"
                role="img"
                aria-label="Interactive 3D real estate project layout with realistic GLB models and construction status"
              />
            )}

            <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-dusk/80 px-3 py-1.5 text-xs text-white/85 backdrop-blur-md">
                {modelsLoaded ? 'Drag to rotate · Click any 3D model or plot to inspect' : 'Loading 3D site models...'}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setCameraPreset('3d')} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md ${viewMode === '3d' ? 'bg-marigold text-dusk' : 'bg-dusk/80 text-white hover:bg-white/20'}`}>
                3D Aerial
              </button>
              <button type="button" onClick={() => setCameraPreset('top')} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md ${viewMode === 'top' ? 'bg-marigold text-dusk' : 'bg-dusk/80 text-white hover:bg-white/20'}`}>
                Top Plan
              </button>
              {planImage && (
                <button type="button" onClick={() => setViewMode(viewMode === 'plan' ? '3d' : 'plan')} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md ${viewMode === 'plan' ? 'bg-marigold text-dusk' : 'bg-dusk/80 text-white hover:bg-white/20'}`}>
                  Site Blueprint
                </button>
              )}
              <button type="button" onClick={() => zoomBy(0.82)} aria-label="Zoom in" className="grid h-8 w-8 place-items-center rounded-full bg-dusk/80 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20">+</button>
              <button type="button" onClick={() => zoomBy(1.22)} aria-label="Zoom out" className="grid h-8 w-8 place-items-center rounded-full bg-dusk/80 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20">−</button>
              <button type="button" onClick={() => setScrollZoom(!scrollZoom)} className={`rounded-full px-3 py-1.5 text-xs backdrop-blur-md ${scrollZoom ? 'bg-field text-white' : 'bg-dusk/80 text-white/75 hover:text-white'}`}>
                {scrollZoom ? 'Wheel Zoom: On' : 'Wheel Zoom: Off'}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl md:p-7">
            {selected?.kind === 'plot' ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-marigold">Selected Plot</span>
                  <span className="rounded-full bg-field px-3 py-1 text-xs font-semibold text-white">
                    {selected.data.availability === 'Booked' ? 'Reserved' : selected.data.availability}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-3xl font-bold">{selected.data.title}</h3>
                {selected.data.plotNumber && <p className="mt-1 text-sm text-marigold">Plot {selected.data.plotNumber} {selected.data.plotCode ? `· ${selected.data.plotCode}` : ''}</p>}
                <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-white/15 py-4 text-sm">
                  <div><dt className="text-white/50">Area</dt><dd className="font-semibold">{selected.data.area || 'On request'}</dd></div>
                  <div><dt className="text-white/50">Price</dt><dd className="font-semibold">{selected.data.price || 'On request'}</dd></div>
                  {selected.data.dimensions && <div><dt className="text-white/50">Dimensions</dt><dd className="font-semibold">{selected.data.dimensions}</dd></div>}
                  {selected.data.facing && <div><dt className="text-white/50">Facing</dt><dd className="font-semibold">{selected.data.facing}</dd></div>}
                </dl>
                {selected.data.description && <p className="mt-4 text-sm text-white/75">{selected.data.description}</p>}
                <a
                  href="/#book-visit"
                  onClick={() => window.dispatchEvent(new CustomEvent('vistara:select-plot', { detail: { plotId: selected.data._id } }))}
                  className="btn btn-primary mt-6 w-full"
                >
                  Enquire / Book This Plot
                </a>
              </div>
            ) : selected?.kind === 'zone' ? (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">{selected.data.category}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${(STATUS_STYLE[selected.data.status] || STATUS_STYLE.Upcoming).badge}`}>
                    {selected.data.status}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">{selected.data.name}</h3>
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/70">Actual Completion</span>
                    <span className="text-marigold">{selected.data.progress}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-marigold transition-all duration-500" style={{ width: `${selected.data.progress}%` }} />
                  </div>
                </div>
                {selected.data.targetDate && <p className="mt-3 text-xs font-medium text-white/60">Timeline: {selected.data.targetDate}</p>}
                {selected.data.description && <p className="mt-4 text-sm leading-relaxed text-white/80">{selected.data.description}</p>}
                {selected.data.photos?.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {selected.data.photos.slice(0, 2).map((u, idx) => (
                      <img key={u + idx} src={mediaUrl(u)} alt={selected.data.name} className="h-24 w-full rounded-xl object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/70">Select any 3D structure or plot to inspect live construction details.</p>
            )}

            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-white/50">Jump to Zone</p>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {zones.map((z) => {
                  const active = selected?.kind === 'zone' && selected.data.code === z.code;
                  return (
                    <button
                      key={z._id || z.code}
                      type="button"
                      onClick={() => setSelected({ kind: 'zone', data: z })}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${active ? 'bg-white font-semibold text-dusk' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${(STATUS_STYLE[z.status] || STATUS_STYLE.Upcoming).dot}`} />
                      {z.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

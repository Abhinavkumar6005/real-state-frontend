'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MODEL_PATHS, instantiateModel, loadGlbTemplate } from '@/lib/models3d';

gsap.registerPlugin(ScrollTrigger);

// Pinned scroll-driven 3D masterplan: full connected, painted 7x5 township rising seamlessly on scroll.
export default function Layout3DScroll({ s }) {
  const wrap = useRef(null);
  const section = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

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
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 140);
    scene.add(new THREE.AmbientLight(0xe0f2fe, 1.05));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x0d2b45, 0.75));
    const sun = new THREE.DirectionalLight(0xfffbeb, 2.0);
    sun.position.set(10, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const group = new THREE.Group();
    scene.add(group);

    // Base plinth slightly larger than the 14x10 tile grid
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(14.6, 0.36, 10.6),
      new THREE.MeshStandardMaterial({ color: 0x0f2d47, roughness: 0.9 })
    );
    ground.position.y = -0.19;
    ground.receiveShadow = true;
    group.add(ground);

    const animatedItems = [];
    const state = { t: reduce ? 1 : 0 };

    const draw = () => {
      if (disposed) return;
      const t = state.t;
      animatedItems.forEach(({ obj, delay }) => {
        const k = gsap.utils.clamp(0, 1, (t * 1.45 - delay * 0.55) / 0.45);
        const eased = 1 - Math.pow(1 - k, 3);
        obj.scale.setScalar(Math.max(0.001, eased));
      });
      group.rotation.y = -0.5 + t * 1.05;
      camera.position.set(0, 13.5 - t * 2.5, 19.5 - t * 2.5);
      camera.lookAt(-1.4, 0.4, 0);
      renderer.render(scene, camera);
    };

    // Complete 7x5 edge-to-edge connected grid (each 1x1 Kenney tile scaled to 2.005 at spacing 2.0)
    const layoutPlan = [
      // Row z = -4 (North avenue)
      { url: MODEL_PATHS.roadCorner, x: -6, z: -4, rot: Math.PI / 2, delay: 0.05 },
      { url: MODEL_PATHS.roadStraight, x: -4, z: -4, rot: Math.PI / 2, delay: 0.08 },
      { url: MODEL_PATHS.roadLightposts, x: -2, z: -4, rot: Math.PI / 2, delay: 0.1 },
      { url: MODEL_PATHS.roadSplit, x: 0, z: -4, rot: 0, delay: 0.12 },
      { url: MODEL_PATHS.roadLightposts, x: 2, z: -4, rot: Math.PI / 2, delay: 0.14 },
      { url: MODEL_PATHS.roadStraight, x: 4, z: -4, rot: Math.PI / 2, delay: 0.16 },
      { url: MODEL_PATHS.roadCorner, x: 6, z: -4, rot: 0, delay: 0.18 },

      // Row z = -2 (North residences, park & roads)
      { url: MODEL_PATHS.roadLightposts, x: -6, z: -2, rot: 0, delay: 0.12 },
      { url: MODEL_PATHS.buildingC, x: -4, z: -2, rot: 0, delay: 0.55 },
      { url: MODEL_PATHS.treesTall, x: -2, z: -2, rot: 0, delay: 0.35 },
      { url: MODEL_PATHS.roadLightposts, x: 0, z: -2, rot: 0, delay: 0.15 },
      { url: MODEL_PATHS.fountain, x: 2, z: -2, rot: 0, delay: 0.38 },
      { url: MODEL_PATHS.buildingB, x: 4, z: -2, rot: 0, delay: 0.6 },
      { url: MODEL_PATHS.roadLightposts, x: 6, z: -2, rot: 0, delay: 0.18 },

      // Row z = 0 (Central East-West Boulevard)
      { url: MODEL_PATHS.roadSplit, x: -6, z: 0, rot: Math.PI / 2, delay: 0.16 },
      { url: MODEL_PATHS.roadLightposts, x: -4, z: 0, rot: Math.PI / 2, delay: 0.18 },
      { url: MODEL_PATHS.roadStraight, x: -2, z: 0, rot: Math.PI / 2, delay: 0.2 },
      { url: MODEL_PATHS.roadIntersection, x: 0, z: 0, rot: 0, delay: 0.22 },
      { url: MODEL_PATHS.roadStraight, x: 2, z: 0, rot: Math.PI / 2, delay: 0.24 },
      { url: MODEL_PATHS.roadLightposts, x: 4, z: 0, rot: Math.PI / 2, delay: 0.26 },
      { url: MODEL_PATHS.roadSplit, x: 6, z: 0, rot: -Math.PI / 2, delay: 0.28 },

      // Row z = 2 (South residences, park & roads)
      { url: MODEL_PATHS.roadLightposts, x: -6, z: 2, rot: 0, delay: 0.22 },
      { url: MODEL_PATHS.buildingA, x: -4, z: 2, rot: Math.PI, delay: 0.65 },
      { url: MODEL_PATHS.buildingD, x: -2, z: 2, rot: Math.PI, delay: 0.7 },
      { url: MODEL_PATHS.roadLightposts, x: 0, z: 2, rot: 0, delay: 0.25 },
      { url: MODEL_PATHS.trees, x: 2, z: 2, rot: 0, delay: 0.42 },
      { url: MODEL_PATHS.gatehouse, x: 4, z: 2, rot: Math.PI, delay: 0.5 },
      { url: MODEL_PATHS.roadLightposts, x: 6, z: 2, rot: 0, delay: 0.28 },

      // Row z = 4 (South avenue)
      { url: MODEL_PATHS.roadCorner, x: -6, z: 4, rot: Math.PI, delay: 0.26 },
      { url: MODEL_PATHS.roadStraight, x: -4, z: 4, rot: Math.PI / 2, delay: 0.28 },
      { url: MODEL_PATHS.roadLightposts, x: -2, z: 4, rot: Math.PI / 2, delay: 0.3 },
      { url: MODEL_PATHS.roadSplit, x: 0, z: 4, rot: Math.PI, delay: 0.32 },
      { url: MODEL_PATHS.roadLightposts, x: 2, z: 4, rot: Math.PI / 2, delay: 0.34 },
      { url: MODEL_PATHS.roadStraight, x: 4, z: 4, rot: Math.PI / 2, delay: 0.36 },
      { url: MODEL_PATHS.roadCorner, x: 6, z: 4, rot: -Math.PI / 2, delay: 0.38 },
    ];

    const uniqueUrls = [...new Set(layoutPlan.map((i) => i.url))];
    Promise.all(uniqueUrls.map((u) => loadGlbTemplate(u).then((t) => [u, t]))).then((entries) => {
      if (disposed) return;
      const map = Object.fromEntries(entries);
      layoutPlan.forEach((item) => {
        const holder = new THREE.Group();
        const model = instantiateModel(map[item.url], {
          scale: 2.005,
          status: 'Completed',
          rotationY: item.rot || 0,
        });
        holder.add(model);
        holder.position.set(item.x, 0, item.z);
        holder.scale.setScalar(reduce ? 1 : 0.001);
        group.add(holder);
        animatedItems.push({ obj: holder, delay: item.delay });
      });
      draw();
    }).catch(() => {});

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      draw();
    };
    resize();
    window.addEventListener('resize', resize);

    let ctx;
    if (!reduce) {
      ctx = gsap.context(() => {
        gsap.to(state, {
          t: 1,
          ease: 'none',
          onUpdate: () => {
            draw();
            setProgress(Math.round(state.t * 100));
          },
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: '+=135%',
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            refreshPriority: 10,
          },
        });
      }, wrap);
      ScrollTrigger.refresh();
    }

    return () => {
      disposed = true;
      window.removeEventListener('resize', resize);
      ctx && ctx.revert();
      renderer.dispose();
    };
  }, []);

  const stageLabel =
    progress < 30 ? 'Phase 01 · Roads & Streetlights'
      : progress < 65 ? 'Phase 02 · Parks & Infrastructure'
        : 'Phase 03 · Plots & Planned Structures';

  return (
    <div ref={wrap}>
      <section ref={section} className="relative h-[100svh] overflow-hidden bg-[#071929] text-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Scroll-triggered 3D architectural site walkthrough showing complete connected roads, parks, and residences"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#071929]/85 via-transparent to-transparent" aria-hidden="true" />

        <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl flex-col justify-between px-5 py-24 md:px-10">
          <div className="max-w-md">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-marigold">
              Scroll 3D Walkthrough
            </p>
            <h2 className="display text-4xl md:text-5xl">
              {s?.scrollHeadline || 'Watch the entire masterplan rise as you scroll.'}
            </h2>
            <p className="mt-4 text-sm text-white/80 md:text-base">
              {s?.scrollText || 'Scroll smoothly to watch paved roads, solar street lighting, landscaped greens, and plot divisions come together.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
            <span className="rounded-full border border-white/20 bg-dusk/70 px-4 py-2 text-xs font-semibold text-marigold backdrop-blur-md">
              {stageLabel}
            </span>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-marigold transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-semibold text-white/75">{progress}%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

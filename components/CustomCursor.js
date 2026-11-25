'use client';
import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState('default'); // default | pointer | canvas | hidden
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let visible = false;
    let rafId = 0;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        ring.x = pos.x;
        ring.y = pos.y;
        visible = true;
      }

      const target = e.target?.closest?.('a, button, [role="button"], input, select, textarea, [data-cursor]');
      if (!target) {
        setMode('default');
        setLabel('');
      } else if (target.matches('input, select, textarea')) {
        setMode('hidden');
        setLabel('');
      } else if (target.tagName === 'CANVAS') {
        const cursorText = target.getAttribute('data-cursor') || '';
        if (cursorText) {
          setMode('canvas');
          setLabel(cursorText);
        } else {
          setMode('default');
          setLabel('');
        }
      } else {
        setMode('pointer');
        setLabel(target.getAttribute('data-cursor') || '');
      }
    };

    const onLeave = () => {
      visible = false;
      setMode('hidden');
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  if (!enabled) return null;

  const isHidden = mode === 'hidden';
  const isPointer = mode === 'pointer';
  const isCanvas = mode === 'canvas';

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,opacity] duration-200 will-change-transform ${
          isHidden
            ? 'h-4 w-4 opacity-0'
            : isCanvas
              ? 'h-16 w-16 border-marigold bg-dusk/75 text-marigold opacity-100 backdrop-blur-md'
              : isPointer
                ? label
                  ? 'h-14 w-14 border-marigold bg-marigold/90 text-dusk opacity-100 shadow-lg'
                  : 'h-11 w-11 border-marigold bg-marigold/15 opacity-100 backdrop-blur-[1px]'
                : 'h-8 w-8 border-dusk/35 bg-white/15 opacity-90 ring-1 ring-white/40 backdrop-blur-[1px]'
        }`}
      >
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        )}
      </div>
      <div
        ref={dotRef}
        className={`fixed left-0 top-0 rounded-full transition-[width,height,opacity,background-color] duration-150 will-change-transform ${
          isHidden || label
            ? 'h-1 w-1 opacity-0'
            : isPointer
              ? 'h-2 w-2 bg-marigold opacity-100'
              : 'h-2 w-2 bg-dusk ring-2 ring-white/85 opacity-100'
        }`}
      />
    </div>
  );
}

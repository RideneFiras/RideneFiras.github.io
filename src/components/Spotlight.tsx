import { useEffect, useRef } from 'react';

export function Spotlight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty('--spot-x', `${e.clientX}px`);
      el.style.setProperty('--spot-y', `${e.clientY}px`);
      el.style.setProperty('--spotlight-opacity', '1');
    };
    const onLeave = () => el.style.setProperty('--spotlight-opacity', '0');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={ref} className="spotlight" aria-hidden="true" />;
}

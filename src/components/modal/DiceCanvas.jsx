import { useEffect, useRef } from 'react';

export default function DiceCanvas({ rolling, success, disableEffects }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = disableEffects || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, frame;
    const started = performance.now();
    const draw = (now) => {
      context.clearRect(0, 0, width, height);
      const elapsed = reduced ? 0 : (now - started) / 1000;
      const color = success === false ? '238,98,116' : '97,209,209';
      const radius = Math.min(width, height) * .32;
      context.strokeStyle = `rgba(${color},${rolling ? .45 : .16})`;
      context.lineWidth = 1;
      for (let ring = 0; ring < 3; ring++) {
        context.beginPath();
        context.ellipse(width / 2, height / 2, radius + ring * 16, (radius + ring * 16) * .62, elapsed * (ring % 2 ? -.7 : .7), 0, Math.PI * 2);
        context.stroke();
      }
      for (let i = 0; i < 32; i++) {
        const angle = i * 2.39996 + elapsed * (rolling ? 1.4 : .1);
        const distance = radius * (.8 + (i % 7) / 8);
        const x = width / 2 + Math.cos(angle) * distance;
        const y = height / 2 + Math.sin(angle) * distance * .75;
        context.fillStyle = `rgba(${color},${rolling ? .3 + (i % 4) / 6 : .18})`;
        context.fillRect(x, y, rolling ? 3 : 2, rolling ? 3 : 2);
      }
      if (rolling && !reduced) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      cancelAnimationFrame(frame);
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [rolling, success, disableEffects]);
  return <canvas ref={ref} className="dice-canvas" aria-hidden="true" />;
}

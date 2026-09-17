import { useCallback, useEffect, useState } from 'react';

export function useTypewriter(text = '') {
  const [progress, setProgress] = useState({ text, count: 0 });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = reduced ? text.length : progress.text === text ? progress.count : 0;
  useEffect(() => {
    if (reduced) return;
    const started = performance.now();
    let frame;
    const tick = (now) => {
      const next = Math.min(text.length, Math.floor((now - started) / 22));
      setProgress((previous) => ({ text, count: previous.text === text ? Math.max(previous.count, next) : next }));
      if (next < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, reduced]);
  const finish = useCallback(() => setProgress({ text, count: text.length }), [text]);
  return { count, done: count >= text.length, finish };
}

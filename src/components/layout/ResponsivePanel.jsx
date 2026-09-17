import { useEffect, useState } from 'react';

export default function ResponsivePanel({ title, children }) {
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width: 1201px) and (min-height: 701px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1201px) and (min-height: 701px)');
    const update = () => setExpanded(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return (
    <details className="auxiliary-panel" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary>{title}<span>{expanded ? '−' : '+'}</span></summary>
      <div className="auxiliary-content">{children}</div>
    </details>
  );
}

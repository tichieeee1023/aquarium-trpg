import { useEffect, useId, useRef } from 'react';
import ModalLayer from './ModalLayer.jsx';

export default function DialogFrame({ title, onClose, children, className = '' }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.querySelector('button')?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onClose(); }
      if (event.key !== 'Tab') return;
      const controls = [...ref.current.querySelectorAll('button:not(:disabled), input, a[href]')];
      const first = controls[0], last = controls.at(-1);
      if (!ref.current.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', keydown, true);
    return () => { window.removeEventListener('keydown', keydown, true); if (previous?.isConnected) previous.focus(); };
  }, [onClose]);
  return <ModalLayer><div className="utility-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className={`utility-dialog ${className}`}><div className="utility-heading"><h2 id={id}>{title}</h2><button onClick={onClose} aria-label="닫기">×</button></div>{children}</section></div></ModalLayer>;
}

import { useCallback, useEffect } from 'react';
import ModalLayer from '../modal/ModalLayer.jsx';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from './TypedText.jsx';

export default function StoryDisplay({ activeModalText, onAdvance }) {
  const text = activeModalText?.body ?? '';
  const { count, done, finish } = useTypewriter(text);
  const advance = useCallback(() => { if (!done) finish(); else onAdvance(); }, [done, finish, onAdvance]);
  useEffect(() => {
    if (!activeModalText) return;
    const handleKey = (event) => { if (event.key === 'Escape') advance(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeModalText, advance]);
  return (
activeModalText && (
    <ModalLayer>
      <div data-testid="story-backdrop" onClick={(event) => { if (event.target === event.currentTarget) advance(); }} className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div role="dialog" aria-modal="true" aria-labelledby="story-title" className="w-full max-w-xl max-h-full overflow-y-auto bg-[#121622] border-2 border-[#243048] rounded-2xl p-6 shadow-2xl space-y-4">
          {activeModalText.image && <img src={activeModalText.image.src} alt={activeModalText.image.alt} className="w-full aspect-video object-cover rounded-xl" />}
          <div className="flex justify-between items-start border-b border-neutral-800 pb-2">
            <h3 id="story-title" className="text-sm font-bold text-neutral-100">{activeModalText.title}</h3>
            {activeModalText.tag && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {activeModalText.tag}
              </span>
            )}
          </div>
          {activeModalText.illustration && (
            <figure className="rounded-xl bg-neutral-950 p-2">
              <img src={activeModalText.illustration.img} alt={activeModalText.illustration.name} className="w-full h-32 object-contain" />
              <figcaption className="text-xs text-neutral-400 text-center mt-2">{activeModalText.illustration.name}</figcaption>
            </figure>
          )}
          {activeModalText.rewardItems?.length > 0 && (
            <div className={`grid ${activeModalText.rewardItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`} aria-label="획득한 도구">
              {activeModalText.rewardItems.map((item) => (
                <figure key={item.id} className="rounded-xl bg-neutral-950 border border-amber-500/40 p-2">
                  <img src={item.img} alt={item.name} className="w-full h-40 object-contain rounded-lg" />
                  <figcaption className="text-xs text-amber-300 text-center mt-2">획득 · {item.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
          <p className="text-sm text-neutral-300 leading-relaxed font-serif whitespace-pre-line">
            <TypedText text={text} count={count} />
          </p>
          <button
            onClick={advance}
            data-typing={done ? 'complete' : 'typing'}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs transition cursor-pointer"
          >
            &gt;다음
          </button>
        </div>
      </div>
    </ModalLayer>
    )
  );
}

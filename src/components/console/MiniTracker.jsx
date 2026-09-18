import { SCENARIOS } from '../../aquariumEngine.js';
import { ChevronDown } from 'lucide-react';

export default function MiniTracker({ stage }) {
  return (
<details className="group bg-[#131722] p-3 rounded-xl border border-[#1f283d]">
            <summary className="text-[11px] font-bold text-neutral-400 uppercase flex items-center justify-between cursor-pointer">
              <span>ZONE TIMELINE</span>
              <ChevronDown size={13} className="text-cyan-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-1.5 text-xs mt-3">
              {Object.entries(SCENARIOS).map(([id, scene]) => ({ id, name: scene.title })).map((node) => {
                const isCurrent = stage === node.id;
                return (
                  <div
                    key={node.id}
                    className={`px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                      isCurrent 
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50' 
                        : 'text-neutral-500 bg-neutral-950/40'
                    }`}
                  >
                    <span>{['SURVEY', 'DICE_CONDITION'].includes(stage) || (stage !== 'ENDING' && node.id > stage) ? '미탐색 구역' : node.name}</span>
                    {isCurrent && <span className="text-[10px] text-cyan-400 font-mono">현재</span>}
                  </div>
                );
              })}
            </div>
          </details>
  );
}

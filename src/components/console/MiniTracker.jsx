import { ChevronDown } from 'lucide-react';

export default function MiniTracker({ stage }) {
  return (
<details className="group bg-[#131722] p-3 rounded-xl border border-[#1f283d]">
            <summary className="text-[11px] font-bold text-neutral-400 uppercase flex items-center justify-between cursor-pointer">
              <span>ZONE TIMELINE</span>
              <ChevronDown size={13} className="text-cyan-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-1.5 text-xs mt-3">
              {[
                { id: 'STAGE_1_CAR6', name: 'Stage 1 : 6호차 객차' },
                { id: 'STAGE_2_TUNNEL', name: 'Stage 2 : 선로 터널 300m' },
                { id: 'STAGE_3_PLATFORM', name: 'Stage 3 : 의태 승강장' },
                { id: 'STAGE_4_MALL', name: 'Stage 4 : 환승 상가' },
                { id: 'STAGE_5_VENT', name: 'Stage 5 : 환기탑 탈출' },
              ].map((node) => {
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

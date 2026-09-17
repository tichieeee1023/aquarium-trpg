export default function StatGrid({ player }) {
  return (
<div className="bg-[#121622] p-3 rounded-xl border border-[#1e2638] space-y-1.5 text-xs">
            <div className="text-[11px] font-bold text-neutral-400 uppercase mb-2 flex items-center justify-between">
              <span>D20 PARAMETERS</span>
              <span className="text-[9px] text-neutral-500 font-mono">MODIFIER</span>
            </div>
            {Object.entries(player.stats).map(([stat, val]) => {
              const mod = Math.floor((val - 10) / 2);
              return (
                <div key={stat} className="flex justify-between items-center py-0.5 border-b border-neutral-800/50">
                  <span className="text-neutral-400">{stat}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-neutral-200">{val}</span>
                    <span className={`text-[10px] font-bold px-1 rounded ${mod >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
  );
}

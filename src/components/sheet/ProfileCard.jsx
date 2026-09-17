import { CHARACTER_PORTRAITS } from '../../data/assetDB.js';

export default function ProfileCard({ player }) {
  return (
<div className="p-3 bg-[#131722] border border-[#252f44] rounded-xl shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <img src={CHARACTER_PORTRAITS[player.profileId][player.gender ?? 'M']} alt={`${player.title} 사원증 사진`} className="w-20 h-20 aspect-square object-cover border border-neutral-700 rounded shrink-0" />
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">PANGYO IT PASS</div>
                <div className="text-sm font-black text-neutral-100">{player.name}</div>
                <div className="text-[11px] text-amber-400">{player.title}</div>
              </div>
            </div>
            <div className="text-[10px] text-neutral-400 bg-neutral-950/60 p-1.5 rounded border border-neutral-800/80">
              특성: <span className="text-emerald-300 font-bold">{player.trait}</span>
            </div>
          </div>
  );
}

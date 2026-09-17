export default function InventorySlot({ player }) {
  return (
<div className="bg-[#121622] p-3 rounded-xl border border-[#1e2638]">
            <div className="text-[11px] font-bold text-cyan-400 uppercase mb-2 flex items-center justify-between">
              <span>INVENTORY BAG</span>
              <span className="text-[10px] text-neutral-500">{player.inventory.length} SLOTS</span>
            </div>
            <div className="inventory-grid grid gap-2">
              {player.inventory.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between min-h-20 gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    {item.img ? <img src={item.img} alt="" className="w-12 h-8 object-contain rounded" /> : <span>{item.icon}</span>}
                    <span className="font-bold text-neutral-200">{item.name}</span>
                  </div>
                  <div className="text-[9px] text-neutral-500">{item.desc}</div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - player.inventory.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 rounded-lg border border-dashed border-neutral-900 flex items-center justify-center text-neutral-700 text-xs">
                  EMPTY
                </div>
              ))}
            </div>
          </div>
  );
}

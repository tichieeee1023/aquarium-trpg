export default function ConsoleLog({ logs }) {
  return (
<div className="bg-[#121622] p-3 rounded-xl border border-[#1f283d] flex-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase mb-2 flex items-center justify-between">
              <span>SYSTEM INCIDENT LOG</span>
              <span className="text-[9px] text-emerald-400 animate-pulse">● LIVE</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-64 pr-1 text-[11px] font-mono leading-relaxed">
              {logs.map((log, index) => (
                <div key={index} className="text-neutral-400 border-b border-neutral-900/60 pb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
  );
}

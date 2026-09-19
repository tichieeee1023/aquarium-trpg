function renderLog(log) {
  return log.split(/((?:HP|SAN|STR|DEX|INT|WILL|LUK)\s*[+-]\s*\d+|DC\s*\d+\s*→\s*\d+)/gi).map((part, index) => {
    if (/^(?:HP|SAN|STR|DEX|INT|WILL|LUK)\s*-\s*\d+$/i.test(part)) {
      return <span className="typed-damage" key={index}>{part}</span>;
    }
    if (/^(?:HP|SAN|STR|DEX|INT|WILL|LUK)\s*\+\s*\d+$/i.test(part)) {
      return <span className="typed-benefit" key={index}>{part}</span>;
    }
    if (/^DC\s*\d+\s*→\s*\d+$/i.test(part)) {
      const [, before, after] = part.match(/DC\s*(\d+)\s*→\s*(\d+)/i) ?? [];
      return <span className={Number(after) < Number(before) ? 'typed-benefit' : 'typed-damage'} key={index}>{part}</span>;
    }
    return part;
  });
}

export default function ConsoleLog({ logs }) {
  return (
<div className="bg-[#121622] p-3 rounded-xl border border-[#1f283d] flex-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase mb-2 flex items-center justify-between">
              <span>SYSTEM INCIDENT LOG</span>
              <span className="text-[9px] text-emerald-400">● LIVE</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-64 pr-1 text-[11px] font-mono leading-relaxed">
              {logs.map((log, index) => (
                <div key={index} className="text-neutral-400 border-b border-neutral-900/60 pb-1">
                  {renderLog(log)}
                </div>
              ))}
            </div>
          </div>
  );
}

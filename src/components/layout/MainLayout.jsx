export default function MainLayout({ isGlitching, children }) {
  return (
<div className="game-shell min-h-screen p-4 flex items-center justify-center">
  {/* 16:9 main chassis frame (W: 1380px, H: 780px) */}
  <div className={`game-chassis relative w-full bg-[#0c0e14] border-2 border-[#202738] overflow-hidden flex flex-col transition-all duration-300 ${
    isGlitching ? 'filter invert hue-rotate-180 animate-pulse' : ''
  }`}>
{children}
</div>
</div>
  );
}

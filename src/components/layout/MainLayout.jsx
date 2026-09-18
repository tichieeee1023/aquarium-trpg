export default function MainLayout({ children }) {
  return (
<div className="game-shell min-h-screen p-4 flex items-center justify-center">
  {/* 16:9 main chassis frame (W: 1380px, H: 780px) */}
  <div className="game-chassis relative w-full bg-[#0c0e14] border-2 border-[#202738] overflow-hidden flex flex-col">
{children}
</div>
</div>
  );
}

import MiniTracker from './MiniTracker.jsx';
import ConsoleLog from './ConsoleLog.jsx';
import ResponsivePanel from '../layout/ResponsivePanel.jsx';

export default function GameConsole({ stage, logs }) {
  return (
<aside className="game-console bg-[#0e1118] border-l border-[#1c2333] p-4 flex flex-col justify-between overflow-y-auto">
      <ResponsivePanel title="진행 기록 · 시스템 로그">
        <div className="space-y-4">
          
          {/* 노드 타임라인 진행도 */}
          <MiniTracker stage={stage} />

          {/* 시스템 사건 로그 히스토리 */}
          <ConsoleLog logs={logs} />

        </div>

        <div className="text-[10px] text-neutral-600 font-mono text-center pt-2">
          SESSION LOG RECORDING
        </div>
      </ResponsivePanel>
      </aside>
  );
}

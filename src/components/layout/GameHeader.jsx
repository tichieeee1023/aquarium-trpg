import StatGauge from '../sheet/StatGauge.jsx';
import { Heart, Brain, Droplets, Volume2, VolumeX, MapPin, Settings, CircleHelp, Lightbulb } from 'lucide-react';

export default function GameHeader({ stage, player, ap, soundEnabled, toggleSound, onSettings, onHelp, onHint, location, waterLevel }) {
  return (
<header className="flex items-center justify-between px-6 py-2.5 bg-[#080a0f] border-b border-[#1c2333] text-xs">
      <div className="header-location-group flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span className="font-black tracking-widest text-rose-400"><span className="header-code-prefix">CODE RED : </span>23:45:00</span>
        </div>
        <span className="text-neutral-500">|</span>
        <div className="flex items-center gap-1 text-neutral-400">
          <MapPin size={13} className="text-cyan-400" />
          <span>{
            stage === 'SURVEY' || stage === 'DICE_CONDITION' ? '아쿠아리움 야간 당직' : location || '생환 기록'
          }</span>
        </div>
      </div>

      <div className="header-status flex items-center gap-5">
        <span className="header-ap text-amber-300">{stage === 'STAGE_5_DOME' ? 'FINAL' : `AP ${stage.startsWith('STAGE_') ? ap : 0}/3`}</span>
        <StatGauge icon={<Heart size={13} className="text-rose-500" />} label="HP" value={player.hp} max={player.maxHp} color="rose" />
        <StatGauge icon={<Brain size={13} className="text-cyan-400" />} label="SAN" value={player.san} max={player.maxSan} color="cyan" />

        {/* 배터리 잔량 */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <Droplets size={14} className="text-cyan-400" /><span>수위 {waterLevel}%</span>
        </div>

      </div>
      <div className="header-controls flex items-center gap-2">
        {/* 사운드 토글 */}
        <button
          onClick={toggleSound}
          className="p-1 rounded bg-[#161c28] text-neutral-400 hover:text-white"
          aria-label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
          title="사운드 토글"
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-rose-400" />}
        </button>
        <button className="header-utility" onClick={onSettings} aria-label="설정" title="설정"><Settings size={18} /></button>
        <button className="header-utility" onClick={onHelp} aria-label="도움말" title="도움말"><CircleHelp size={18} /></button>
        <button className="header-utility header-hint" onClick={onHint} aria-label="현재 구역 힌트" title="현재 구역 힌트"><Lightbulb size={18} /></button>

      </div>
    </header>
  );
}

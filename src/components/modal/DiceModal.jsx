import { ITEM_DATABASE } from '../../data/itemDB.js';
import { useEffect } from 'react';
import ModalLayer from './ModalLayer.jsx';
import DiceCanvas from './DiceCanvas.jsx';

export default function DiceModal({ diceModal, player, rollD20Check, confirmDiceResult, dismissDice, disableEffects }) {
  const isCondition = diceModal.kind === 'CONDITION';
  useEffect(() => {
    if (!diceModal.isOpen) return;
    const handleKey = (event) => { if (event.key === 'Escape') dismissDice(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [diceModal.isOpen, dismissDice]);
  const diceItem = diceModal.rolling
    ? ITEM_DATABASE.DICE_ROLL
    : diceModal.result?.isNat20
      ? ITEM_DATABASE.DICE_CRIT_WIN
      : diceModal.result?.isNat1
        ? ITEM_DATABASE.DICE_CRIT_LOSE
        : diceModal.result?.isSuccess
          ? ITEM_DATABASE.DICE_SUCCESS
          : diceModal.result
            ? ITEM_DATABASE.DICE_FAIL
            : ITEM_DATABASE.DICE_IDLE;
  return (
diceModal.isOpen && (
    <ModalLayer>
      <div data-testid="dice-backdrop" onClick={(event) => { if (event.target === event.currentTarget) dismissDice(); }} className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div role="dialog" aria-modal="true" aria-labelledby="dice-title" className="dice-dialog w-full overflow-y-auto bg-[#121724] border-2 border-[#2b3954] text-center">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
            🎲 TRPG D20 DICE CHECK
          </div>
          <h3 id="dice-title" className="text-base font-bold text-neutral-100">{diceModal.title}</h3>

          <div className="dice-stat-row bg-neutral-950 p-2.5 border border-neutral-800 text-xs flex justify-around">
            {isCondition ? <span className="text-neutral-400">D20 · 오늘의 컨디션 결정</span> : <>
            <div>
              <span className="text-neutral-500">판정 스탯: </span>
              <span className="font-bold text-amber-400">{diceModal.statKey} ({player.stats[diceModal.statKey]})</span>
            </div>
            <div>
              <span className="text-neutral-500">목표 난이도: </span>
              <span className="font-bold text-rose-400">DC {diceModal.dc}</span>
            </div>
          </>}
          </div>

          <div className={`dice-stage ${diceModal.rolling ? 'dice-stage-rolling' : ''}`} aria-live="polite">
            <DiceCanvas rolling={diceModal.rolling} success={diceModal.result?.isSuccess} disableEffects={disableEffects} />
            <div className="dice-perspective">
              <img src={diceItem.img} alt={diceItem.name} className={`dice-image ${diceModal.rolling ? 'dice-image-rolling' : ''}`} />
            </div>
            <div className="text-3xl text-cyan-300 mt-3">{diceModal.rolling ? '···' : diceModal.result?.rawDice ?? 'D20'}</div>
            <div className="text-xs text-neutral-400 mt-2">{diceModal.rolling ? '어둠 속에서 주사위가 구른다…' : diceItem.name}</div>
          </div>

          {/* 주사위 판정 결과 */}
            <div className="dice-result space-y-2" aria-live="polite">
            {diceModal.result ? <>
              {!isCondition && <div className="text-xs font-mono text-neutral-300">
                눈금 [{diceModal.result.rawDice}] + 보정치 [{diceModal.result.modifier}] 
                {diceModal.result.traitBonus !== 0 && ` + 특성 [${diceModal.result.traitBonus}]`} = 
                <span className="font-black text-amber-300 text-sm ml-1"> {diceModal.result.total}</span>
                <span className="text-neutral-500 ml-1">vs DC {diceModal.dc}</span>
              </div>}

              <div className={`text-base font-black tracking-wider ${
                diceModal.result.isSuccess ? 'text-emerald-400' : 'text-rose-500'
              }`}>
                {diceModal.result.isNat20 ? '🔥 NATURAL 20! 대성공!' :
                 diceModal.result.isNat1 ? '💀 NATURAL 1... 대실패...' :
                 isCondition ? '오늘의 컨디션이 결정되었습니다.' : diceModal.result.isSuccess ? '🎉 판정 성공 (SUCCESS)' : '❌ 판정 실패 (FAILURE)'}
              </div>
            </> : <span className="text-neutral-400">{diceModal.rolling ? '판정 중… 숨을 고르세요.' : '주사위를 굴려 운명을 확인하세요.'}</span>}
            </div>

          {/* 버튼 컨트롤 */}
          <div className="pt-2">
            {!diceModal.result ? (
              <button
                disabled={diceModal.rolling}
                onClick={rollD20Check}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-black text-sm shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {diceModal.rolling ? '주사위 회전 중...' : '운명의 D20 주사위 굴리기'}
              </button>
            ) : (
              <button
                onClick={confirmDiceResult}
                className="w-full py-3 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs transition cursor-pointer"
              >
                &gt;다음
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalLayer>
    )
  );
}

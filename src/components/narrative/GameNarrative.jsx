import { Sparkles, CheckCircle2 } from 'lucide-react';
import SurveyView from './SurveyView.jsx';
import ActionPanel from './ActionPanel.jsx';
import { SCENARIO_POINTS } from '../../data/scenarioDB.js';
import SceneOverview from './SceneOverview.jsx';

export default function GameNarrative({ stage, player, ap, turnLimit, flags, examinedPoints, handleRollCondition, handleSelectArchetype, examineCar6Point, examineTunnelPoint, examinePlatformPoint, choosePlatformExit, examineMallPoint, handleStage5Action, handlePushManhole }) {
  const hasFanStopTool = flags.has_wrench || flags.has_master_card || player.inventory.some((item) => item.id === 'multitool');
  return (
<main className="game-narrative bg-[#0a0c12] p-6 flex flex-col justify-between overflow-y-auto">
        <SceneOverview stage={stage} />

        {/* STAGE 0 : 캐릭터 생성 설문 */}
        <SurveyView stage={stage} handleSelectArchetype={handleSelectArchetype} />

        {/* STAGE 0 : D20 오늘의 컨디션 굴림 */}
        {stage === 'DICE_CONDITION' && (
          <div className="condition-panel my-auto text-center space-y-6 mx-auto">
            <div className="border border-cyan-500/40 bg-cyan-950/20 p-4 rounded-2xl">
              <div className="text-xs text-cyan-400 font-bold uppercase mb-1">D20 CONDITION ROLL</div>
              <h3 className="text-base font-bold text-neutral-200">오늘 하루의 잔업 강도와 피로도를 결정합니다</h3>
              <p className="text-xs text-neutral-400 mt-2">
                주사위 결과에 따라 추가 HP/SAN 보정치와 숨겨진 기벽(Trait)이 부여됩니다.
              </p>
            </div>

            <div className="py-4">
              <button
                onClick={handleRollCondition}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-base shadow-xl shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Sparkles size={18} />
                <span>D20 주사위 굴려 피로도 확정</span>
              </button>
            </div>

            <div className="text-[11px] text-neutral-500 font-mono">
              * 1이 나오면 3일 연속 철야 상태로 시작하며, 20이 나오면 사직서를 품어 공포 면역을 얻습니다.
            </div>
          </div>
        )}

        {/* STAGE 1 : 6호차 객차 탐사 허브 */}
        {stage === 'STAGE_1_CAR6' && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800">
                  [ SCENE : 6호선 암전된 6호차 ]
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  남은 탐사 AP : {Array.from({ length: 3 }).map((_, i) => (i < ap ? '●' : '○')).join(' ')} ({ap}/3)
                </span>
              </div>

              {/* 6대 탐사 포인트 그리드 */}
              <div className="grid grid-cols-2 gap-2.5">
                <ActionPanel points={SCENARIO_POINTS.STAGE_1} examinedPoints={examinedPoints} ap={ap} onExamine={examineCar6Point} color="cyan" compact={false} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>경고: 3회의 행동력이 소진되면 7호차의 괴물이 강제로 문을 뚫고 들어옵니다.</span>
            </div>
          </div>
        )}

        {/* STAGE 2 : 선로 터널 300m */}
        {stage === 'STAGE_2_TUNNEL' && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                  [ SCENE : 6호선 선로 터널 300m ]
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  남은 탐사 AP : {Array.from({ length: 3 }).map((_, i) => (i < ap ? '●' : '○')).join(' ')} ({ap}/3)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <ActionPanel points={SCENARIO_POINTS.STAGE_2} examinedPoints={examinedPoints} ap={ap} onExamine={examineTunnelPoint} color="cyan" compact={false} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400">
              {flags.has_lantern ? '🔦 랜턴 가동 중: 배터리 소모 면제' : '⚠️ 배터리 주의: 조사 행동마다 배터리가 소모됩니다.'}
            </div>
          </div>
        )}

        {/* STAGE 3 : 의태 승강장 & 출구 트랩 */}
        {stage === 'STAGE_3_PLATFORM' && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                  [ SCENE : 의태된 신도림역 승강장 ]
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  위화감 간파: {flags.anomalyCount}개 발견
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <ActionPanel points={SCENARIO_POINTS.STAGE_3} examinedPoints={examinedPoints} ap={ap} onExamine={examinePlatformPoint} color="emerald" compact={true} />
              </div>

              {/* 중대 분기 선택지 */}
              <div className="border-t border-neutral-800 pt-3 space-y-2">
                <div className="route-question text-[11px] font-bold text-amber-300">어디로 발걸음을 옮기시겠습니까?</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => choosePlatformExit('EXIT_3')}
                    className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold text-left cursor-pointer"
                  >
                    [경로 A] 3번 출구
                    <div className="text-[10px] font-normal text-amber-400/80 mt-0.5">택시 승차장 · 지상 탈출</div>
                  </button>

                  <button
                    onClick={() => choosePlatformExit('BREAKER')}
                    className="p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/50 text-cyan-200 text-xs font-bold text-left cursor-pointer"
                  >
                    [경로 B] 직원 점검구
                    <div className="text-[10px] font-normal text-cyan-400/80 mt-0.5">배전실 · 설비구역 진입</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4 : 지하 환승 상가 & 개찰구 */}
        {stage === 'STAGE_4_MALL' && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">
                  [ SCENE : 셔터 내린 지하 환승 상가 ]
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  남은 탐사 AP : {Array.from({ length: 3 }).map((_, i) => (i < ap ? '●' : '○')).join(' ')} ({ap}/3)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <ActionPanel points={SCENARIO_POINTS.STAGE_4} examinedPoints={examinedPoints} ap={ap} onExamine={examineMallPoint} color="purple" compact={false} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400">
              {flags.knows_fan_circuit ? '💡 CCTV 단서 확보: 최종전 배기팬 정지 DC -3 보너스 활성화!' : '힌트: CCTV 모니터에서 환기탑 전원 정보를 찾아보세요.'}
            </div>
          </div>
        )}

        {/* STAGE 5 : 수직 환기 갱도 최종 결전 */}
        {stage === 'STAGE_5_VENT' && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-rose-500 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-600 animate-pulse font-bold">
                  [ FINAL CLIMAX : 수직 환기탑 갱도 ]
                </span>
                <span className="text-xs font-mono text-rose-400 font-bold">
                  방화문 붕괴 카운트다운 : {turnLimit} 턴
                </span>
              </div>

              {!flags.fanStopped ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-300 mb-1">1단계 : 거대 회전 배기팬 정지 (선택지)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStage5Action('INT')}
                      className="p-3 rounded-xl bg-[#141926] hover:bg-[#1d2438] border border-cyan-500/40 text-left text-xs text-neutral-200 cursor-pointer"
                    >
                      <span className="font-bold text-cyan-300">[INT 판정]</span> 고압 배전반 퓨즈 단선
                      <div className="text-[10px] text-neutral-400 mt-1">{flags.knows_fan_circuit ? 'CCTV 보너스로 DC 9' : '지능 DC 12 요구'}</div>
                    </button>

                    <button
                      onClick={() => handleStage5Action('STR')}
                      className="p-3 rounded-xl bg-[#141926] hover:bg-[#1d2438] border border-rose-500/40 text-left text-xs text-neutral-200 cursor-pointer"
                    >
                      <span className="font-bold text-rose-300">[STR 판정]</span> 쇠지렛대로 기어 축 파괴
                      <div className="text-[10px] text-neutral-400 mt-1">완력 DC 13 (도구 파손 리스크)</div>
                    </button>

                    <button
                      onClick={() => handleStage5Action('DEX')}
                      className="p-3 rounded-xl bg-[#141926] hover:bg-[#1d2438] border border-yellow-500/40 text-left text-xs text-neutral-200 cursor-pointer"
                    >
                      <span className="font-bold text-yellow-300">[DEX 판정]</span> 칼날 틈새 도약 다이빙
                      <div className="text-[10px] text-neutral-400 mt-1">민첩 DC 14 (실패 시 대량 출혈)</div>
                    </button>

                    {hasFanStopTool ? (
                      <button
                        onClick={() => handleStage5Action('TOOL_WRENCH')}
                        className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-400 text-left text-xs text-emerald-200 cursor-pointer animate-pulse"
                      >
                        <span className="font-bold text-emerald-400">[도구 특전]</span> 보유 도구로 제어반 해제
                        <div className="text-[10px] text-emerald-300 mt-1">스패너·카드키·멀티툴로 주사위 없이 즉시 정지!</div>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-neutral-800 text-neutral-600 text-xs flex items-center justify-center">
                        자동 정지 도구 미보유
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-emerald-950/30 border border-emerald-500/50 p-4 rounded-2xl">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 size={16} /> 배기팬 완전 정지! 20m 사다리 등반 완료
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    머리 위에 육중한 주철 맨홀 뚜껑이 만져집니다. 아래에서는 사냥감을 놓친 괴물의 거대한 살덩이 해일이 갱도를 채우며 솟구쳐 오릅니다.
                  </p>
                  <button
                    onClick={handlePushManhole}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer"
                  >
                    [최종 판정 DC 11] 어깨로 주철 맨홀 뚜껑 밀어 올려 탈출하기!
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-neutral-500 font-mono text-center">
              * 3턴 이내에 탈출하지 못하면 갱도 전체가 촉수에 삼켜집니다.
            </div>
          </div>
        )}

      </main>
  );
}

import SurveyView from './SurveyView.jsx';
import SceneOverview from './SceneOverview.jsx';
import ActionPanel from './ActionPanel.jsx';
import { SCENARIOS } from '../../aquariumEngine.js';

export default function AquariumNarrative(game) {
  const { stage, state, ap, player } = game;
  const scenario = SCENARIOS[stage];
  const busy = !!game.activeModalText || game.diceModal.isOpen;
  return <main className="game-narrative bg-[#0a0c12] p-6 flex flex-col overflow-y-auto">
    <SceneOverview key={stage} stage={stage} currentBg={state.currentBg} />
    <SurveyView stage={stage} handleSelectArchetype={game.handleSelectArchetype} />
    {stage === 'DICE_CONDITION' && <div className="condition-panel my-auto text-center space-y-6 mx-auto"><h3>야간 당직의 피로도와 컨디션을 결정합니다</h3><p>컨디션에 따라 시작 HP / SAN과 순발력이 달라집니다.</p><button className="p-4 bg-amber-300 text-neutral-950" onClick={game.handleRollCondition}>D20 주사위 굴려 피로도 확정</button><p>1은 극심한 피로, 20은 마지막 출근의 담대함입니다.</p></div>}
    {scenario?.points && <section className="exploration-section space-y-3">
      <div className="exploration-hud"><div className="location-readout"><span>현재 위치</span><strong>{scenario.title.split(' — ')[1]}</strong></div><div className="ap-readout" role="status" aria-live="polite"><span>남은 조사 기회</span><strong>{ap}<small>/3회</small></strong><div className="ap-pips" aria-hidden="true">{[1,2,3].map(i => <i key={i} className={i <= ap ? 'is-available' : ''} />)}</div></div></div>
      <div className={`exploration-rule${ap === 0 ? ' is-empty' : ''}`}><strong>{ap === 0 ? '조사 완료' : '조사 규칙'}</strong><span>{ap === 0 ? '행동력 소진. 위기 결단으로 탈출로를 돌파하세요.' : `6곳 중 최대 3곳만 조사할 수 있습니다 · 남은 조사 ${ap}회`}</span></div>
      <div className="grid grid-cols-2 gap-2.5"><ActionPanel points={scenario.points.map(p => ({ ...p, title: p.name, tag: p.desc }))} examinedPoints={state.examined} ap={busy ? 0 : ap} onExamine={game.handleExamine} /></div>
      {ap === 0 && <button disabled={busy} onClick={game.handleStageResolve} className="utility-done bg-rose-950 text-rose-200">위기 결단 & 돌파</button>}
    </section>}
    {stage === 'STAGE_5_DOME' && <section className="final-encounter">
      <div className="final-hud"><div><span>FINAL ESCAPE PROTOCOL</span><strong>채광 아크릴 돔 · 지상 탈출</strong></div><div className="final-turns"><span>현재 수위</span><strong>95<small>%</small></strong></div></div>
      <div className="final-briefing"><span>00:30 · 수장 프로토콜 임박</span><h3>돔 너머의 밤비</h3><p>{scenario.sub}</p></div>
      <div className="grid grid-cols-3 gap-2">{[['HEATING_TORCH','가스 토치'],['CROWBAR','단조 빠루'],['OXYGEN_MASK','산소마스크']].map(([id,name]) => <div key={id} className={player.inventory.some(i => i.id === id) ? 'text-emerald-300' : 'text-neutral-500'}>{player.inventory.some(i => i.id === id) ? '✓' : '✗'} {name}</div>)}</div>
      <button disabled={busy || game.diceModal.rolling} onClick={game.handleStage5Break} className="utility-done">돔 아크릴 파쇄 및 지상 수직 사출 시도</button><p className="final-warning">토치·빠루·산소마스크가 탈출 난이도와 생환의 결말을 바꿉니다.</p>
    </section>}
  </main>;
}

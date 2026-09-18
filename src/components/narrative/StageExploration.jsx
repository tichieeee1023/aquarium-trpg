import ActionPanel from './ActionPanel.jsx';

function getPointTag(point) {
  if (point.checkStat) return `${point.checkStat} 판정`;
  if (point.reward) return '장비 탐색';
  return '조사';
}

export default function StageExploration({ scenario, state, ap, busy, onExamine, onAdvance }) {
  return (
    <section className="exploration-section space-y-3">
      <div className="exploration-hud"><div className="location-readout"><span>현재 위치</span><strong>{scenario.title.split(' — ')[1]}</strong></div><div className="ap-readout" role="status" aria-live="polite"><span>남은 조사 기회</span><strong>{ap}<small>/3회</small></strong><div className="ap-pips" aria-hidden="true">{[1, 2, 3].map((value) => <i key={value} className={value <= ap ? 'is-available' : ''} />)}</div></div></div>
      <div className={`exploration-rule${ap === 0 ? ' is-empty' : ''}`}><strong>{ap === 0 ? '조사 완료' : '조사 규칙'}</strong><span>{ap === 0 ? '행동력 소진. 다음 구역으로 이동하세요.' : `6곳 중 최대 3곳만 조사할 수 있습니다 · 남은 조사 ${ap}회`}</span></div>
      <div className="grid grid-cols-2 gap-2.5"><ActionPanel points={scenario.points.map((point) => ({ ...point, title: point.name, tag: getPointTag(point) }))} examinedPoints={state.examined} ap={busy ? 0 : ap} onExamine={onExamine} /></div>
      {ap === 0 && <button disabled={busy} onClick={onAdvance} className="utility-done bg-rose-950 text-rose-200">다음 구역으로 이동</button>}
    </section>
  );
}
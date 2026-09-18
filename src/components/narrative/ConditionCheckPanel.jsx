export default function ConditionCheckPanel({ onRoll }) {
  return (
    <section className="condition-panel my-auto mx-auto" aria-labelledby="condition-title">
      <div className="condition-panel__signal"><span>SHIFT STATUS // 23:45</span><i aria-hidden="true" /></div>
      <div className="condition-panel__body">
        <span className="condition-panel__eyebrow">NIGHT SHIFT READINESS CHECK</span>
        <h3 id="condition-title">오늘, 얼마나 버틸 수 있을까?</h3>
        <p>폐장 후 이어진 야간 당직의 피로도를 확인합니다. 결과에 따라 시작 HP · SAN과 순발력이 달라집니다.</p>
        <div className="condition-panel__range" aria-label="주사위 결과 범위"><span><b>01</b> 극심한 피로</span><span><b>08–14</b> 표준 컨디션</span><span><b>20</b> 심해의 담대함</span></div>
        <button className="condition-panel__roll" onClick={onRoll}><span>ROLL D20</span><small>컨디션 확인</small></button>
      </div>
      <p className="condition-panel__footnote">주사위는 첫 위기에 들어가기 전, 당신의 오늘을 기록합니다.</p>
    </section>
  );
}
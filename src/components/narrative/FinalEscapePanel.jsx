import { FINAL_ESCAPE_STEPS, hasFinalStepTool } from '../../game/finalEscape.js';

const STEP_SHORT_LABELS = ['압력 해제', '돔 파쇄', '지상 탈출'];

function getStepButtonLabel(stepId) {
  if (stepId === 'VENT') return '압력 배출구 개방 시도';
  if (stepId === 'FRACTURE') return '아크릴 지지대 파쇄 시도';
  return '분출수 속 지상 탈출 시도';
}

export default function FinalEscapePanel({
  scenario,
  player,
  busy,
  rolling,
  onBreak
}) {
  const resolvedSteps = player.finalStep ?? 0;
  const currentIndex = Math.min(resolvedSteps, FINAL_ESCAPE_STEPS.length - 1);
  const current = FINAL_ESCAPE_STEPS[currentIndex];
  const failures = player.finalFailures ?? 0;

  const prepared = hasFinalStepTool(
    current,
    player.inventory,
    player.profileId
  );

  const currentDc = prepared ? current.preparedDc : current.baseDc;
  const hasSpecialty = current.specialties.includes(player.profileId);
  const hpDanger = player.hp <= 6;

  return (
    <section className="final-encounter" aria-label="최종 탈출 프로토콜">
      <header className="final-hud">
        <div>
          <span>FINAL ESCAPE PROTOCOL</span>
          <strong>채광 아크릴 돔 · 3단계 지상 탈출</strong>
        </div>

        <div className="final-turns">
          <span>STEP</span>
          <strong>
            {Math.min(resolvedSteps + 1, 3)}
            <small>/3</small>
          </strong>
        </div>
      </header>

      <ol className="final-stepper" aria-label="최종 탈출 진행 상황">
        {FINAL_ESCAPE_STEPS.map((step, index) => {
          const complete = index < resolvedSteps;
          const active = index === resolvedSteps;

          return (
            <li
              key={step.id}
              className={[
                'final-stepper-item',
                complete ? 'is-complete' : '',
                active ? 'is-current' : ''
              ].filter(Boolean).join(' ')}
            >
              <span className="final-step-number">
                {complete ? '✓' : index + 1}
              </span>
              <span className="final-step-name">{STEP_SHORT_LABELS[index]}</span>
            </li>
          );
        })}
      </ol>

      <div className="final-briefing">
        <span>00:30 · 수장 프로토콜 임박</span>
        <h3>{current.title.replace(/^\d+\.\s*/, '')}</h3>
        <p>{current.description}</p>
        <p className="final-context">{scenario.sub}</p>
      </div>

      <div className="final-check-card">
        <div className="final-check-head">
          <div>
            <span className="final-check-kicker">{current.stat} CHECK</span>
            <strong>DC {currentDc}</strong>
          </div>
          <span className={prepared ? 'final-risk is-ready' : 'final-risk is-danger'}>
            {prepared ? '준비됨' : '강행 판정'}
          </span>
        </div>

        <div className="final-modifiers">
          <div className={prepared ? 'is-positive' : 'is-negative'}>
            <span>{prepared ? '✓' : '✕'}</span>
            <div>
              <strong>{current.itemName}</strong>
              <small>
                {prepared
                  ? `장비 확보 · DC ${current.baseDc} → ${current.preparedDc}`
                  : `미보유 · 기본 DC ${current.baseDc}`}
              </small>
            </div>
          </div>

          <div className={hasSpecialty ? 'is-positive' : ''}>
            <span>{hasSpecialty ? '✓' : '—'}</span>
            <div>
              <strong>직업 특기</strong>
              <small>{hasSpecialty ? `${player.title} · 판정 +2` : '현재 단계 특기 없음'}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="final-status-strip">
        <span className={hpDanger ? 'is-danger' : ''}>HP {player.hp}/{player.maxHp}</span>
        <span>누적 실패 {failures}</span>
        <span>{prepared ? '장비 보정 적용' : '장비 없이 강행'}</span>
      </div>

      <button
        disabled={busy || rolling || resolvedSteps >= 3}
        onClick={onBreak}
        className="final-action-button"
      >
        <span>{getStepButtonLabel(current.id)}</span>
        <small>
          {prepared
            ? `${current.stat} DC ${currentDc} · 장비 보정 적용`
            : `${current.stat} DC ${currentDc} · 실패 시 큰 부상 위험`}
        </small>
      </button>

      <p className={`final-warning${prepared ? '' : ' is-danger'}`}>
        {prepared
          ? '장비가 난이도를 낮췄습니다. 성공은 보장되지 않습니다.'
          : '필요 장비가 없습니다. 이 단계는 높은 난이도로 강행합니다.'}
      </p>
    </section>
  );
}

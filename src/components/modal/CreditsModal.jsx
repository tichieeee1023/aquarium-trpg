import DialogFrame from './DialogFrame.jsx';

const NOTES = [
  ['FRONTEND', 'React · Vite'],
  ['NARRATIVE SYSTEM', '상태 기반 분기 · D20 판정 · 멀티 엔딩'],
  ['INTERACTION', 'Canvas 주사위 · 타입라이터 · 사운드 · 화면 연출'],
  ['GAME STATE', '직업 · 인벤토리 · AP · HP / SAN · 플래그 분기'],
  ['RESPONSIVE UI', '모바일 퀵 인벤토리 · 반응형 레이아웃'],
  ['ACCESSIBILITY', '키보드 포커스 · 모션 및 글자 크기 설정'],
  ['TYPEFACE', 'DungGeunMo']
];

export default function CreditsModal({ onClose }) {
  return (
    <DialogFrame
      title="SYSTEM NOTES"
      onClose={onClose}
      className="credits-dialog"
    >
      <p className="credits-lead">
        00:35 AM · AQUARIUM: DEEP RIFT SURVIVAL TRPG
      </p>

      <div className="credits-author">
        <span>DESIGN & DEVELOPMENT</span>
        <strong>Lee YJ</strong>
      </div>

      <dl className="credits-list">
        {NOTES.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>

      <p className="credits-footnote">
        A short survival TRPG built for the web.
      </p>

      <button
        className="utility-done"
        onClick={onClose}
      >
        [닫기]
      </button>
    </DialogFrame>
  );
}

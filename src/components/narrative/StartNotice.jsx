import { ArrowRight } from 'lucide-react';
import { SCENE_ASSETS } from '../../data/assetDB.js';

const TERMS = [
  ['HP', '체력'],
  ['SAN', '정신력'],
  ['AP', '조사 행동력'],
  ['D20', '20면체 주사위 판정'],
];

const WARNINGS = ['공포 연출', '감전', '익사', '저체온', '신체 부상', '경미한 유혈 표현'];

export default function StartNotice({ onEnter }) {
  return <main className="intro-screen start-notice" aria-labelledby="start-notice-title">
    <img className="intro-image" src={SCENE_ASSETS.INTRO.src} alt="" />
    <div className="intro-shade" aria-hidden="true" />
    <section className="start-notice-panel">
      <div className="start-notice-heading">
        <span className="start-notice-kicker">NIGHT AQUARIUM · PLAYER BRIEFING</span>
        <h1 id="start-notice-title">23:45</h1>
        <p>아쿠아리움: 심해의 균열</p>
      </div>
      <div className="start-notice-columns">
        <section className="start-notice-play" aria-labelledby="start-notice-play-title">
          <h2 id="start-notice-play-title">PLAY GUIDE</h2>
          <p>직업을 선택하고, 제한된 행동력 안에서 시설을 조사하세요.</p>
          <p>획득한 장비와 판정 결과에 따라 생존 경로와 엔딩이 달라집니다.</p>
          <p>여러 차례 플레이하며 다른 직업과 엔딩을 확인할 수 있습니다.</p>
        </section>
        <section className="start-notice-portfolio" aria-labelledby="start-notice-portfolio-title">
          <h2 id="start-notice-portfolio-title">PORTFOLIO NOTE</h2>
          <p>프론트엔드 개발 역량을 보여주기 위해, React 기반의 상태 관리와 조건부 렌더링으로 사용자 선택에 따라 UI와 진행이 달라지는 게임을 구현했습니다.</p>
          <p className="start-notice-details">상세 구현과 기술 설명은<br /><strong>설정 → 크레딧 → GitHub</strong>에서 확인할 수 있습니다.</p>
        </section>
      </div>
      <dl className="start-notice-terms" aria-label="게임 용어">
        {TERMS.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}
      </dl>
      <section className="start-notice-warning" aria-labelledby="start-notice-warning-title">
        <h2 id="start-notice-warning-title">CONTENT WARNING</h2>
        <ul>{WARNINGS.map((warning) => <li key={warning}>{warning}</li>)}</ul>
      </section>
      <div className="start-notice-footer">
        <p>일부 비주얼 에셋 제작에 AI 도구를 활용했습니다.<br />프론트엔드 개발 포트폴리오를 위해 제작했습니다.</p>
        <button type="button" className="start-notice-enter" onClick={onEnter}>ENTER <ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </section>
  </main>;
}

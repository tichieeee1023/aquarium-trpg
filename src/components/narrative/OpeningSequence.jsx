import { useState } from 'react';
import { SCENE_ASSETS } from '../../data/assetDB.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from './TypedText.jsx';

const OPENING_LINES = [
  '23시 45분. 갑자기 비어 버린 당직표 끝에 내 이름이 남았다. 오늘도 마감 뒤 한 시간만 더 버티면 된다.',
  '낮에는 사람들로 가득하던 통로가 문을 닫자 거짓말처럼 비었다. 나는 초대형 수조 앞에 멈춰 섰다.',
  '푸른 물속을 천천히 가로지르는 그림자를 바라보다가, 이유 없이 등이 서늘해졌다. 수조 안쪽에서 나를 먼저 보고 있는 것 같은 기분이 들었다.'
];

export default function OpeningSequence({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const line = OPENING_LINES[step];
  const { count, done, finish } = useTypewriter(line);
  const advance = () => {
    if (!done) { finish(); return; }
    if (step < OPENING_LINES.length - 1) setStep((current) => current + 1);
    else onComplete();
  };
  return <main className="opening-screen" aria-labelledby="opening-title">
    <img className="opening-image" src={SCENE_ASSETS.INTRO.src} alt={SCENE_ASSETS.INTRO.alt} />
    <div className="opening-shade" aria-hidden="true" />
    <section className="opening-copy">
      <div className="opening-label">PROLOGUE · 23:45 · AQUARIUM</div>
      <h2 id="opening-title">야간 당직</h2>
      <p><TypedText text={line} count={count} /></p>
      <div className="opening-actions">
        <button className="opening-next" onClick={advance}>{!done ? '텍스트 바로 보기' : step === OPENING_LINES.length - 1 ? '돌발 퀘스트 시작' : '> 다음'}</button>
        <button className="opening-skip" onClick={onSkip}>인트로 건너뛰기</button>
      </div>
      <div className="opening-progress" aria-label={`프롤로그 ${step + 1} / ${OPENING_LINES.length}`}>{OPENING_LINES.map((_, index) => <span key={index} className={index <= step ? 'is-active' : ''} />)}</div>
    </section>
  </main>;
}

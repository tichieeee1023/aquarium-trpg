import { useState } from 'react';
import { SCENE_ASSETS } from '../../data/assetDB.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from './TypedText.jsx';

const OPENING_LINES = [
  '나는 00시 37분 막차에 올랐다. 비가 내리는 신도림역. 오늘도 평소와 다르지 않은 퇴근이었다.',
  '치익— 펑! 숨 막히는 적막 속 6호차. 갑자기 닫힌 문 너머로 열차가 비정상적인 굉음을 내며 지하 깊숙이 곤두박질쳤다.',
  '콰앙—! 귀를 찢는 급제동과 함께 객실 조명이 일제히 파열되었다. 칠흑 같은 암전이 찾아왔다.',
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
    <img className="opening-image" src={SCENE_ASSETS.PROLOGUE_TRAIN.src} alt={SCENE_ASSETS.PROLOGUE_TRAIN.alt} />
    <div className="opening-shade" aria-hidden="true" />
    <section className="opening-copy">
      <div className="opening-label">PROLOGUE · 00:37 AM · CAR 6</div>
      <h2 id="opening-title">막차</h2>
      <p><TypedText text={line} count={count} /></p>
      <div className="opening-actions">
        <button className="opening-next" onClick={advance}>{!done ? '텍스트 바로 보기' : step === OPENING_LINES.length - 1 ? '돌발 퀘스트 시작' : '> 다음'}</button>
        <button className="opening-skip" onClick={onSkip}>인트로 건너뛰기</button>
      </div>
      <div className="opening-progress" aria-label={`프롤로그 ${step + 1} / ${OPENING_LINES.length}`}>{OPENING_LINES.map((_, index) => <span key={index} className={index <= step ? 'is-active' : ''} />)}</div>
    </section>
  </main>;
}

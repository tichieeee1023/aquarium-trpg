import { useState } from 'react';
import { SCENE_ASSETS } from '../../data/assetDB.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from './TypedText.jsx';

const OPENING_LINES = [
  '23시 45분. 폐장 뒤 야간 당직표에는 내 이름만 남아 있었다. 마지막 점검을 마치면 오늘 일도 끝이다. 한 시간만 더 버티면 된다.',
  '손님들의 발소리가 끊기자 수족관은 갑자기 너무 조용해졌다. 대신 펌프가 도는 낮은 진동이 바닥을 타고 발바닥까지 올라왔다. 나는 초대형 수조 앞에서 걸음을 멈췄다.',
  '푸른 물속을 가로지르는 그림자를 눈으로 쫓았다. 상어는 유리 너머에 있는데, 누군가 내 등 뒤에 바짝 서 있는 듯 목덜미가 서늘했다.'
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

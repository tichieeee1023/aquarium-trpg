import { SCENE_ASSETS } from '../../data/assetDB.js';

export default function IntroScreen({ onStart, onSettings, onHelp }) {
  return (
    <main className="intro-screen">
      <img className="intro-image" src={SCENE_ASSETS.INTRO.src} alt={SCENE_ASSETS.INTRO.alt} />
      <div className="intro-shade" aria-hidden="true" />
      <section className="intro-copy">
        <div className="intro-label">MIDNIGHT SUBWAY · SURVIVAL TRPG</div>
        <h1>00:37 AM</h1>
        <h2>심야 지하철 생존기</h2>
        <p>막차에 올랐다.<br />다음 역은, 당신이 알던 곳이 아니다.</p>
        <div className="intro-actions">
          <button onClick={onStart} className="bg-amber-300 text-neutral-950 font-bold cursor-pointer">게임 시작</button>
          <button onClick={onSettings} className="bg-neutral-900 text-neutral-100 cursor-pointer">설정</button>
          <button onClick={onHelp} className="bg-neutral-900 text-neutral-100 cursor-pointer">도움말</button>
        </div>
        <div className="intro-hint">D20 주사위 · 도구 수집 · 다섯 개의 결말</div>
      </section>
    </main>
  );
}

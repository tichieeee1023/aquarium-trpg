import { SCENE_ASSETS } from '../../data/assetDB.js';
import CompletionCelebration from './CompletionCelebration.jsx';

export default function IntroScreen({
  onStart,
  onSettings,
  onHelp,
  onCollection,
  collectionUnlocked,
  collectionComplete,
  disableEffects,
  celebrationActive,
  onCelebrationFinish
}) {
  return (
    <main className="intro-screen">
      <img
        className="intro-image"
        src={SCENE_ASSETS.INTRO.src}
        alt={SCENE_ASSETS.INTRO.alt}
      />

      <div
        className="intro-shade"
        aria-hidden="true"
      />

      <CompletionCelebration
        active={celebrationActive}
        disableEffects={disableEffects}
        onFinish={onCelebrationFinish}
      />

      <section className="intro-copy">
        <div className="intro-label">
          MIDNIGHT AQUARIUM · SURVIVAL TRPG
        </div>

        <h1>23:45</h1>
        <h2>아쿠아리움: 심해의 균열</h2>

        <p>
          폐장 후, 침수 경보가 울렸다.
          <br />
          수조 너머의 밤이 통로로 밀려온다.
        </p>

        <div className="intro-actions">
          <button
            onClick={onStart}
            className="bg-amber-300 text-neutral-950 font-bold cursor-pointer"
          >
            게임 시작
          </button>

          <button
            onClick={onSettings}
            className="bg-neutral-900 text-neutral-100 cursor-pointer"
          >
            설정
          </button>

          <button
            onClick={onHelp}
            className="bg-neutral-900 text-neutral-100 cursor-pointer"
          >
            도움말
          </button>

          <button
            onClick={onCollection}
            disabled={!collectionUnlocked}
            title={
              collectionUnlocked
                ? '엔딩 도감'
                : '엔딩을 하나 이상 보면 열립니다'
            }
            className={`bg-neutral-900 text-neutral-100 cursor-pointer${
              collectionComplete
                ? ' collection-button-complete'
                : ''
            }`}
          >
            {collectionComplete
              ? '✦ 엔딩 도감 · 7/7'
              : collectionUnlocked
                ? '엔딩 도감'
                : '엔딩 도감 · 잠김'}
          </button>
        </div>

        <div className="intro-hint">
          D20 주사위 · 도구 수집 · 일곱 개의 결말
        </div>
      </section>
    </main>
  );
}

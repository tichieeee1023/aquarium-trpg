import { useEffect, useRef } from 'react';

const COLORS = [
  '#ffd85e',
  '#fff1ad',
  '#ef8b66',
  '#7bd7e5',
  '#c89cff'
];

export default function CompletionCelebration({
  active,
  disableEffects,
  onFinish
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || disableEffects) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return undefined;

    let raf = 0;
    let width = 0;
    let height = 0;
    let lastLaunch = 0;

    const rockets = [];
    const sparks = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    const burst = (x, y, color) => {
      const count = 56;

      for (let i = 0; i < count; i += 1) {
        const angle =
          (Math.PI * 2 * i) / count +
          Math.random() * 0.1;
        const speed = 2 + Math.random() * 5.4;

        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.05 + Math.random() * 0.025,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          size: Math.random() > 0.75 ? 4 : 3,
          color
        });
      }
    };

    const launch = () => {
      rockets.push({
        x: width * (0.12 + Math.random() * 0.76),
        y: height + 20,
        targetY: height * (0.1 + Math.random() * 0.35),
        vy: -(7.6 + Math.random() * 2.4),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    };

    resize();
    const startedAt = performance.now();

    const render = now => {
      const elapsed = now - startedAt;
      ctx.clearRect(0, 0, width, height);

      if (
        elapsed < 5400 &&
        now - lastLaunch > (elapsed < 2200 ? 230 : 390)
      ) {
        launch();
        lastLaunch = now;
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const rocket = rockets[i];

        rocket.y += rocket.vy;
        rocket.vy += 0.04;

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = rocket.color;
        ctx.fillRect(rocket.x, rocket.y, 3, 10);

        if (rocket.y <= rocket.targetY || rocket.vy >= -1.2) {
          burst(rocket.x, rocket.y, rocket.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const p = sparks[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.992;
        p.life -= p.decay;

        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.globalAlpha = 1;

      if (
        elapsed < 6500 ||
        rockets.length > 0 ||
        sparks.length > 0
      ) {
        raf = requestAnimationFrame(render);
      }
    };

    raf = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active, disableEffects]);

  useEffect(() => {
    if (!active) return undefined;

    const timer = window.setTimeout(
      () => onFinish?.(),
      disableEffects ? 5200 : 7600
    );

    return () => window.clearTimeout(timer);
  }, [active, disableEffects, onFinish]);

  if (!active) return null;

  return (
    <div
      className={`completion-celebration${disableEffects ? ' is-static' : ''}`}
      role="status"
      aria-live="polite"
    >
      {!disableEffects && (
        <canvas
          ref={canvasRef}
          className="completion-canvas"
          aria-hidden="true"
        />
      )}

      <div className="completion-scan" aria-hidden="true" />

      <section className="completion-terminal">
        <header className="completion-header">
          <span>AQUARIUM // ARCHIVE COMPLETE</span>
          <strong>07 / 07</strong>
        </header>

        <figure className="completion-visual">
          <img
            className="completion-art"
            src="/assets/scenes/completion-aquarium.webp"
            alt="새벽빛이 비치는 아쿠아리움과 바다를 바라보는 생존자"
          />
          <figcaption>00:35 AM · EXIT ROUTE SECURED</figcaption>
        </figure>

        <div className="completion-thanks">
          <h2>THANK YOU FOR PLAYING</h2>
          <h3>아쿠아리움: 심해의 균열</h3>
          <p className="completion-copy">
            7개의 결말과 마지막 기록까지 확인해 주셔서 감사합니다.
            <br />당신은 깊은 밤의 균열을 지나, 무사히 돌아왔습니다.
          </p>
        </div>

        <div className="completion-score">
          <span>ALL ENDINGS</span>
          <strong>7 / 7</strong>
        </div>

        <div className="completion-main">
          <p className="completion-code">
            PROJECT ABYSSAL RIFT · FINAL RECORD DECLASSIFIED
          </p>

          <h2>THANK YOU FOR PLAYING</h2>
          <h3>《아쿠아리움: 심해의 균열》</h3>

          <p className="completion-copy">
            일곱 개의 결말과 마지막 기록까지,
            <br />
            이 깊은 밤의 끝을 함께 확인해 주셔서 감사합니다.
          </p>
        </div>

        <footer className="completion-footer">
          <div className="completion-signoff">
            <span>DESIGN & DEVELOPMENT</span>
            <strong>Lee YJ</strong>
          </div>

          <p className="completion-final-line">
            00:35 AM · SURVIVOR RECORD CLOSED
          </p>
        </footer>
      </section>
    </div>
  );
}

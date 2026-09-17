class SubwayAudioEngine {
constructor() {
this.ctx = null;
this.enabled = true;
}

init() {
if (!this.ctx && typeof window !== 'undefined') {
const AudioCtx = window.AudioContext || window.webkitAudioContext;
this.ctx = new AudioCtx();
}

if (this.ctx && this.ctx.state === 'suspended') {
this.ctx.resume();
}
}

setEnabled(enabled) {
this.enabled = enabled;
}

// 1) 텍스트/터미널 키 입력 클릭음
playClick() {
if (!this.enabled) return;
this.init();
if (!this.ctx) return;
const now = this.ctx.currentTime;
const osc = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = 'triangle';
osc.frequency.setValueAtTime(450, now);
osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
gain.gain.setValueAtTime(0.06, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
osc.connect(gain);
gain.connect(this.ctx.destination);
osc.start(now);
osc.stop(now + 0.05);
}

// 2) 주사위 굴림 사운드 (연속 래칫 클릭)
playDiceRoll() {
if (!this.enabled) return;
this.init();
if (!this.ctx) return;
const count = 14;
for (let i = 0; i < count; i++) {
const delay = i * 0.09 + i * i * 0.003;
const now = this.ctx.currentTime + delay;
const osc = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = 'square';
osc.frequency.setValueAtTime(300 + Math.random() * 500, now);
gain.gain.setValueAtTime(0.05, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
osc.connect(gain);
gain.connect(this.ctx.destination);
osc.start(now);
osc.stop(now + 0.07);
}
}

// 3) 판정 대성공 (Natural 20 / 성공)
playSuccess() {
if (!this.enabled) return;
this.init();
if (!this.ctx) return;
const notes = [440, 554.37, 659.25, 880]; // A major
notes.forEach((freq, idx) => {
const now = this.ctx.currentTime + idx * 0.08;
const osc = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = 'triangle';
osc.frequency.setValueAtTime(freq, now);
gain.gain.setValueAtTime(0.09, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
osc.connect(gain);
gain.connect(this.ctx.destination);
osc.start(now);
osc.stop(now + 0.36);
});
}

// 4) 판정 대실패 / 치명타 피격
playDanger() {
if (!this.enabled) return;
this.init();
if (!this.ctx) return;
const now = this.ctx.currentTime;
const osc = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(140, now);
osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
gain.gain.setValueAtTime(0.15, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
osc.connect(gain);
gain.connect(this.ctx.destination);
osc.start(now);
osc.stop(now + 0.46);
}

// 5) 심장 박동 (이성 하락 / 위기 연출)
playHeartbeat() {
if (!this.enabled) return;
this.init();
if (!this.ctx) return;
[0, 0.18].forEach((offset) => {
const now = this.ctx.currentTime + offset;
const osc = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(65, now);
osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
gain.gain.setValueAtTime(0.12, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
osc.connect(gain);
gain.connect(this.ctx.destination);
osc.start(now);
osc.stop(now + 0.13);
});
}

// 6) 글리치 노이즈 / 정전 굉음
playGlitch() {
if (!this.enabled) return;
this.init();
if (!this.ctx) return;
const now = this.ctx.currentTime;
const bufferSize = this.ctx.sampleRate * 0.2;
const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
data[i] = Math.random() * 2 - 1;
}
const noise = this.ctx.createBufferSource();
noise.buffer = buffer;
const gain = this.ctx.createGain();
gain.gain.setValueAtTime(0.09, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
noise.connect(gain);
gain.connect(this.ctx.destination);
noise.start(now);
}
}

const sfx = new SubwayAudioEngine();

export function useAudioSynth() {
  return sfx;
}

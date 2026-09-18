import { SCENARIOS } from '../data/game/scenarios.js';

export const NEXT_STAGE = {
  STAGE_1_JELLYFISH: 'STAGE_2_BULKHEAD',
  STAGE_2_BULKHEAD: 'STAGE_3_FREEZER',
  STAGE_3_FREEZER: 'STAGE_4_PUMP',
  STAGE_4_PUMP: 'STAGE_5_DOME'
};

export function createStageIntroStory(stageKey) {
  const scenario = SCENARIOS[stageKey];
  if (!scenario) return null;

  return {
    kind: 'SCENE',
    title: scenario.title,
    tag: '구역 진입',
    body: scenario.sub,
    image: { src: scenario.bg, alt: scenario.title }
  };
}

export function getStageTransitionStory(fromStage, targetStage) {
  if (fromStage !== 'STAGE_3_FREEZER' || targetStage !== 'STAGE_4_PUMP') {
    return null;
  }

  return {
    kind: 'SCENE',
    title: '00:19 — 냉동고 탈출',
    tag: '탈출 경로',
    body: `래치가 풀리자 냉동고 뒤편 정비문이 반쯤 열렸다. 나는 사료 조리실을 지나, 바닥 배수구 쪽으로 기울어진 서비스 복도로 몸을 던졌다.

파열된 냉각 배관에서는 하얀 증기가 새고 있었다. 침수된 다른 통로는 이미 막혔다. 배수 펌프실을 지나야만 지상으로 이어지는 비상 계단에 닿을 수 있다.`,
    image: {
      src: SCENARIOS.STAGE_4_PUMP.bg,
      alt: '증기로 가득 찬 배수 기계실로 이어지는 서비스 복도'
    }
  };
}
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
    body: `래치가 풀리며 문이 손가락 두 마디만큼 벌어졌다. 나는 틈에 어깨를 밀어 넣고 사료 조리실로 빠져나왔다. 뒤쪽 냉동고 문이 다시 닫히는 소리가 등 뒤를 쫓았다.

서비스 복도는 배수구 쪽으로 기울어져 있었다. 파열된 냉각 배관에서 흰 증기가 새고, 바닥의 물은 발목을 잡아당기듯 낮은 쪽으로 흐른다. 다른 통로는 이미 잠겼다. 저 끝의 펌프실을 지나야 지상으로 올라갈 수 있다.`,
    image: {
      src: SCENARIOS.STAGE_4_PUMP.bg,
      alt: '증기로 가득 찬 배수 기계실로 이어지는 서비스 복도'
    }
  };
}

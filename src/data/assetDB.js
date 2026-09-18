import { JOBS, SCENARIOS, ENDINGS } from '../aquariumEngine.js';

export const CHARACTER_PORTRAITS = Object.fromEntries(Object.values(JOBS).map((job) => [job.key, { M: job.imgM, F: job.imgF }]));

// 아쿠아리움의 타이틀·전환·스테이지 장면만 모은 이미지 사전.
export const SCENE_ASSETS = {
  INTRO: { src: '/assets/scenes/scene_intro_aquarium.webp', alt: '폐장 후의 아쿠아리움' },
  BLACKOUT: { src: '/assets/scenes/scene_stage1_blackout_shock.png', alt: '암전과 함께 검게 변한 해파리 터널' },
  CLASSIFIED_REPORT: { src: '/assets/scenes/scene_classified_truth.webp', alt: '프로젝트 심해 침식 최종 기밀 보고서' },
  ...Object.fromEntries(Object.entries(SCENARIOS).map(([id, scene]) => [id, { src: scene.bg, alt: scene.title }]))
};

export const DICE_ASSETS = {
  idle: { img: '/assets/items/item_dice_idle.webp', name: 'D20 주사위' },
  rolling: { img: '/assets/items/item_dice_rolling2.webp', name: '회전 중' },
  success: { img: '/assets/items/item_dice_success.webp', name: '성공' },
  failure: { img: '/assets/items/item_dice_fail.webp', name: '실패' },
  criticalSuccess: { img: '/assets/items/item_dice_crit_success.webp', name: '대성공 (20)' },
  criticalFailure: { img: '/assets/items/item_dice_crit_fail.webp', name: '대실패 (1)' }
};

export const ENDING_CARDS = Object.fromEntries(Object.keys(ENDINGS).map((id) => [id, `/assets/endings/card_ending_${id.toLowerCase().replace('_', '')}.png`]));

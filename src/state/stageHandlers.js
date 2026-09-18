import { GAME_ACTIONS } from './gameActions.js';
import { createStage0Handlers } from './stages/stage0Handlers.js';
import { createStage1Handlers } from './stages/stage1Handlers.js';
import { createStage2Handlers } from './stages/stage2Handlers.js';
import { createStage3Handlers } from './stages/stage3Handlers.js';
import { createStage4Handlers } from './stages/stage4Handlers.js';
import { createStage5Handlers } from './stages/stage5Handlers.js';
import { createInventoryHandlers } from './inventoryHandlers.js';

export function createStageHandlers(context) {
  return {
    ...createStage0Handlers(context),
    ...createStage1Handlers(context),
    ...createStage2Handlers(context),
    ...createStage3Handlers(context),
    ...createStage4Handlers(context),
    ...createStage5Handlers(context),
    ...createInventoryHandlers(context),
    handleRestart() {
      context.sfx.playClick();
      context.dispatch({ type: GAME_ACTIONS.RESET });
      context.setLogs(['2026-09-18 00:30:12 : 시스템 리셋 및 재탑승.']);
    },
  };
}

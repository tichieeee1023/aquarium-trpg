import { createExplorationHandlers } from './explorationHandlers.js';

export function createStage3Handlers(context) {
  const handlers = createExplorationHandlers(context, 'STAGE_3_PLATFORM');
  return { examinePlatformPoint: handlers.examine, choosePlatformExit: handlers.choosePlatformExit };
}

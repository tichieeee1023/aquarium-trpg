import { createExplorationHandlers } from './explorationHandlers.js';

export function createStage4Handlers(context) {
  const handlers = createExplorationHandlers(context, 'STAGE_4_MALL');
  return { examineMallPoint: handlers.examine };
}

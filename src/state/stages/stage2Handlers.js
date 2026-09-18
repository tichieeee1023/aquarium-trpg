import { createExplorationHandlers } from './explorationHandlers.js';

export function createStage2Handlers(context) {
  const handlers = createExplorationHandlers(context, 'STAGE_2_TUNNEL');
  return { examineTunnelPoint: handlers.examine };
}

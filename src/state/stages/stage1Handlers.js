import { createExplorationHandlers } from './explorationHandlers.js';

export function createStage1Handlers(context) {
  const handlers = createExplorationHandlers(context, 'STAGE_1_CAR6');
  return { examineCar6Point: handlers.examine };
}

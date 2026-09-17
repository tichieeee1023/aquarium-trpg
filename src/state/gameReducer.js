import { GAME_ACTIONS } from './gameActions.js';
import { createInitialGameState } from './initialGameState.js';

export function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.UPDATE_FIELD: {
      if (!Object.hasOwn(state, action.field)) return state;
      const value = typeof action.value === 'function' ? action.value(state[action.field]) : action.value;
      if (action.field === 'player') {
        const existingIds = new Set(state.player.inventory.map((item) => item.id));
        const rewards = value.inventory.filter((item) => item.img && !existingIds.has(item.id));
        return { ...state, player: value, pendingRewards: [...state.pendingRewards, ...rewards] };
      }
      if (action.field === 'activeModalText' && value) {
        return {
          ...state,
          activeModalText: { ...value, rewardItems: value.rewardItems ?? state.pendingRewards },
          pendingRewards: [],
        };
      }
      return { ...state, [action.field]: value };
    }
    case GAME_ACTIONS.RESET:
      return createInitialGameState();
    default:
      return state;
  }
}

import { canAct } from './gameRules.js';

export function createInventoryHandlers({ getState, setPlayer, addLog, sfx }) {
  return { handleUseItem(id) {
    const state = getState();
    const item = state.player.inventory.find((entry) => entry.id === id);
    if (!canAct(state) || !state.stage.startsWith('STAGE_') || !item?.consumable) return;
    const hp = Math.min(state.player.maxHp, state.player.hp + (item.hpRestore ?? 0));
    const san = Math.min(state.player.maxSan, state.player.san + (item.sanRestore ?? 0));
    if (hp === state.player.hp && san === state.player.san) return;
    setPlayer((player) => ({ ...player, hp, san, inventory: player.inventory.filter((entry) => entry.id !== id) }));
    sfx.playSuccess(); addLog(`${item.name} 사용: HP +${hp - state.player.hp}, SAN +${san - state.player.san}.`);
  } };
}

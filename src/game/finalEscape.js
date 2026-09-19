export const FINAL_ESCAPE_STEPS = [
  {
    id: 'VENT',
    title: '1. 돔 아래 압력 배출구',
    description: '비상 밸브를 열어 돔을 짓누르는 수압을 빼낸다. 잠금쇠가 풀리는 순간, 틈새로 물이 먼저 비명을 지르며 샌다.',
    stat: 'INT',
    itemId: 'HEATING_TORCH',
    itemName: '가스 토치',
    baseDc: 14,
    preparedDc: 9,
    specialties: ['VET', 'SECURITY']
  },
  {
    id: 'FRACTURE',
    title: '2. 아크릴 균열 벌리기',
    description: '금이 간 지지대에 힘을 실어 아크릴 돔을 무너뜨린다. 밀어붙일 때마다 하얀 균열이 번지고, 돔 전체가 낮게 울기 시작한다.',
    stat: 'STR',
    itemId: 'CROWBAR',
    itemName: '단조 빠루',
    baseDc: 15,
    preparedDc: 10,
    specialties: ['AQUARIST'],
    substituteItemId: 'TONGS',
    substituteFor: ['AQUARIST']
  },
  {
    id: 'ASCENT',
    title: '3. 분출수를 뚫고 지상으로',
    description: '돔이 무너지는 순간 물기둥이 몸을 밀어 올린다. 파편과 물살에 휩쓸리지 않도록 마지막 힘으로 수면을 향해 몸을 던진다.',
    stat: 'DEX',
    itemId: 'OXYGEN_MASK',
    itemName: '산소마스크',
    baseDc: 14,
    preparedDc: 9,
    specialties: ['DIVER']
  }
];

const hasItem = (inventory, id) => inventory.some((item) => item.id === id);

export function hasFinalStepTool(step, inventory, characterKey) {
  if (step.id === 'VENT' && hasItem(inventory, 'MASTER_KEYCARD')) return true;
  if (step.id === 'FRACTURE' && hasItem(inventory, 'HEX_WRENCH')) return true;

  const hasPrimary = hasItem(inventory, step.itemId);

  if (hasPrimary) return true;

  const canUseSubstitute =
    step.substituteItemId &&
    step.substituteFor?.includes(characterKey) &&
    hasItem(inventory, step.substituteItemId);

  return Boolean(canUseSubstitute);
}

/**
 * Returns the final-escape DC and the one-time preparation that produced it.
 * Primary tools always win over fallback tools, so a crowbar is never
 * accidentally made weaker by carrying the hex wrench as well.
 */
export function getFinalStepCheck(step, inventory, flags = {}, characterKey) {
  let dc = step.baseDc;
  let preparation = null;

  if (step.id === 'VENT') {
    if (hasItem(inventory, step.itemId)) {
      dc = step.preparedDc;
      preparation = step.itemId;
    } else if (hasItem(inventory, 'MASTER_KEYCARD') || flags.hasMasterKey) {
      dc = 11;
      preparation = 'MASTER_KEYCARD';
    }
  } else if (step.id === 'FRACTURE') {
    if (hasItem(inventory, 'CROWBAR')) {
      dc = step.preparedDc;
      preparation = 'CROWBAR';
    } else if (hasItem(inventory, 'HEX_WRENCH')) {
      dc = 13;
      preparation = 'HEX_WRENCH';
    } else if (hasFinalStepTool(step, inventory, characterKey)) {
      dc = step.preparedDc;
      preparation = step.substituteItemId;
    }

    if (flags.isVortexStopped) {
      dc -= 2;
      preparation = preparation
        ? `${preparation} + VORTEX_STOPPED`
        : 'VORTEX_STOPPED';
    }
  } else if (hasFinalStepTool(step, inventory, characterKey)) {
    dc = step.preparedDc;
    preparation = step.itemId;
  }

  return { dc: Math.max(8, dc), preparation };
}

export function getFinalEnding({ failures, inventory, flags = {}, characterKey }) {
  const preparedCount = FINAL_ESCAPE_STEPS.filter((step) =>
    getFinalStepCheck(step, inventory, flags, characterKey).preparation
  ).length;

  if (failures === 0 && preparedCount === 3) return 'TRUE';
  if (failures <= 1 && preparedCount >= 2) return 'GOOD';
  if (failures <= 2) return 'NORMAL';
  return 'BAD_4';
}

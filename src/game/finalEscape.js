export const FINAL_ESCAPE_STEPS = [
  {
    id: 'VENT',
    title: '1. 압력 배출구 개방',
    description: '돔 아래 비상 배출구를 열어 내부 수압을 낮춘다.',
    stat: 'INT',
    itemId: 'HEATING_TORCH',
    itemName: '가스 토치',
    baseDc: 14,
    preparedDc: 9,
    specialties: ['VET', 'SECURITY']
  },
  {
    id: 'FRACTURE',
    title: '2. 아크릴 지지대 파쇄',
    description: '압력이 빠진 틈에 빠루를 걸어 돔의 균열을 넓힌다.',
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
    title: '3. 분출수 속 지상 탈출',
    description: '무너지는 돔과 분출수 사이를 버티며 지상으로 빠져나간다.',
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

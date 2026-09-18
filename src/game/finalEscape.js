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

export function hasFinalStepTool(step, inventory, characterKey) {
  const hasPrimary = inventory.some((item) => item.id === step.itemId);

  if (hasPrimary) return true;

  const canUseSubstitute =
    step.substituteItemId &&
    step.substituteFor?.includes(characterKey) &&
    inventory.some((item) => item.id === step.substituteItemId);

  return Boolean(canUseSubstitute);
}

export function getFinalEnding({ failures, inventory, characterKey }) {
  const preparedCount = FINAL_ESCAPE_STEPS.filter((step) =>
    hasFinalStepTool(step, inventory, characterKey)
  ).length;

  if (failures === 0 && preparedCount === 3) return 'TRUE';
  if (failures <= 1 && preparedCount >= 2) return 'GOOD';
  if (failures <= 2) return 'NORMAL';
  return 'BAD_4';
}

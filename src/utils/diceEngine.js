export function calculateModifier(statValue) {
  return Math.floor((statValue - 10) / 2);
}

export function executeD20Check(statValue, dc, traitBonus = 0, random = Math.random) {
  const rawDice = Math.floor(random() * 20) + 1;
  const modifier = calculateModifier(statValue);
  const total = rawDice + modifier + traitBonus;
  const isNat20 = rawDice === 20;
  const isNat1 = rawDice === 1;
  return { rawDice, modifier, traitBonus, total, isNat20, isNat1, isSuccess: isNat20 || (!isNat1 && total >= dc) };
}

export function getSuccessProbability(statValue, dc, bonus = 0) {
  const needed = dc - calculateModifier(statValue) - bonus;
  return Math.min(95, Math.max(5, (21 - needed) * 5));
}

export const FATIGUE_ROLL_TABLE = (roll) => {
if (roll === 1) {
return {
title: '3일 연속 철야 (Natural 1)',
hp: 16, san: 12,
trait: '카페인 중독 (DEX -1)',
desc: '머리가 쪼개질 듯 아프다. 손끝이 미세하게 떨려 정밀 작업이 불안정하다.'
};
}
if (roll <= 7) {
return {
title: '수면 부족 / 극심한 피로',
hp: 18, san: 14,
trait: '피로 누적',
desc: '젖은 솜뭉치처럼 무거운 몸을 이끌고 막차 좌석에 엉덩이를 걸쳤다.'
};
}
if (roll <= 14) {
return {
title: '평범한 야근',
hp: 20, san: 15,
trait: '표준 컨디션',
desc: '늘 겪던 지루하고 뻔한 잔업이었다. 아직 정신줄은 또렷하다.'
};
}
if (roll <= 19) {
return {
title: '내일 연차 승인 완료!',
hp: 22, san: 15,
trait: '가벼운 발걸음 (회피/도주 DC -2)',
desc: '오후 5시에 올린 내일 연차 품의서가 최종 승인되었다. 발바닥이 가볍다.'
};
}
return {
title: '사직서 품에 품음 (Natural 20)',
hp: 20, san: 15,
trait: '잃을 게 없음 (공포 저항 자동 면제)',
desc: '코트 안주머니에 사직서 봉투를 찔러 넣었다. 부장 새끼보다 무서운 건 없다.'
};
};

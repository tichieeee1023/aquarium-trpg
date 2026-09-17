import { ITEM_DB } from './itemDB.js';
import { CHARACTER_PORTRAITS } from './assetDB.js';

export const ARCHETYPES = [
{
id: 'ENGINEER',
portraits: CHARACTER_PORTRAITS.ENGINEER,
title: '분석형 엔지니어',
quote: '"에러가 났으면 브레이크포인트부터 찍어야지. 논리적 취약점은 반드시 있다."',
stats: { STR: 10, DEX: 10, INT: 14, WILL: 10, LUK: 10 },
items: [
{ ...ITEM_DB.laptop_bag },
{ ...ITEM_DB.glasses }
]
},
{
id: 'GYM',
portraits: CHARACTER_PORTRAITS.GYM,
title: '생존형 헬스인',
quote: '"야근 4일 차? 스쿼트 100개 치던 근성이면 주먹질로도 길은 뚫린다."',
stats: { STR: 14, DEX: 10, INT: 10, WILL: 10, LUK: 10 },
items: [
{ ...ITEM_DB.tumbler },
{ ...ITEM_DB.protein_bar }
]
},
{
id: 'RUNNER',
portraits: CHARACTER_PORTRAITS.RUNNER,
title: '칼퇴 지향 회피러',
quote: '"팀장 눈치 10단, 칼퇴 동선 9단. 위험한 자리에 내가 있을 이유는 없다."',
stats: { STR: 10, DEX: 14, INT: 10, WILL: 10, LUK: 10 },
items: [
{ ...ITEM_DB.id_wire },
{ ...ITEM_DB.running_shoes }
]
},
{
id: 'NEGOTIATOR',
portraits: CHARACTER_PORTRAITS.NEGOTIATOR,
title: '강철 멘탈 협상가',
quote: '"월급 250에 영혼을 갈아 넣었다. 인간 귀신보다 내일 부장 얼굴이 더 무섭다."',
stats: { STR: 10, DEX: 10, INT: 10, WILL: 14, LUK: 10 },
items: [
{ ...ITEM_DB.candy },
{ ...ITEM_DB.metal_pen }
]
},
{
id: 'GAMBLER',
portraits: CHARACTER_PORTRAITS.GAMBLER,
title: '한탕주의 방관자',
quote: '"스피또 1등만 당첨되면 이딴 지하철이고 회사고 다 불사르고 해외 뜬다."',
stats: { STR: 10, DEX: 10, INT: 10, WILL: 10, LUK: 14 },
items: [
{ ...ITEM_DB.lottery },
{ ...ITEM_DB.lucky_coin }
]
}
];

const JOBS = {
  AQUARIST: {
    key: 'AQUARIST',
    title: '대형 어류 아쿠아리스트',
    desc: '야행성 상어 수조 야간 피딩 잔업. 물리 완력 판정 보너스.',
    baseStats: { STR: 14, DEX: 10, INT: 10, WILL: 10, LUK: 10 },
    startItems: ['TONGS', 'RUBBER_BOOTS'],
    traitDesc: '괴력의 완력 (모든 물리 파괴 STR 판정 +2 보정)',
    imgM: '/assets/characters/char_aquarist_m.png',
    imgF: '/assets/characters/char_aquarist_f.png'
  },
  DIVER: {
    key: 'DIVER',
    title: '시설 관리 다이버',
    desc: '아크릴 수조 야간 청소. 방호 수트와 수중 생존 순발력 특화.',
    baseStats: { STR: 10, DEX: 14, INT: 10, WILL: 10, LUK: 10 },
    startItems: ['LINE_CUTTER', 'WETSUIT'],
    traitDesc: '잠수사의 침착함 (Stage 1 누전 시 감전 회피 DEX 판정 기회)',
    imgM: '/assets/characters/char_diver_m.png',
    imgF: '/assets/characters/char_diver_f.png'
  },
  VET: {
    key: 'VET',
    title: '수생 임상 수의사',
    desc: '격리 표본 바이탈 체크 및 야간 투약. 기계 분석과 공포 저항 특화.',
    baseStats: { STR: 10, DEX: 10, INT: 14, WILL: 10, LUK: 10 },
    startItems: ['PENLIGHT', 'SEDATIVE'],
    traitDesc: '병리적 침착 (공포 피해 2 감소, 냉동기 제어반 DC 완화)',
    imgM: '/assets/characters/char_vet_m.png',
    imgF: '/assets/characters/char_vet_f.png'
  },
  SECURITY: {
    key: 'SECURITY',
    title: '종합 방재 보안요원',
    desc: '폐장 후 전 구역 락다운 순찰. 시설 지형 파악 및 방재 오버라이드.',
    baseStats: { STR: 10, DEX: 10, INT: 10, WILL: 14, LUK: 10 },
    startItems: ['KEY_TAG', 'LANTERN'],
    traitDesc: '방재 매뉴얼 숙지 (기계 판정 INT +2, 방재함 해제 DC 완화)',
    imgM: '/assets/characters/char_security_m.png',
    imgF: '/assets/characters/char_security_f.png'
  }
};

const ITEM_DB = {
  TONGS: { id: 'TONGS', img: '/assets/items/item_gear_tongs.webp', name: '스테인리스 먹이 집게', icon: '🥢', desc: '둔기 겸용 묵직한 집게' },
  RUBBER_BOOTS: { id: 'RUBBER_BOOTS', img: '/assets/items/item_tool_boots.webp', name: '방수 절연 장화', icon: '👢', desc: '고압 누전 감전을 차단하는 고무 장화' },
  LINE_CUTTER: { id: 'LINE_CUTTER', img: '/assets/items/item_tool_cutter.webp', name: '안전 라인 커터', icon: '🔪', desc: '엉킨 로프와 전선을 자르는 절단구' },
  WETSUIT: { id: 'WETSUIT', img: '/assets/items/item_gear_wetsuit.webp', name: '네오프렌 다이빙 슈트', icon: '🤿', desc: '단열 및 비상 절연 방호 슈트' },
  PENLIGHT: { id: 'PENLIGHT', img: '/assets/items/item_gear_penlight.webp', name: '의료용 방수 펜라이트', icon: '🔦', desc: '정밀 회로 분석용 광원' },
  SEDATIVE: { id: 'SEDATIVE', img: '/assets/items/item_tool_sedative.webp', name: '진정제 주사 앰플', icon: '💉', desc: '사용 시 SAN +8 회복', consumable: true },
  KEY_TAG: { id: 'KEY_TAG', img: '/assets/items/item_gear_keytag.webp', name: '마스터 보안 키 태그', icon: '🏷️', desc: '방재함 전자기 락 해제 태그' },
  LANTERN: { id: 'LANTERN', img: '/assets/items/item_tool_lantern.webp', name: '충전식 헤드랜턴', icon: '💡', desc: '시야 확보용 고휘도 랜턴' },
  CROWBAR: { id: 'CROWBAR', img: '/assets/items/item_tool_crowbar.webp', name: '단조 빠루', icon: '⛏️', desc: '수밀문 저지 및 돔 파쇄 핵심 도구' },
  HEATING_TORCH: { id: 'HEATING_TORCH', img: '/assets/items/item_tool_torch.webp', name: '공업용 가스 토치', icon: '🔥', desc: '급열 충격 및 결빙 해빙용 초고온 토치' },
  COLD_VEST: { id: 'COLD_VEST', img: '/assets/items/item_gear_cold_vest.webp', name: '누빔 방한 조끼', icon: '🦺', desc: '영하 35도 한기 저항 조끼' },
  HEX_WRENCH: { id: 'HEX_WRENCH', img: '/assets/items/item_tool_hex_wrench.webp', name: '육각 렌치', icon: '🔧', desc: '단단한 쇠붙이 볼트 렌치' },
  MASTER_KEYCARD: { id: 'MASTER_KEYCARD', img: '/assets/items/item_key_master.webp', name: '점검탑 마스터 키카드', icon: '💳', desc: '최상층 탈출구 락 해제 카드' },
  OXYGEN_MASK: { id: 'OXYGEN_MASK', img: '/assets/items/item_tool_mask.webp', name: '휴대 산소마스크', icon: '😷', desc: '분출 급류 속에서 기도를 보호하는 마스크' }
};

// 확정된 9장의 실제 이미지 에셋 매핑
const SCENARIOS = {
  STAGE_1_JELLYFISH: {
  title: 'STAGE 1 : 23:50 — 몽환의 해파리 터널',

  sub: `수천 마리의 보름달물해파리가 에메랄드빛으로 터널을 채우고 있었다.
환상적인 풍경 아래, 얕게 고인 물 너머로 희미한 배선 타는 냄새가 번졌다.`,

  bg: '/assets/scenes/scene_stage1_jellyfish.png',

  crisis: {
    title: '23:53 — 누전 폭발',
    tag: '위기 발생',
    body: `지지지직— 콰앙!

천장 트레이가 찢어지며 끊어진 고압 케이블이 바닥의 얕은 물 위로 떨어졌다.
푸른 스파크가 물 표면을 집어삼키며 터널 전체로 번져 나갔다.`,
    image: '/assets/scenes/scene_stage1_blackout_shock.png'
  },

  waterLevel: 5,

  points: [
    {
      id: 'c1_1',
      name: '대형 아치형 유리벽',
      desc: '수천 마리의 보름달물해파리가 유영하는 메인 관람창.',
      sanReward: 1,
      log: `푸른빛에 홀려 잠시 해파리의 군무를 바라봤다.
마음은 조금 편해졌지만, 시간만 흘렀다. (SAN +1)`
    },

    {
      id: 'c1_2',
      name: '체험존 세면대 수납장',
      desc: '청소 도구가 들어 있는 세면대 아래 수납장.',
      reward: 'RUBBER_BOOTS',
      flag: 'hasRubberBoots',
      log: `세제통 구석에서 두꺼운 방수 절연 장화를 발견했다.
이 정도면 바닥의 전류를 버틸 수 있을지도 모른다.`
    },

    {
      id: 'c1_3',
      name: '안내 데스크 분전반',
      desc: '미세하게 깜빡이는 조명 아래 설치된 배전함.',
      flag: 'warnedElectricWire',
      log: `메인 트랜스가 시뻘겋게 달아올라 피복이 눌어붙어 있다.
케이블이 끊어져 물에 닿는 순간, 이 통로는 감전 지대가 된다.`
    },

    {
      id: 'c1_4',
      name: '관람객 분실물 바구니',
      desc: '에코백과 우산, 잡동사니가 뒤섞인 분실물 바구니.',
      hpCost: 2,
      log: `잡동사니를 뒤지다 깨진 유리 파편에 손바닥을 베였다.
생각보다 상처가 깊다. (HP -2)`
    },

    {
      id: 'c1_5',
      name: '비상구 유도등 기둥',
      desc: '유도등 아래 비상문 유압 밸브가 보인다.',
      checkStat: 'STR',
      dc: 11,
      failDmg: 1,
      flag: 'isGateUnlocked',

      successLog: `녹슨 밸브를 온몸으로 비틀자 비상문 잠금장치가 풀렸다.
위급할 때 바로 빠져나갈 수 있는 길을 확보했다.`,

      failLog: `밸브는 꿈쩍도 하지 않았고 손바닥만 거칠게 까졌다.
문은 여전히 잠겨 있다. (HP -1)`
    },

    {
      id: 'c1_6',
      name: '직원 전용 보관함 선반',
      desc: '직원용 다이빙 장비와 비상 공구가 놓인 선반.',
      reward: 'LINE_CUTTER',
      log: `상자 안에서 다이빙용 안전 라인 커터를 확보했다.
절단이 필요한 상황에서는 확실히 쓸모가 있어 보인다.`
    }
  ]
},
 STAGE_2_BULKHEAD: {
  title: 'STAGE 2 : 00:00 — 중앙 수밀 격벽 통로',

  sub: `폭발의 충격 직후, 해수 배관이 파열되며 거대한 물줄기가 통로를 집어삼켰다.
무릎을 넘긴 물 너머로 40cm 강철 수밀문이 굉음을 내며 내려오기 시작한다.`,

  bg: '/assets/scenes/scene_stage2_bulkhead.png',
  closingBg: '/assets/scenes/scene_stage2_bulkhead_closing.png',
  waterLevel: 25,

  points: [
    {
      id: 'c2_1',
      name: '폭포수 아래 정비 카트',
      desc: '쏟아지는 물벼락 아래 뒤집힌 철제 정비 카트.',
      reward: 'CROWBAR',
      flag: 'hasCrowbar',
      log: `물살에 쓸려가기 직전, 카트 아래에서 묵직한 단조 빠루를 건져 올렸다.
수밀문을 버틸 수 있는 유일한 지렛대가 될지도 모른다.`
    },

    {
      id: 'c2_2',
      name: '벽면 노란색 유압 밸브',
      desc: '배관 옆에 돌출된 대형 수동 유압 밸브.',
      checkStat: 'STR',
      dc: 12,
      failDmg: 3,
      flag: 'isPressureReduced',

      successLog: `악착같이 밸브를 돌리자 배관의 분출 압력이 눈에 띄게 줄었다.
거센 물살이 조금 약해지며 통로를 움직일 틈이 생겼다.`,

      failLog: `밸브가 꿈쩍도 하지 않았고, 밀려든 물살에 벽으로 처박혔다.
등을 세게 부딪쳤다. (HP -3)`
    },

    {
      id: 'c2_3',
      name: '비상 방재 사물함',
      desc: '물속에 반쯤 잠긴 주황색 방재 캐비닛.',
      reward: 'LANTERN',
      flag: 'hasLantern',
      log: `캐비닛 안 방수팩에서 충전식 방수 헤드랜턴을 꺼냈다.
정전된 구역을 통과할 때 유용할 것 같다.`
    },

    {
      id: 'c2_4',
      name: '배수 그릴 위 유실물',
      desc: '강한 흡입 수류가 몰리는 바닥 배수 격자.',
      hpCost: 3,
      sanCost: 2,
      log: `가방을 건지려다 발이 미끄러져 다리가 철망 쪽으로 빨려 들어갔다.
정강이를 세게 찧고 가까스로 빠져나왔다. (HP -3, SAN -2)`
    },

    {
      id: 'c2_5',
      name: '천장 케이블 트레이',
      desc: '천장 가장자리를 따라 이어진 금속 덕트와 전선 뭉치.',
      log: `배선 틈에서 질긴 고장력 케이블 타이 묶음을 발견했다.
단단히 고정해야 할 상황에는 쓸 수 있을 것 같다.`
    },

    {
      id: 'c2_6',
      name: '닫혀가는 수밀문 하단 틈',
      desc: '바닥을 향해 내려앉는 강철 수밀문 아래 남은 좁은 틈.',
      log: `남은 간격은 20cm 남짓. 맨몸으로 통과하기에는 너무 위험하다.
빠루로 받치거나, 물살을 줄여 틈을 노리는 수밖에 없다.`
    }
  ]
},
  STAGE_3_FREEZER: {
  title: 'STAGE 3 : 00:10 — 사료 조리실 & 급속 냉동고',

  sub: `방열문이 닫히자 영하 35도의 백색 냉풍이 젖은 몸을 덮쳤다.
래치는 순식간에 얼어붙었고, 이 문을 녹이지 못하면 여기서 끝이다.`,

  bg: '/assets/scenes/scene_stage3_freezer.png',
  waterLevel: 0,

  points: [
    {
      id: 'c3_1',
      name: '사료 해동 작업대',
      desc: '온수 배관이 달린 스테인리스 싱크대 하부장.',
      reward: 'HEATING_TORCH',
      flag: 'hasHeatingTorch',
      log: `하부장에서 공업용 가스 토치를 찾아냈다.
얼어붙은 문을 녹이는 데 가장 확실한 방법이다.`
    },

    {
      id: 'c3_2',
      name: '방한복 건조 랙',
      desc: '두꺼운 작업복과 방한 장비가 걸린 건조 선반.',
      reward: 'COLD_VEST',
      flag: 'hasColdVest',
      log: `선반 구석에서 누빔 방한 조끼를 꺼내 껴입었다.
칼바람 같은 한기가 조금은 가라앉았다.`
    },

    {
      id: 'c3_3',
      name: '백색 냉기 토출구',
      desc: '영하 35도 냉풍을 뿜어내는 칠러 송풍 덕트.',
      checkStat: 'INT',
      dc: 12,
      failDmg: 3,
      flag: 'isChillerOff',

      successLog: `칠러 제어반의 바이패스 회로를 끊자 냉각팬이 멈췄다.
쏟아지던 백색 냉풍이 서서히 가라앉는다.`,

      failLog: `성에 낀 배선을 건드리는 순간 손가락이 얼어붙었다.
동상 열상이 번졌다. (HP -3)`
    },

    {
      id: 'c3_4',
      name: '포장용 롤 밴딩기',
      desc: '먹이 상자를 묶는 포장 작업대와 금속 서랍.',
      reward: 'HEX_WRENCH',
      log: `얼어붙은 서랍을 걷어차 열고 묵직한 육각 렌치를 꺼냈다.
둔기로 쓰기에도 충분히 무거워 보인다.`
    },

    {
      id: 'c3_5',
      name: '비닐 천이 덮인 카트',
      desc: '파란 방수포가 덮인 사람 크기의 얼어붙은 덩어리.',
      sanCost: 4,
      log: `방수포를 걷자 얼음 속에 사람 형상의 사체가 뒤틀려 있었다.
차가운 공기보다 먼저 등골이 얼어붙었다. (SAN -4)`
    },

    {
      id: 'c3_6',
      name: '탈출용 비상 도어 래치',
      desc: '두꺼운 얼음막에 완전히 파묻힌 방열문 손잡이.',
      log: `래치 틈새가 두꺼운 얼음으로 완전히 봉인돼 있다.
불로 녹이거나 냉각을 멈춘 뒤 강제로 부수는 수밖에 없다.`
    }
  ]
},
  STAGE_4_PUMP: {
  title: 'STAGE 4 : 00:20 — 고압 배수 기계실 & 증기 복도',

  sub: `허리까지 차오른 해수와 뜨거운 증기 사이로 거대한 배수 펌프가 굉음을 토해냈다.
붉은 경고등 아래, 00:30 해수 방류 프로토콜까지 남은 시간은 10분.`,

  bg: '/assets/scenes/scene_stage4_pump.png',
  vortexBg: '/assets/scenes/scene_stage4_vortex_whirlpool.png',
  waterLevel: 75,

  points: [
    {
      id: 'c4_1',
      name: '중앙 전력 제어반',
      desc: '물속에 반쯤 잠긴 제어 콘솔과 방수 팩.',
      reward: 'MASTER_KEYCARD',
      flag: 'hasMasterKey',
      log: `제어반 틈새에서 방수 팩에 밀봉된 마스터 전자 키카드를 꺼냈다.
지상 점검탑으로 이어지는 마지막 잠금장치를 열 수 있을 것 같다.`
    },

    {
      id: 'c4_2',
      name: '고압 증기 바이패스 밸브',
      desc: '고온의 백색 스팀을 뿜어내는 과열 배관.',
      hpCost: 4,
      sanCost: 3,
      log: `밸브를 건드린 순간 고온의 증기가 어깨를 강타했다.
살갗이 데이며 지독한 통증이 번졌다. (HP -4, SAN -3)`
    },

    {
      id: 'c4_3',
      name: '바닥 거대 흡입 그릴',
      desc: '해수를 미친 듯이 빨아들이는 거대한 배수 격자.',
      checkStat: 'STR',
      dc: 13,
      failDmg: 7,

      successLog: `소용돌이에 휘말리기 직전 난간을 붙잡고 가까스로 버텼다.
거센 흡입 수류에서 몸을 빼냈다.`,

      failLog: `하반신이 격자 쪽으로 빨려 들어가며 다리를 거칠게 부딪쳤다.
뼈가 울릴 만큼 강한 충격이었다. (HP -7)`
    },

    {
      id: 'c4_4',
      name: '방재 장비 보관함',
      desc: '주황색 방화 아크릴로 잠긴 비상 장비함.',
      checkStat: 'DEX',
      dc: 12,
      reward: 'OXYGEN_MASK',
      flag: 'hasOxygenMask',

      successLog: `잠금장치를 풀고 비상용 산소마스크를 꺼냈다.
물이 턱까지 차올라도 잠시 숨을 확보할 수 있다.`,

      failLog: `잠금장치가 뻑뻑하게 걸려 끝내 열리지 않았다.
시간만 흘러갔다.`
    },

    {
      id: 'c4_5',
      name: '수면 위 배선 트레이',
      desc: '물 위로 처진 전선 뭉치에서 푸른 불꽃이 튄다.',
      hpCost: 5,
      log: `전선 뭉치를 피하려는 순간 튀어 오른 불꽃에 감전됐다.
충격에 몸이 튕겨 나갔다. (HP -5)`
    },

    {
      id: 'c4_6',
      name: '메인 펌프 비상 제동 레버',
      desc: '과열된 펌프 모터를 차단하는 비상 제어 스위치.',
      checkStat: 'INT',
      dc: 12,
      failDmg: 2,
      flag: 'isVortexStopped',

      successLog: `차단 배선을 파악해 비상 스위치를 내리자 펌프 모터가 멎었다.
바닥을 뒤틀던 거대한 소용돌이가 서서히 가라앉는다.`,

      failLog: `잘못 건드린 배선에서 합선 스파크가 튀었다.
손등에 화상이 번졌다. (HP -2)`
    }
  ]
},
  STAGE_5_DOME: {
    title: 'STAGE 5 : 00:28 — 중앙 채광 아트리움 돔',
    sub: '머리 위 1미터, 5cm 두께의 채광 아크릴 돔이 보였다. 00:30 수장 프로토콜까지 남은 시간은 2분. 천장을 깨야 한다.',
    bg: '/assets/scenes/scene_stage5_dome.png',
    breakBg: '/assets/scenes/scene_stage5_dome_cracking.png', // 파쇄 균열 씬
    waterLevel: 95
  }
};

const ENDINGS = {
  BAD_1: {
    type: 'BAD_1',
    badge: '💀 BAD END 1',
    title: '푸른 심해의 유폐 (Jellyfish Shock)',
    desc: '천장 케이블이 끊어지며 발목 높이의 물 위로 수만 볼트의 고압 전류가 번개처럼 번졌다. 절연 장구가 없던 내 심장은 그 자리에서 멎었고, 갈라진 유리벽 너머의 푸른 독 촉수들이 쓰러진 내 몸을 덮쳤다.'
  },
  BAD_2: {
    type: 'BAD_2',
    badge: '💀 BAD END 2',
    title: '수심 0미터의 마지막 1인치 (The Last Inch of Air)',
    desc: '40센티미터 두께의 강철 수밀 격벽이 바닥에 완벽히 맞물리며 내려앉았다. 천장의 파열구에서 쏟아지는 바닷물이 순식간에 목과 턱 끝을 덮쳤다. 천장 모서리에 고인 손바닥만 한 공기층마저 사라지고, 폐가 타들어 가는 어둠 속에서 마지막 기포가 흩어졌다.'
  },
  BAD_3: {
    type: 'BAD_3',
    badge: '💀 BAD END 3',
    title: '영하 35도의 동사 (Frozen Specimen)',
    desc: '두꺼운 빙판 속에 굳어버린 철제 손잡이는 꿈쩍도 하지 않았다. 젖은 옷이 피부에 들러붙고 손가락 감각이 나무토막처럼 굳어 갔다. 차가운 서리가 온몸을 덮고, 나는 아쿠아리움의 또 다른 냉동 표본이 되었다.'
  },
  BAD_4: {
    type: 'BAD_4',
    badge: '💀 BAD END 4',
    title: '00:30 — 영구 수장 (Purge)',
    desc: '파쇄 충격의 반동으로 어깨가 탈구되며 의식을 잃었다. 기계음과 함께 00:30 수장 프로토콜이 가동되고, 지상의 가로등 불빛을 눈앞에 둔 채 천장 끝까지 해수가 차올랐다.'
  },
  NORMAL: {
    type: 'NORMAL',
    badge: '⚠️ NORMAL END',
    title: '간신히 건져 올린 목숨',
    desc: '온몸으로 아크릴을 들이받아 겨우 균열을 뚫었다. 쏟아지는 유리 파편을 맨몸으로 받아 내며 광장 분수대 바닥으로 내동댕이쳐졌다. 다가오는 구급차 사이렌 소리 속에서, 평생 물을 두려워하게 될 공포를 안고 살아남았다.'
  },
  GOOD: {
    type: 'GOOD',
    badge: '🌿 GOOD END',
    title: '생채기와 안도의 숨',
    desc: '부족한 장비 속에서도 완력으로 유리를 깨뜨렸다. 물살에 휩쓸려 광장 보도블록 위로 굴러떨어졌고, 팔다리에 찰과상을 입었지만 두 발은 지상을 딛고 있었다. 가로등 아래 주저앉아 거친 숨을 몰아쉬었다.'
  },
  TRUE: {
    type: 'TRUE',
    badge: '✨ TRUE END',
    title: '새벽 00:35, 빗속의 생환',
    desc: '가스 토치로 달군 유리에 빠루를 쐐기처럼 박아 넣자, 굉음과 함께 돔 천장이 산산조각 났다. 산소마스크를 문 채 수만 톤의 분출 급류를 타고 지상 야외 공원 잔디밭 위로 튕겨 나왔다. 뺨 위로 시원한 밤비가 쏟아졌다. 무전기를 쥐고, 살아남았다는 사실을 조용히 알렸다.'
  }
};

// =================================================================
// 3. FSM 게임 상태 및 리듀서
// =================================================================
const initialGameState = {
  phase: 'STAGE_0_SETUP', // STAGE_0_SETUP | STAGE_0_DICE | STAGE_1~5 | ENDING
  gender: 'M',
  character: null,
  ap: 3,
  waterLevel: 5,
  inventory: [],
  examined: [],
  currentBg: '/assets/scenes/scene_title_aquarium.png',
  flags: {
    hasRubberBoots: false,
    warnedElectricWire: false,
    isGateUnlocked: false,
    hasCrowbar: false,
    isPressureReduced: false,
    hasLantern: false,
    hasHeatingTorch: false,
    isChillerOff: false,
    hasColdVest: false,
    hasMasterKey: false,
    hasOxygenMask: false,
    isVortexStopped: false
  },
  diceModal: {
    isOpen: false,
    title: '',
    stat: 'STR',
    dc: 10,
    bonus: 0,
    roll: null,
    total: null,
    isSuccess: false,
    isCrit: false,
    onSuccess: null,
    onFail: null
  },
  ending: null,
  logs: ['23:45. 아쿠아리움 지하 통로 쪽에서 희미한 침수 경보가 울렸다.']
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CHARACTER': {
      const jobData = JOBS[action.payload.key];
      const startItems = jobData.startItems.map(k => ITEM_DB[k]);
      return {
        ...state,
        gender: action.payload.gender,
        character: {
          ...jobData,
          hp: 20, maxHp: 20,
          san: 30, maxSan: 30,
          stats: { ...jobData.baseStats },
          condition: '당직 대기'
        },
        inventory: [...startItems],
        flags: {
          ...state.flags,
          hasRubberBoots: startItems.some(i => i.id === 'RUBBER_BOOTS'),
          hasLantern: startItems.some(i => i.id === 'LANTERN')
        },
        phase: 'STAGE_0_DICE',
        currentBg: '/assets/scenes/scene_title_aquarium.png',
        logs: [`${jobData.title} (${action.payload.gender === 'M' ? '남성' : '여성'}) 사원증을 등록했다.`]
      };
    }

    case 'RESOLVE_CONDITION': {
      const roll = action.payload;
      let hpMod = 0; let sanMod = 0;
      let condText = '표준 당직 컨디션';
      if (roll === 1) {
        hpMod = -4; sanMod = -6; condText = '교대자 펑크 (극심한 피로 [DEX -1])';
      } else if (roll <= 7) {
        hpMod = -2; sanMod = -2; condText = '수면 부족 (피로 누적)';
      } else if (roll >= 15 && roll < 20) {
        hpMod = 2; sanMod = 2; condText = '내일 비번 확정 (가벼운 발걸음)';
      } else if (roll === 20) {
        sanMod = 10; condText = '이직 확정자의 마지막 출근 (잃을 게 없음)';
      }

      return {
        ...state,
        character: {
          ...state.character,
          hp: state.character.hp + hpMod,
          maxHp: Math.max(state.character.maxHp, state.character.hp + hpMod),
          san: state.character.san + sanMod,
          maxSan: Math.max(state.character.maxSan, state.character.san + sanMod),
          stats: { ...state.character.stats, DEX: state.character.stats.DEX - (roll === 1 ? 1 : 0) },
          condition: condText
        },
        phase: 'STAGE_1_JELLYFISH',
        currentBg: SCENARIOS.STAGE_1_JELLYFISH.bg,
        waterLevel: SCENARIOS.STAGE_1_JELLYFISH.waterLevel,
        ap: 3,
        logs: [
          ...state.logs,
          `컨디션 주사위 [${roll}] ➔ "${condText}"이 되었다.`,
          '푸른 해파리 터널 바닥에 물이 차오르기 시작했다.'
        ]
      };
    }

    case 'APPLY_DAMAGE': {
  const damage = action.payload.amount || 0;
  const nextHp = Math.max(0, state.character.hp - damage);

  return {
    ...state,
    character: {
      ...state.character,
      hp: nextHp
    },
    logs: [
      action.payload.log || `[피해] HP -${damage}`,
      ...state.logs
    ]
  };
}

    case 'APPLY_NONLETHAL_DAMAGE': {
  const damage = action.payload.amount || 0;
  const nextHp = Math.max(1, state.character.hp - damage);

  return {
    ...state,
    character: {
      ...state.character,
      hp: nextHp
    },
    logs: [
      action.payload.log || `[강행 돌파] HP -${damage}`,
      ...state.logs
    ]
  };
}

    case 'USE_ITEM': {
      const item = ITEM_DB[action.payload];
      if (!item || !item.consumable || !state.inventory.some(i => i.id === item.id) || state.phase === 'ENDING' || state.diceModal.isOpen) return state;
      let sanAdd = 0;
      if (item.id === 'SEDATIVE') sanAdd = 8;
      return {
        ...state,
        character: {
          ...state.character,
          san: Math.min(state.character.maxSan, state.character.san + sanAdd)
        },
        inventory: state.inventory.filter(i => i.id !== item.id),
        logs: [`[아이템 사용] ${item.name}을 사용했다. (SAN +${sanAdd})`, ...state.logs]
      };
    }

    case 'EXAMINE_POINT': {
      const { point, rewardItem, flagKey, sanCost, hpCost, sanReward } = action.payload;
      if (!SCENARIOS[state.phase]?.points?.some(p => p.id === point.id) || state.ap <= 0 || state.examined.includes(point.id)) return state;
      const nextInv = [...state.inventory];
      if (rewardItem && !nextInv.some(i => i.id === rewardItem.id) && nextInv.length < 5) {
        nextInv.push(rewardItem);
      }
      const nextFlags = { ...state.flags };
      const bagFull = rewardItem && !nextInv.some(i => i.id === rewardItem.id);
      if (flagKey && !bagFull) nextFlags[flagKey] = true;

      const nextSan = Math.max(0, Math.min(state.character.maxSan, state.character.san - Math.max(0, (sanCost || 0) - (state.character.key === 'VET' ? 2 : 0)) + (sanReward || 0)));
      const nextHp = Math.max(0, state.character.hp - (hpCost || 0));
      const nextAp = state.ap - 1;

      // 씬 동적 변화 (Stage 4 흡입구 조사 시 와류 씬)
      let nextBg = state.currentBg;
      if (point.id === 'c4_3') nextBg = SCENARIOS.STAGE_4_PUMP.vortexBg;

      return {
        ...state,
        phase: nextHp === 0 || nextSan === 0 ? 'ENDING' : state.phase,
        ending: nextHp === 0 || nextSan === 0 ? { ...ENDINGS.BAD_4, title: nextHp === 0 ? '침수 속에서 꺼진 생명' : '심해에 삼켜진 정신', desc: '누적된 피해가 겹치자 더는 탈출을 이어갈 수 없었다.' } : state.ending,
        ap: nextAp,
        inventory: nextInv,
        flags: nextFlags,
        currentBg: nextBg,
        character: { ...state.character, san: nextSan, hp: nextHp },
        examined: [...state.examined, point.id],
        logs: [`[수색] "${point.name}" (잔여 AP: ${nextAp}) ${action.payload.outcome || point.log || "조사를 마쳤다."}${bagFull ? " — 가방이 가득 차 장비를 챙기지 못했다." : ""}`, ...state.logs]
      };
    }

    case 'DISCARD_ITEM': {
      if (state.diceModal.isOpen || state.phase === 'ENDING') return state;
      const item = state.inventory.find(i => i.id === action.payload);
      if (!item) return state;
      const keys = { RUBBER_BOOTS: 'hasRubberBoots', CROWBAR: 'hasCrowbar', LANTERN: 'hasLantern', HEATING_TORCH: 'hasHeatingTorch', COLD_VEST: 'hasColdVest', MASTER_KEYCARD: 'hasMasterKey', OXYGEN_MASK: 'hasOxygenMask' };
      return { ...state, inventory: state.inventory.filter(i => i.id !== item.id), flags: { ...state.flags, ...(keys[item.id] ? { [keys[item.id]]: false } : {}) }, logs: [`[정리] ${item.name}을 내려놓았다.`, ...state.logs] };
    }
    case 'SET_BG': {
      return { ...state, currentBg: action.payload };
    }
    case 'GO_TO_STAGE': {
  const nextPhase = action.payload;
  const nextScenario = SCENARIOS[nextPhase];

  if (!nextScenario) return state;

  return {
    ...state,
    phase: nextPhase,
    currentBg: nextScenario.bg,
    waterLevel: nextScenario.waterLevel,
    ap: 3,
    examined: [],
    logs: [
      `─── 다음 구역 [${nextScenario.title.split(' : ')[1]}]에 들어섰다. ───`,
      ...state.logs
    ]
  };
}
    case 'ADVANCE_STAGE': {
      const nextMap = {
        STAGE_1_JELLYFISH: 'STAGE_2_BULKHEAD',
        STAGE_2_BULKHEAD: 'STAGE_3_FREEZER',
        STAGE_3_FREEZER: 'STAGE_4_PUMP',
        STAGE_4_PUMP: 'STAGE_5_DOME'
      };
      const nextPhase = nextMap[state.phase];
      const nextScenario = SCENARIOS[nextPhase];
      return {
        ...state,
        phase: nextPhase,
        currentBg: nextScenario.bg,
        waterLevel: nextScenario.waterLevel,
        ap: 3,
        examined: [],
        logs: [`─── 다음 구역 [${nextScenario.title.split(' : ')[1]}]에 들어섰다. ───`, ...state.logs]
      };
    }

    case 'TRIGGER_ENDING': {
      return {
        ...state,
        phase: 'ENDING',
        ending: ENDINGS[action.payload],
        currentBg: `/assets/endings/card_ending_${action.payload.toLowerCase().replace('_', '')}.png`
      };
    }

    case 'OPEN_DICE': {
      return {
        ...state,
        diceModal: {
          isOpen: true,
          title: action.payload.title,
          stat: action.payload.stat,
          dc: action.payload.dc,
          bonus: action.payload.bonus || 0,
          roll: null,
          total: null,
          isSuccess: false,
          isCrit: false,
          onSuccess: action.payload.onSuccess,
          onFail: action.payload.onFail
        }
      };
    }

    case 'ROLL_DICE_RESULT': {
      return {
        ...state,
        diceModal: {
          ...state.diceModal,
          roll: action.payload.roll,
          total: action.payload.total,
          isSuccess: action.payload.isSuccess,
          isCrit: action.payload.isCrit
        }
      };
    }

    case 'CLOSE_DICE': {
      return {
        ...state,
        diceModal: { ...state.diceModal, isOpen: false }
      };
    }

    case 'RESTART_GAME':
      return { ...initialGameState };

    default:
      return state;
  }
}


export { JOBS, ITEM_DB, SCENARIOS, ENDINGS, initialGameState, gameReducer };

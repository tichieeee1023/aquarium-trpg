export const SCENARIOS = {
  STAGE_1_JELLYFISH: {
  title: 'STAGE 1 : 23:50 — 몽환의 해파리 터널',

  sub: `수천 마리의 보름달물해파리가 에메랄드빛으로 터널을 채우고 있었다.
환상적인 풍경 아래, 얕게 고인 물 너머로 희미한 배선 타는 냄새가 번졌다.`,

  bg: '/assets/scenes/scene_stage1_jellyfish.webp',

  crisis: {
    title: '23:53 — 누전 폭발',
    tag: '위기 발생',
    body: `지지지직— 콰앙!

천장 트레이가 찢어지며 끊어진 고압 케이블이 바닥의 얕은 물 위로 떨어졌다.
푸른 스파크가 물 표면을 집어삼키며 터널 전체로 번져 나갔다.`,
    image: '/assets/scenes/scene_stage1_blackout_shock.webp'
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

  bg: '/assets/scenes/scene_stage2_bulkhead.webp',
  closingBg: '/assets/scenes/scene_stage2_bulkhead_closing.webp',
  waterLevel: 25,

  points: [
    {
      id: 'c2_1',
      name: '폭포수 아래 정비 카트',
      desc: '쏟아지는 물벼락 아래 뒤집힌 철제 정비 카트.',
      reward: 'CROWBAR',
      flag: 'hasCrowbar',
      log: `물살에 쓸려가기 직전, 카트 아래에서 묵직한 단조 빠루를 건져 올렸다.
수밀문을 버티는 건 물론, 두꺼운 아크릴 틈을 벌리는 데도 쓸 수 있을 것 같다.`
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

  bg: '/assets/scenes/scene_stage3_freezer.webp',
  waterLevel: 0,

  points: [
    {
      id: 'c3_1',
      name: '사료 해동 작업대',
      desc: '온수 배관이 달린 스테인리스 싱크대 하부장.',
      reward: 'HEATING_TORCH',
      flag: 'hasHeatingTorch',
      log: `하부장에서 공업용 가스 토치를 찾아냈다.
결빙을 녹일 수 있고, 두꺼운 아크릴에 급격한 열충격을 줄 때도 쓸 수 있을 것 같다.`
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

  bg: '/assets/scenes/scene_stage4_pump.webp',
  vortexBg: '/assets/scenes/scene_stage4_vortex_whirlpool.webp',
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
완전 침수나 거센 분출수 속에서도 마지막 호흡을 확보할 수 있는 장비다.`,

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
    title: 'STAGE 5 : 00:28 — 중앙 채광 돔',
    sub: '머리 위 1미터, 5cm 두께의 채광 아크릴 돔이 보였다. 00:30 수장 프로토콜까지 남은 시간은 2분. 천장을 깨야 한다.',
    bg: '/assets/scenes/scene_stage5_dome.webp',
    breakBg: '/assets/scenes/scene_stage5_dome_cracking.webp', // 파쇄 균열 씬
    waterLevel: 95
  }
};

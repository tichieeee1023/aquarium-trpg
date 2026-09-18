export const JOBS = {
  AQUARIST: {
    key: 'AQUARIST',
    title: '대형 어류 아쿠아리스트',
    desc: '야행성 상어 수조 야간 피딩 잔업. 물리 완력 판정 보너스.',
    baseStats: { STR: 14, DEX: 10, INT: 10, WILL: 10, LUK: 10 },
    startItems: ['TONGS', 'RUBBER_BOOTS'],
    traitDesc: '괴력의 완력 (모든 물리 파괴 STR 판정 +2 보정)',
    imgM: '/assets/characters/char_aquarist_m.webp',
    imgF: '/assets/characters/char_aquarist_f.webp'
  },
  DIVER: {
    key: 'DIVER',
    title: '시설 관리 다이버',
    desc: '아크릴 수조 야간 청소. 방호 수트와 수중 생존 순발력 특화.',
    baseStats: { STR: 10, DEX: 14, INT: 10, WILL: 10, LUK: 10 },
    startItems: ['LINE_CUTTER', 'WETSUIT'],
    traitDesc: '잠수사의 침착함 (Stage 1 누전 시 감전 회피 DEX 판정 기회)',
    imgM: '/assets/characters/char_diver_m.webp',
    imgF: '/assets/characters/char_diver_f.webp'
  },
  VET: {
    key: 'VET',
    title: '수생 임상 수의사',
    desc: '격리 표본 바이탈 체크 및 야간 투약. 기계 분석과 공포 저항 특화.',
    baseStats: { STR: 10, DEX: 10, INT: 14, WILL: 10, LUK: 10 },
    startItems: ['PENLIGHT', 'SEDATIVE'],
    traitDesc: '병리적 침착 (공포 피해 2 감소, 냉동기 제어반 DC 완화)',
    imgM: '/assets/characters/char_vet_m.webp',
    imgF: '/assets/characters/char_vet_f.webp'
  },
  SECURITY: {
    key: 'SECURITY',
    title: '종합 방재 보안요원',
    desc: '폐장 후 전 구역 락다운 순찰. 시설 지형 파악 및 방재 오버라이드.',
    baseStats: { STR: 10, DEX: 10, INT: 10, WILL: 14, LUK: 10 },
    startItems: ['KEY_TAG', 'LANTERN'],
    traitDesc: '방재 매뉴얼 숙지 (기계 판정 INT +2, 방재함 해제 DC 완화)',
    imgM: '/assets/characters/char_security_m.webp',
    imgF: '/assets/characters/char_security_f.webp'
  }
};

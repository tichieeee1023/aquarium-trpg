export const initialGameState = {
  phase: 'STAGE_0_SETUP', // STAGE_0_SETUP | STAGE_0_DICE | STAGE_1~5 | ENDING
  gender: 'M',
  character: null,
  ap: 3,
  waterLevel: 5,
  inventory: [],
  examined: [],
  currentBg: '/assets/scenes/scene_title_aquarium.webp',
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
  finalStep: 0,
  finalFailures: 0,
  logs: ['23:45. 발목을 적시는 물소리 사이로 지하 통로의 침수 경보가 울렸다.']
};

import { JOBS } from '../data/game/jobs.js';
import { ITEM_DB } from '../data/game/items.js';
import { SCENARIOS } from '../data/game/scenarios.js';
import { ENDINGS } from '../data/game/endings.js';
import { initialGameState } from './initialState.js';

export function gameReducer(state, action) {
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
        currentBg: '/assets/scenes/scene_title_aquarium.webp',
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
      if (rewardItem && !nextInv.some(i => i.id === rewardItem.id)) {
        nextInv.push(rewardItem);
      }
      const nextFlags = { ...state.flags };
      if (flagKey) nextFlags[flagKey] = true;

      const nextSan = Math.max(0, Math.min(state.character.maxSan, state.character.san - Math.max(0, (sanCost || 0) - (state.character.key === 'VET' ? 2 : 0)) + (sanReward || 0)));
      const nextHp = Math.max(0, state.character.hp - (hpCost || 0));
      const nextAp = state.ap - 1;

      // 씬 동적 변화 (Stage 4 흡입구 조사 시 와류 씬)
      let nextBg = state.currentBg;
      if (point.id === 'c4_3') nextBg = SCENARIOS.STAGE_4_PUMP.vortexBg;

      return {
        ...state,
        phase: nextHp === 0 || nextSan === 0 ? 'ENDING' : state.phase,
        ending: nextHp === 0 || nextSan === 0 ? {
          ...ENDINGS.BAD_4,
          title: nextHp === 0 ? '침수 속에서 꺼진 생명' : '심해에 삼켜진 정신',
          desc: nextHp === 0
            ? '몸에 쌓인 충격이 한꺼번에 밀려왔다. 무릎이 꺾이고, 손끝에서 감각이 멀어졌다. 눈앞의 경고등이 물결처럼 번졌다.'
            : '경보음과 펌프 소리가 한데 뒤엉켰다. 출구의 불빛과 수조의 푸른빛을 구분할 수 없었다. 더는 어느 쪽으로 가야 하는지 알 수 없었다.'
        } : state.ending,
        ap: nextAp,
        inventory: nextInv,
        flags: nextFlags,
        currentBg: nextBg,
        character: { ...state.character, san: nextSan, hp: nextHp },
        examined: [...state.examined, point.id],
        logs: [`[수색] "${point.name}" (잔여 AP: ${nextAp}) ${action.payload.outcome || point.log || "조사를 마쳤다."}`, ...state.logs]
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
        currentBg: `/assets/endings/card_ending_${action.payload.toLowerCase().replace('_', '')}.webp`
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

    case 'RESOLVE_FINAL_STEP': {
      const {
        success,
        hpDamage = 0,
        sanDamage = 0,
        failureCount = success ? 0 : 1,
        log = ''
      } = action.payload;

      return {
        ...state,
        finalStep: Math.min(3, state.finalStep + 1),
        finalFailures: state.finalFailures + failureCount,
        character: {
          ...state.character,
          hp: Math.max(0, state.character.hp - hpDamage),
          san: Math.max(0, state.character.san - sanDamage)
        },
        logs: [log, ...state.logs].filter(Boolean)
      };
    }
    case 'RESTART_GAME':
      return { ...initialGameState };

    default:
      return state;
  }
}

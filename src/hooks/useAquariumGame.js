import { useState, useReducer } from 'react';
import {
  ITEM_DB,
  SCENARIOS,
  initialGameState,
  gameReducer
} from '../game/index.js';
import { NEXT_STAGE, createStageIntroStory, getStageTransitionStory } from '../game/stageFlow.js';
import { FINAL_ESCAPE_STEPS, getFinalEnding, getFinalStepCheck } from '../game/finalEscape.js';
import { getEndingJobEpilogue } from '../data/endingJobEpilogues.js';


export function useAquariumGame(sfx, settings) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isRolling, setIsRolling] = useState(false);
  const [activeModalText, setStory] = useState(null);
  const [storyQueue, setStoryQueue] = useState([]);
  const [screenEffect, setScreenEffect] = useState(null);
  const [oxygenLockerRetry, setOxygenLockerRetry] = useState(false);

  const triggerScreenEffect = (type, duration = 700) => {
    if (settings.disableEffects) return;

    const key = `${type}-${Date.now()}-${Math.random()}`;

    setScreenEffect({ type, key });

    window.setTimeout(() => {
      setScreenEffect(current =>
        current?.key === key ? null : current
      );
    }, duration);
  };

  // =========================================================
  // STORY
  // =========================================================


  const showStorySequence = stories => {
    const validStories = stories.filter(Boolean);

    if (validStories.length === 0) return;

    setStory(validStories[0]);
    setStoryQueue(validStories.slice(1));
  };

  const advanceStory = () => {
    const currentStory = activeModalText;

    if (storyQueue.length > 0) {
      const [nextStory, ...rest] = storyQueue;

      setStory(nextStory);
      setStoryQueue(rest);
      return;
    }

    setStory(null);

    if (typeof currentStory?.onAdvance === 'function') {
      currentStory.onAdvance();
    }
  };

  // =========================================================
  // D20
  // =========================================================

  const triggerD20 = (
    title,
    statKey,
    dc,
    bonus = 0,
    onSuccess,
    onFail
  ) => {
    sfx.playClick(440, 'triangle', 0.1);

    dispatch({
      type: 'OPEN_DICE',
      payload: {
        title,
        stat: statKey,
        dc,
        bonus,
        onSuccess,
        onFail
      }
    });
  };

  const handleExecuteRoll = (skipAnimation = false) => {
    if (isRolling || state.diceModal.roll !== null) return;

    setIsRolling(true);
    sfx.playDiceRoll();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;

      // 컨디션 주사위
      if (state.diceModal.stat === 'CONDITION') {
        dispatch({
          type: 'ROLL_DICE_RESULT',
          payload: {
            roll,
            total: roll,
            isSuccess: true,
            isCrit: roll === 20
          }
        });

        setIsRolling(false);
        return;
      }

      const statVal =
        state.character?.stats[state.diceModal.stat] || 10;

      const statMod =
        Math.floor((statVal - 10) / 2);

      const total =
        roll +
        statMod +
        state.diceModal.bonus;

      const isCritSuccess = roll === 20;
      const isCritFail = roll === 1;

      const isSuccess = isCritSuccess
        ? true
        : isCritFail
          ? false
          : total >= state.diceModal.dc;

      if (isCritSuccess) {
        sfx.playCritical();
      } else if (isCritFail) {
        sfx.playFumble();
      } else if (isSuccess) {
        sfx.playSuccess();
      } else {
        sfx.playDanger();
      }

      dispatch({
        type: 'ROLL_DICE_RESULT',
        payload: {
          roll,
          total,
          isSuccess,
          isCrit: isCritSuccess
        }
      });

      setIsRolling(false);
    }, skipAnimation ? 0 : 700);
  };

  const handleConfirmDice = () => {
    if (
      state.diceModal.roll === null ||
      isRolling
    ) {
      return;
    }

    // 컨디션 결정
    if (state.diceModal.stat === 'CONDITION') {
      dispatch({
        type: 'CLOSE_DICE'
      });

      dispatch({
        type: 'RESOLVE_CONDITION',
        payload: state.diceModal.roll
      });

      showStorySequence([
        createStageIntroStory('STAGE_1_JELLYFISH')
      ]);

      return;
    }

    const {
      isSuccess,
      onSuccess,
      onFail
    } = state.diceModal;

    dispatch({
      type: 'CLOSE_DICE'
    });

    if (isSuccess && onSuccess) {
      onSuccess(state.diceModal.roll);
    } else if (!isSuccess && onFail) {
      onFail(state.diceModal.roll);
    }
  };

  // =========================================================
  // STAGE 이동
  //
  // targetStage를 생략하면 현재 phase 기준 다음 스테이지로 이동.
  // 따라서 기존 advanceStage() 호출도 안전하게 동작한다.
  // =========================================================

  const advanceStage = (
    targetStage = NEXT_STAGE[state.phase]
  ) => {
    if (
      !targetStage ||
      !SCENARIOS[targetStage]
    ) {
      return;
    }

    dispatch({
      type: 'GO_TO_STAGE',
      payload: targetStage
    });

    showStorySequence([
      getStageTransitionStory(state.phase, targetStage),
      createStageIntroStory(targetStage)
    ]);
  };

  // =========================================================
  // AP 0 — 각 스테이지 위기 결단
  // =========================================================

  const handleStageResolve = () => {
    // -------------------------------------------------------
    // STAGE 1 — 누전 폭발
    // -------------------------------------------------------
    if (state.phase === 'STAGE_1_JELLYFISH') {
      const resolveElectricShock = () => {
        const hasSafeRoute =
          state.flags.hasRubberBoots ||
          state.flags.isGateUnlocked;

        const hasWetsuit =
          state.inventory.some(item => item.id === 'WETSUIT');

        if (hasSafeRoute) {
          sfx.playStageTransition();
          advanceStage('STAGE_2_BULKHEAD');
          return;
        }

        if (
          state.character.key === 'DIVER' &&
          hasWetsuit
        ) {
          triggerD20(
            '절연 슈트로 누전 구역 돌파',
            'DEX',
            state.flags.warnedElectricWire ? 9 : 11,
            0,
            () => {
              dispatch({
                type: 'APPLY_NONLETHAL_DAMAGE',
                payload: {
                  amount: 6,
                  log: '[다이버 특권 · 누전 돌파] 절연 슈트가 치명상을 막았다. (HP -6)'
                }
              });
              sfx.playDanger();
              advanceStage('STAGE_2_BULKHEAD');
            },
            () => {
              dispatch({
                type: 'APPLY_NONLETHAL_DAMAGE',
                payload: {
                  amount: 10,
                  log: '[다이버 특권 · 누전 실패] 강한 감전과 화상을 입었지만 간신히 빠져나왔다. (HP -10)'
                }
              });
              sfx.playDanger();
              advanceStage('STAGE_2_BULKHEAD');
            }
          );
          return;
        }

        if (state.flags.warnedElectricWire) {
          triggerD20(
            '사전 조사 정보로 누전 구역 통과',
            'DEX',
            11,
            0,
            () => {
              dispatch({
                type: 'APPLY_NONLETHAL_DAMAGE',
                payload: {
                  amount: 2,
                  log: '[사전 조사 정보 사용] 케이블의 침수 위치를 피해 통과했다. DEX DC 13 → 11, HP -2'
                }
              });
              advanceStage('STAGE_2_BULKHEAD');
            },
            () => {
              dispatch({
                type: 'APPLY_NONLETHAL_DAMAGE',
                payload: {
                  amount: 6,
                  log: '[사전 조사 정보 사용] 감전 지점을 알고 있어 치명상은 피했다. HP -6'
                }
              });
              sfx.playDanger();
              advanceStage('STAGE_2_BULKHEAD');
            }
          );
          return;
        }

        if (settings.easyMode) {
          dispatch({
            type: 'APPLY_NONLETHAL_DAMAGE',
            payload: {
              amount: 3,
              log: '[이지 모드 · 누전 돌파] 화상을 입었지만 비상 통로로 빠져나왔다. (HP -3)'
            }
          });
          sfx.playDanger();
          advanceStage('STAGE_2_BULKHEAD');
          return;
        }

        sfx.playDanger();
        dispatch({
          type: 'TRIGGER_ENDING',
          payload: 'BAD_1'
        });
      };

      triggerScreenEffect('electric', 1100);
      sfx.playGlitch();

      setStory({
        kind: 'SCENE',
        title: '23:53 — 누전 폭발',
        tag: '위기 발생',
        body: `지지지직— 콰앙!

끊어진 고압 케이블이 바닥의 물 위로 떨어졌다. 새하얀 섬광에 눈을 감았는데도 푸른 잔상이 시야에 들러붙었다.
귀를 때리는 파열음과 함께 아쿠아리움 전체가 흔들렸다. 발밑의 물이 먼저 빛났다.`,
        image: {
          src: '/assets/scenes/scene_stage1_blackout_shock.webp',
          alt: '끊어진 고압 케이블이 물 위로 떨어진 해파리 터널'
        },
        onAdvance: resolveElectricShock
      });

      return;
    }

    // -------------------------------------------------------
    // STAGE 2 — 수밀 격벽
    // -------------------------------------------------------
    if (state.phase === 'STAGE_2_BULKHEAD') {
      const resolveBulkhead = () => {
        const hasCrowbar = state.flags.hasCrowbar;
        const isPressureReduced = state.flags.isPressureReduced;
        const strBonus = state.character.key === 'AQUARIST' ? 2 : 0;

        if (hasCrowbar) {
          triggerD20(
            '빠루로 수밀문 틈 벌리기',
            'STR',
            10,
            strBonus,
            () => {
              sfx.playStageTransition();
              advanceStage('STAGE_3_FREEZER');
            },
            () => {
              sfx.playDanger();
              dispatch({
                type: 'TRIGGER_ENDING',
                payload: 'BAD_2'
              });
            }
          );
          return;
        }

        if (isPressureReduced) {
          triggerD20(
            '수압이 낮아진 틈으로 몸 던지기',
            'DEX',
            12,
            0,
            () => {
              sfx.playStageTransition();
              advanceStage('STAGE_3_FREEZER');
            },
            () => {
              sfx.playDanger();
              dispatch({
                type: 'TRIGGER_ENDING',
                payload: 'BAD_2'
              });
            }
          );
          return;
        }

        if (settings.easyMode) {
          dispatch({
            type: 'APPLY_NONLETHAL_DAMAGE',
            payload: {
              amount: 3,
              log: '[이지 모드 · 격벽 돌파] 철판에 부딪혔지만 반대편으로 굴러 나왔다. (HP -3)'
            }
          });
          sfx.playDanger();
          advanceStage('STAGE_3_FREEZER');
          return;
        }

        sfx.playDanger();
        dispatch({
          type: 'TRIGGER_ENDING',
          payload: 'BAD_2'
        });
      };

      dispatch({
        type: 'SET_BG',
        payload:
          SCENARIOS
            .STAGE_2_BULKHEAD
            .closingBg
      });

      sfx.playMetalSlam();
      triggerScreenEffect('blackout', 650);

      setStory({
        kind: 'SCENE',
        title: '00:06 — 격벽 폐쇄',
        tag: '위기 발생',
        body: `철컥, 쿵—!

강철 수밀문이 마지막 빛 한 줄기를 자르며 내려왔다. 문 가장자리가 바닥을 긁고, 밀려든 물이 등을 떠밀었다.
빠루가 있다면 틈을 벌릴 수 있다. 수압을 낮췄다면 좁아진 틈으로 몸을 던질 수 있다.`,
        image: {
          src:
            SCENARIOS
              .STAGE_2_BULKHEAD
              .closingBg,
          alt: '바닥으로 내려오는 강철 수밀문'
        },
        onAdvance: resolveBulkhead
      });

      return;
    }

    // -------------------------------------------------------
    // STAGE 3 — 냉동창고
    // -------------------------------------------------------
    if (state.phase === 'STAGE_3_FREEZER') {
      const resolveFrozenDoor = () => {
        const hasTorch = state.flags.hasHeatingTorch;
        const isChillerOff = state.flags.isChillerOff;
        const strBonus = state.character.key === 'AQUARIST' ? 2 : 0;

        if (hasTorch) {
          triggerD20(
            '가스 토치로 결빙 래치 해빙',
            'DEX',
            8,
            0,
            () => {
              sfx.playStageTransition();
              advanceStage('STAGE_4_PUMP');
            },
            () => {
              sfx.playDanger();
              dispatch({
                type: 'TRIGGER_ENDING',
                payload: 'BAD_3'
              });
            }
          );
          return;
        }

        if (isChillerOff) {
          triggerD20(
            '냉각이 멈춘 래치 강제 파쇄',
            'STR',
            13,
            strBonus,
            () => {
              sfx.playStageTransition();
              advanceStage('STAGE_4_PUMP');
            },
            () => {
              sfx.playDanger();
              dispatch({
                type: 'TRIGGER_ENDING',
                payload: 'BAD_3'
              });
            }
          );
          return;
        }

        if (settings.easyMode) {
          dispatch({
            type: 'APPLY_NONLETHAL_DAMAGE',
            payload: {
              amount: 3,
              log: '[이지 모드 · 동결 돌파] 저체온증을 입었지만 문은 열렸다. (HP -3)'
            }
          });
          sfx.playDanger();
          advanceStage('STAGE_4_PUMP');
          return;
        }

        sfx.playDanger();
        dispatch({
          type: 'TRIGGER_ENDING',
          payload: 'BAD_3'
        });
      };

      triggerScreenEffect('cold-flash', 780);

      setStory({
        kind: 'SCENE',
        title: '00:18 — 동결 한계',
        tag: '위기 발생',
        body: `손가락 끝의 감각이 먼저 사라졌다. 숨을 들이쉴 때마다 차가운 공기가 폐 안쪽을 긁었다. 문고리에는 흰 성에가 두껍게 번져, 손을 대기도 전에 피부가 저려 왔다.
토치로 래치를 녹이거나 냉각기를 멈춰 두었다면 탈출을 시도할 수 있다.`,
        image: {
          src:
            SCENARIOS
              .STAGE_3_FREEZER
              .bg,
          alt: '영하 35도의 급속 냉동고'
        },
        onAdvance: resolveFrozenDoor
      });

      return;
    }

    // -------------------------------------------------------
    // STAGE 4 — 펌프실
    // -------------------------------------------------------
    if (state.phase === 'STAGE_4_PUMP') {
      sfx.playStageTransition();
      triggerScreenEffect('alarm-blackout', 900);

      window.setTimeout(() => {
        advanceStage('STAGE_5_DOME');
      }, settings.disableEffects ? 0 : 420);
    }
  };

  // =========================================================
  // STAGE 5 — 최종 파쇄
  // =========================================================

  const handleStage5Break = () => {
    if (
      state.phase !== 'STAGE_5_DOME' ||
      state.finalStep >= FINAL_ESCAPE_STEPS.length ||
      state.diceModal.isOpen ||
      isRolling
    ) {
      return;
    }

    const step = FINAL_ESCAPE_STEPS[state.finalStep];
    const finalCheck = getFinalStepCheck(
      step,
      state.inventory,
      state.flags,
      state.character.key
    );
    const prepared = Boolean(finalCheck.preparation);
    const dc = finalCheck.dc;

    const specialtyBonus =
      step.specialties.includes(state.character.key)
        ? 2
        : 0;

    const getDamage = (isNatural1) => {
      if (step.id === 'VENT') {
        return isNatural1
          ? { hpDamage: 6, sanDamage: 3 }
          : { hpDamage: 3, sanDamage: 2 };
      }

      if (step.id === 'FRACTURE') {
        return isNatural1
          ? { hpDamage: 7, sanDamage: 1 }
          : { hpDamage: 4, sanDamage: 0 };
      }

      return isNatural1
        ? { hpDamage: 8, sanDamage: 3 }
        : { hpDamage: 5, sanDamage: 2 };
    };

    const getSuccessText = () => {
      if (step.id === 'VENT') {
        return prepared
          ? '가열된 배출구가 비명을 지르듯 열렸다. 압력계 바늘이 빠르게 떨어지고, 돔을 짓누르던 수압이 조금씩 풀리기 시작했다.'
          : '맨손에 가까운 조작 끝에 비상 배출구가 가까스로 열렸다. 완전히 안전하지는 않지만, 돔을 깨뜨릴 틈은 생겼다.';
      }

      if (step.id === 'FRACTURE') {
        return prepared
          ? '도구를 균열 사이에 깊숙이 박아 넣었다. 둔탁한 파열음과 함께 아크릴 지지대가 연달아 갈라졌다.'
          : '몸무게를 실어 몇 번이고 지지대를 내리쳤다. 팔이 저려 왔지만, 마침내 돔에 사람이 빠져나갈 만한 균열이 벌어졌다.';
      }

      return prepared
        ? '산소를 확보한 채 분출수의 방향을 읽었다. 거센 물살이 몸을 밀어 올렸고, 깨진 돔 너머의 차가운 빗물이 얼굴에 닿았다.'
        : '숨이 끊어질 듯한 물살을 버티며 위쪽의 빛만 좇았다. 손끝이 마침내 젖은 지상 바닥을 붙잡았다.';
    };

    const getFailText = (isNatural1) => {
      if (step.id === 'VENT') {
        return isNatural1
          ? '배출구가 역압을 견디지 못하고 튕겨 나왔다. 금속 파편과 뜨거운 증기가 몸을 후려쳤고, 압력은 충분히 빠지지 않았다.'
          : '배출구는 절반만 열렸다. 수압은 남아 있고, 다음 파쇄는 훨씬 거칠어질 수밖에 없다.';
      }

      if (step.id === 'FRACTURE') {
        return isNatural1
          ? '파쇄 충격이 그대로 어깨를 타고 올라왔다. 관절이 비틀리는 통증 속에서도 균열만은 간신히 남았다.'
          : '지지대는 완전히 끊어지지 않았다. 좁은 균열 사이로 물이 폭발적으로 새기 시작했다.';
      }

      return isNatural1
        ? '분출수가 몸을 벽으로 내던졌다. 시야가 뒤집히고 마지막 숨이 터져 나왔다.'
        : '물살이 몇 번이고 몸을 아래로 끌어당겼다. 간신히 지상까지 닿았지만, 온몸의 힘이 거의 남지 않았다.';
    };

    const finishEnding = (failuresAfter) => {
      const ending = getFinalEnding({
        failures: failuresAfter,
        inventory: state.inventory,
        flags: state.flags,
        characterKey: state.character.key
      });

      dispatch({
        type: 'TRIGGER_ENDING',
        payload: ending
      });
    };

    const openFinalDice = () => triggerD20(
      step.title,
      step.stat,
      dc,
      specialtyBonus,

      () => {
        if (step.id === 'VENT') {
          sfx.playPressureRelease();
          triggerScreenEffect('pressure-pulse', 520);
        } else if (step.id === 'FRACTURE') {
          sfx.playGlassCrack();
          triggerScreenEffect('shatter-flash', 620);
        } else if (step.id === 'ASCENT') {
          sfx.playWaterRush();
          triggerScreenEffect('surface-light', 1450);
        }

        dispatch({
          type: 'RESOLVE_FINAL_STEP',
          payload: {
            success: true,
            log: `[최종 탈출 ${state.finalStep + 1}/3 성공] ${step.title}`
          }
        });

        if (step.id === 'FRACTURE') {
          dispatch({
            type: 'SET_BG',
            payload:
              SCENARIOS
                .STAGE_5_DOME
                .breakBg
          });
        }

        const isLastStep =
          state.finalStep === FINAL_ESCAPE_STEPS.length - 1;

        setStory({
          kind: 'RESULT',
          title: step.title,
          tag: '탈출 단계 성공',
          body: getSuccessText(),
          onAdvance: isLastStep
            ? () => finishEnding(state.finalFailures)
            : undefined
        });
      },

      (rawDice) => {
        const isNatural1 = rawDice === 1;
        const failureCount = isNatural1 ? 2 : 1;
        const damage = getDamage(isNatural1);

        const hpAfter =
          state.character.hp - damage.hpDamage;

        const sanAfter =
          state.character.san - damage.sanDamage;

        dispatch({
          type: 'RESOLVE_FINAL_STEP',
          payload: {
            success: false,
            failureCount,
            ...damage,
            log: `[최종 탈출 ${state.finalStep + 1}/3 실패] ${step.title}${isNatural1 ? ' · Natural 1' : ''}`
          }
        });

        sfx.playDanger();

        if (isNatural1) {
          triggerScreenEffect('damage-blackout', 820);
        }

        const isLastStep =
          state.finalStep === FINAL_ESCAPE_STEPS.length - 1;

        const isFatal =
          hpAfter <= 0 ||
          sanAfter <= 0;

        const mustBadEnd =
          isFatal ||
          (step.id === 'ASCENT' && isNatural1);

        const failuresAfter =
          state.finalFailures + failureCount;

        setStory({
          kind: 'RESULT',
          title: step.title,
          tag: isNatural1 ? '치명적 실패' : '탈출 단계 실패',
          body: getFailText(isNatural1),
          onAdvance: () => {
            if (mustBadEnd) {
              dispatch({
                type: 'TRIGGER_ENDING',
                payload: 'BAD_4'
              });
              return;
            }

            if (isLastStep) {
              finishEnding(failuresAfter);
            }
          }
        });
      }
    );

    const finalItemEffect = finalCheck.preparation === 'MASTER_KEYCARD'
      ? {
        kind: 'ITEM_EFFECT',
        title: ITEM_DB.MASTER_KEYCARD.name,
        tag: '장비 사용',
        illustration: ITEM_DB.MASTER_KEYCARD,
        body: '마스터 키카드를 비상 배출구 리더기에 갖다 댔다. 관리용 전자 잠금이 해제되었다. (DC 14 → 11)'
      }
      : finalCheck.preparation === 'HEX_WRENCH'
        ? {
          kind: 'ITEM_EFFECT',
          title: ITEM_DB.HEX_WRENCH.name,
          tag: '장비 사용',
          illustration: ITEM_DB.HEX_WRENCH,
          body: '육각 렌치를 아크릴 균열 사이에 걸었다. 맨손보다 단단한 지점을 확보했다. (DC 15 → 13)'
        }
        : null;

    if (finalItemEffect) {
      setStory({ ...finalItemEffect, onAdvance: openFinalDice });
      return;
    }

    openFinalDice();
  };

  // =========================================================
  // LOG
  // =========================================================

  const handleDownloadLog = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            game:
              '아쿠아리움: 심해의 균열',

            phase:
              state.phase,

            character:
              state.character?.title,

            ending:
              state.ending?.title,

            logs:
              state.logs
          },
          null,
          2
        )
      ],
      {
        type: 'application/json'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      'aquarium-play-log.json';

    link.click();

    setTimeout(
      () =>
        URL.revokeObjectURL(url),
      1000
    );
  };

  // =========================================================
  // 조사
  // =========================================================

  const handleExamine = id => {
    if (
      activeModalText ||
      state.diceModal.isOpen ||
      state.ap <= 0 ||
      state.examined.includes(id)
    ) {
      return;
    }

    const point =
      SCENARIOS[state.phase]
        ?.points
        ?.find(
          p => p.id === id
        );

    if (!point) return;

    const resolve = success => {
      const hasItem = itemId => state.inventory.some(item => item.id === itemId);
      const coldVestProtection = !success && id === 'c3_3' && hasItem('COLD_VEST');
      const itemEffectStory = (id === 'c3_3' && hasItem('PENLIGHT')) || (id === 'c4_3' && hasItem('LANTERN'))
        ? null
        : coldVestProtection
        ? {
          kind: 'ITEM_EFFECT',
            title: ITEM_DB.COLD_VEST.name,
            tag: '장비 효과',
            illustration: ITEM_DB.COLD_VEST,
            body: '방한 조끼가 혹한의 공기를 막아 냈다. 동상 피해가 줄었다. (HP -1)'
          }
          : id === 'c4_4' && hasItem('KEY_TAG')
            ? {
              kind: 'ITEM_EFFECT',
              title: ITEM_DB.KEY_TAG.name,
              tag: '장비 사용',
              illustration: ITEM_DB.KEY_TAG,
              body: '보안 태그를 리더기에 갖다 댔다. 전자 잠금이 즉시 해제되었다.'
            }
            : null;
      const reward =
        success && point.reward
          ? ITEM_DB[point.reward]
          : null;
      const showClosingBulkhead =
        state.phase ===
        'STAGE_2_BULKHEAD' &&
        state.ap === 2;

      dispatch({
        type: 'EXAMINE_POINT',

        payload: {
          point,

          rewardItem:
            reward,

          flagKey:
            success
              ? point.flag
              : null,

          hpCost:
            success
              ? point.hpCost
              : (coldVestProtection ? 1 : point.failDmg),

          sanCost:
            success
              ? point.sanCost
              : 0,

          sanReward:
            success
              ? point.sanReward
              : 0,

          outcome:
            success
              ? point.successLog || point.log
              : point.failLog
        }
      });

      if (showClosingBulkhead) {
        dispatch({
          type: 'SET_BG',

          payload:
            SCENARIOS
              .STAGE_2_BULKHEAD
              .closingBg
        });
      }

      const baseResult =
        success
          ? point.successLog || point.log
          : point.failLog;

      const resultBody = baseResult || '조사를 마쳤다.';

      // 장비 획득
      // 장면 이미지를 같이 넣지 않는다.
      const resultStory = reward?.img
        ? {
          kind: 'REWARD',
          title: point.name,
          tag: '장비 획득',
          body: resultBody,
          rewardItems: [
            reward
          ]
        }
        : {
          kind: 'RESULT',
          title: point.name,
          tag:
            success
              ? '조사 기록'
              : '판정 실패',
          body: resultBody
        };

      // 보호 장비는 결과 뒤에, 도구·열쇠는 결과 전에 보여 준다.
      // 그래야 "태그로 해제 → 마스크 획득"처럼 원인과 결과가 뒤집히지 않는다.
      showStorySequence(
        itemEffectStory && !coldVestProtection
          ? [itemEffectStory, resultStory]
          : [resultStory, itemEffectStory]
      );

      if (
        !success ||
        point.hpCost ||
        point.sanCost
      ) {
        sfx.playDanger();
      } else {
        sfx.playAction();
      }
    };

    // 판정이 필요한 조사
    if (point.checkStat) {
  const bonus =
    (
      state.character.key === 'AQUARIST' &&
      point.checkStat === 'STR'
    ) ||
    (
      state.character.key === 'SECURITY' &&
      point.checkStat === 'INT'
    )
      ? 2
      : 0;

  // 기본 DC
  let dc = point.dc;

  // 수의사 특권
  // STAGE 3 냉각기 제어반: DC 12 → 9
  if (
    id === 'c3_3' &&
    state.inventory.some(item => item.id === 'PENLIGHT')
  ) {
    dc = 9;
  }

  if (
    id === 'c4_4' &&
    state.inventory.some(item => item.id === 'KEY_TAG')
  ) {
    resolve(true);
    return;
  }

  if (
    id === 'c4_3' &&
    state.inventory.some(item => item.id === 'LANTERN')
  ) {
    dc = Math.max(8, dc - 2);
  }

  // STAGE 4 방재 장비 보관함
  // 일반: DC 12
  // 첫 실패 후 재시도: DC 9
  // 보안요원 특권: 항상 DC 8
  if (id === 'c4_4') {
    if (state.character.key === 'SECURITY') {
      dc = 8;
    } else if (oxygenLockerRetry) {
      dc = 9;
    }
  }

  const openPointCheck = (stat = point.checkStat, checkDc = dc) => triggerD20(
    point.name,
    stat,
    checkDc,
    bonus,
    () => resolve(true),
    () => resolve(false)
  );

  const showItemPreparation = (item, body, stat = point.checkStat, checkDc = dc) => {
    setStory({
      kind: 'ITEM_EFFECT',
      title: item.name,
      tag: '장비 사용',
      illustration: item,
      body,
      onAdvance: () => openPointCheck(stat, checkDc)
    });
  };

  if (id === 'c3_3' && state.inventory.some(item => item.id === 'PENLIGHT')) {
    showItemPreparation(
      ITEM_DB.PENLIGHT,
      '펜라이트 불빛에 냉각기 우회 배선이 드러났다. INT 판정 난이도가 낮아졌다. (DC 12 → 9)'
    );
    return;
  }

  if (id === 'c4_3' && state.inventory.some(item => item.id === 'LANTERN')) {
    const hasDiverCutters = state.character.key === 'DIVER' && state.inventory.some(item => item.id === 'LINE_CUTTER');
    const stat = hasDiverCutters ? 'DEX' : point.checkStat;
    const checkDc = hasDiverCutters ? 8 : dc;
    const dcBefore = hasDiverCutters ? 9 : point.dc;
    showItemPreparation(
      ITEM_DB.LANTERN,
      `랜턴 불빛이 수면 아래 그릴의 위치를 비췄다. 판정 난이도가 낮아졌다. (DC ${dcBefore} → ${checkDc})`,
      stat,
      checkDc
    );
    return;
  }

  // STAGE 4 방재 장비 보관함
  // 첫 실패는 잠금 구조를 파악한 것으로 처리하고 1회 재시도 허용.
  // 첫 실패에서는 AP를 소모하거나 조사 완료 처리하지 않는다.
  if (id === 'c4_4') {
    triggerD20(
      point.name,
      point.checkStat,
      dc,
      bonus,
      () => {
        setOxygenLockerRetry(false);
        resolve(true);
      },
      () => {
        if (!oxygenLockerRetry) {
          setOxygenLockerRetry(true);
          sfx.playDanger();

          setStory({
            kind: 'RESULT',
            title: point.name,
            tag: '잠금 해제 실패 · 재시도 가능',
            body: `잠금장치가 뻑뻑하게 걸렸지만, 내부 래치가 걸리는 위치를 확인했다.
다시 시도한다면 구조를 읽은 덕분에 판정 난이도가 낮아진다. (DC 12 → 9)`
          });

          return;
        }

        setOxygenLockerRetry(false);
        resolve(false);
      }
    );

    return;
  }

  // STAGE 4 흡입 그릴
  // 다이버 + 라인 커터 → STR 대신 DEX DC 9
  if (
    id === 'c4_3' &&
    state.character.key === 'DIVER' &&
    state.inventory.some(
      item => item.id === 'LINE_CUTTER'
    )
  ) {
    triggerD20(
      point.name,
      'DEX',
      state.inventory.some(item => item.id === 'LANTERN') ? 8 : 9,
      0,
      () => resolve(true),
      () => resolve(false)
    );

    return;
  }

  // 일반 판정
  triggerD20(
    point.name,
    point.checkStat,
    dc,
    bonus,
    () => resolve(true),
    () => resolve(false)
  );

  return;
}

resolve(true);
  };

  // =========================================================
  // SETUP
  // =========================================================

  const handleSelectArchetype = (
    arch,
    gender
  ) => {
    sfx.playClick();

    dispatch({
      type: 'SELECT_CHARACTER',
      payload: {
        key: arch.id,
        gender
      }
    });
  };

  const handleRollCondition = () => {
    triggerD20(
      '야간 당직 컨디션',
      'CONDITION',
      0
    );
  };

  const dismissDice = () => {
    if (
      state.diceModal.roll !== null &&
      !isRolling
    ) {
      handleConfirmDice();
    }
  };

  const handleRestart = () => {
    dispatch({
      type: 'RESTART_GAME'
    });

    setStory(null);
    setStoryQueue([]);
    setIsRolling(false);
    setOxygenLockerRetry(false);
    setScreenEffect(null);
  };

  // =========================================================
  // PLAYER / UI ADAPTER
  // =========================================================

  const character =
    state.character;

  const player = {
    ...(
      character || {
        hp: 20,
        maxHp: 20,
        san: 30,
        maxSan: 30,

        stats: {
          STR: 10,
          DEX: 10,
          INT: 10,
          WILL: 10,
          LUK: 10
        }
      }
    ),

    profileId:
      character?.key ||
      'AQUARIST',

    gender:
      state.gender,

    name:
      character
        ? '야간 당직 직원'
        : '사원증 미발급',

    title:
      character?.title ||
      '직군 선택 대기',

    trait:
      character?.traitDesc ||
      '등록 대기',

    inventory:
      state.inventory,

    flags:
      state.flags,

    finalStep:
      state.finalStep,

    finalFailures:
      state.finalFailures
  };

  const dice =
    state.diceModal;

  const diceModal = {
    ...dice,

    kind:
      dice.stat === 'CONDITION'
        ? 'CONDITION'
        : 'CHECK',

    statKey:
      dice.stat,

    rolling:
      isRolling,

    result:
      dice.roll === null
        ? null
        : {
          rawDice:
            dice.roll,

          total:
            dice.total,

          modifier:
            dice.stat === 'CONDITION'
              ? 0
              : Math.floor(
                (
                  player.stats[
                  dice.stat
                  ] - 10
                ) / 2
              ),

          traitBonus:
            dice.bonus,

          isSuccess:
            dice.isSuccess,

          isNat20:
            dice.roll === 20,

          isNat1:
            dice.roll === 1
        }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return {
    state,

    stage:
      state.phase ===
        'STAGE_0_SETUP'
        ? 'SURVEY'
        : state.phase ===
          'STAGE_0_DICE'
          ? 'DICE_CONDITION'
          : state.phase,

    player,

    ap:
      state.ap,

    diceModal,

    activeModalText,
    screenEffect,

    endingData:
      state.ending
        ? {
          ...state.ending,

          jobEpilogue: getEndingJobEpilogue(
            state.character?.key,
            state.ending.type
          ),

          id:
            state.ending.type,

          cardId:
            state.ending.type,

          type:
            state.ending.type.startsWith(
              'BAD'
            )
              ? 'BAD'
              : state.ending.type
        }
        : null,

    handleSelectArchetype,
    handleRollCondition,
    handleExamine,
    handleStageResolve,
    handleStage5Break,
    handleRestart,

    rollD20Check:
      handleExecuteRoll,

    confirmDiceResult:
      handleConfirmDice,

    dismissDice,
    advanceStory,

    handleUseItem: id =>
      dispatch({
        type: 'USE_ITEM',
        payload: id
      }),

    discardItem: id =>
      dispatch({
        type: 'DISCARD_ITEM',
        payload: id
      }),

    handleDownloadLog
  };
}

import { useState, useReducer } from 'react';
import {
  ITEM_DB,
  SCENARIOS,
  initialGameState,
  gameReducer
} from '../aquariumEngine.js';

const NEXT_STAGE = {
  STAGE_1_JELLYFISH: 'STAGE_2_BULKHEAD',
  STAGE_2_BULKHEAD: 'STAGE_3_FREEZER',
  STAGE_3_FREEZER: 'STAGE_4_PUMP',
  STAGE_4_PUMP: 'STAGE_5_DOME'
};

export function useAquariumGame(sfx, settings) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isRolling, setIsRolling] = useState(false);
  const [activeModalText, setStory] = useState(null);
  const [storyQueue, setStoryQueue] = useState([]);
  const [screenFlash, setScreenFlash] = useState(false);

  // =========================================================
  // STORY
  // =========================================================

  const makeStageIntroStory = stageKey => {
    const scenario = SCENARIOS[stageKey];

    if (!scenario) return null;

    return {
      kind: 'SCENE',
      title: scenario.title,
      tag: '구역 진입',
      body: scenario.sub,
      image: {
        src: scenario.bg,
        alt: scenario.title
      }
    };
  };

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

      if (isSuccess) {
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
        makeStageIntroStory('STAGE_1_JELLYFISH')
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
      onSuccess();
    } else if (!isSuccess && onFail) {
      onFail();
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
      makeStageIntroStory(targetStage)
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
        const canSurvive =
          state.flags.hasRubberBoots ||
          state.flags.isGateUnlocked;

        const isDiver =
          state.character.key === 'DIVER';

        // 절연 장화 / 비상문 확보
        if (canSurvive) {
          sfx.playSuccess();
          advanceStage('STAGE_2_BULKHEAD');
          return;
        }

        // 다이버 전용 특권
        if (isDiver) {
          triggerD20(
            '네오프렌 다이빙 슈트 — 누전 회피',
            'DEX',
            11,
            0,

            // 성공 → HP -6 후 생존
            () => {
              dispatch({
                type: 'APPLY_DAMAGE',
                payload: {
                  amount: 6,
                  log:
                    '[누전 돌파] 네오프렌 슈트가 전류를 간신히 차단했다. 화상을 입었지만 빠져나왔다. (HP -6)'
                }
              });

              sfx.playSuccess();

              advanceStage(
                'STAGE_2_BULKHEAD'
              );
            },

            // 실패 → HP -10이지만 생존
            () => {
              dispatch({
                type: 'APPLY_DAMAGE',
                payload: {
                  amount: 10,
                  log:
                    '[누전 돌파] 전류가 슈트를 뚫고 살갗을 태웠다. 심한 감전 열상을 입고 간신히 기어 나왔다. (HP -10)'
                }
              });

              sfx.playDanger();

              advanceStage(
                'STAGE_2_BULKHEAD'
              );
            }
          );

          return;
        }

        // 생존 수단 없음
        sfx.playDanger();

        dispatch({
          type: 'TRIGGER_ENDING',
          payload: 'BAD_1'
        });
      };
      if (!settings.disableEffects) {
        setScreenFlash(false);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setScreenFlash(true);

            setTimeout(() => {
              setScreenFlash(false);
            }, 900);
          });
        });
      }
      // 누전 폭발 장면을 먼저 보여준다.
      setStory({
        kind: 'SCENE',
        title: '23:53 — 누전 폭발',
        tag: '위기 발생',

        body: `지지지직— 콰앙!

끊어진 고압 케이블이 바닥의 물 위로 떨어진 순간, 새하얀 섬광이 시야를 집어삼켰다.
뒤이어 아쿠아리움 전체가 울릴 만큼 거대한 충격과 파열음이 터져 나왔다.`,

        image: {
          src:
            '/assets/scenes/scene_stage1_blackout_shock.png',

          alt:
            '끊어진 고압 케이블이 물 위로 떨어진 해파리 터널'
        },

        onAdvance:
          resolveElectricShock
      });

      return;
    }

    // -------------------------------------------------------
    // STAGE 2
    // -------------------------------------------------------

    if (state.phase === 'STAGE_2_BULKHEAD') {
      const resolveBulkhead = () => {
        const hasCrowbar = state.flags.hasCrowbar;
        const isPressureReduced = state.flags.isPressureReduced;

        // 빠루 보유 → STR DC 10
        if (hasCrowbar) {
          const bonus =
            state.character.key === 'AQUARIST'
              ? 2
              : 0;

          triggerD20(
            '수밀문 틈 강제 고정',
            'STR',
            10,
            bonus,
            () => {
              sfx.playSuccess();
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

        // 빠루 없음 + 수압 감소 성공 → DEX DC 12
        if (isPressureReduced) {
          triggerD20(
            '수밀문 하단 슬라이딩 돌파',
            'DEX',
            12,
            0,
            () => {
              sfx.playSuccess();
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

        // 둘 다 없음 → BAD END
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

      setStory({
        kind: 'SCENE',
        title: '00:06 — 격벽 폐쇄',
        tag: '위기 발생',

        body: `철컥, 쿵—!

강철 수밀문이 마지막 틈을 짓이기며 바닥으로 내려앉기 시작했다.
이대로 닫히면 이 통로는 거대한 수조가 된다.`,

        image: {
          src:
            SCENARIOS
              .STAGE_2_BULKHEAD
              .closingBg,

          alt:
            '바닥으로 내려오는 강철 수밀문'
        },

        onAdvance:
          resolveBulkhead
      });

      return;
    }

    // -------------------------------------------------------
    // STAGE 3
    // -------------------------------------------------------

    if (state.phase === 'STAGE_3_FREEZER') {
      const resolveFrozenDoor = () => {
        const hasTorch =
          state.flags.hasHeatingTorch;

        const isChillerOff =
          state.flags.isChillerOff;

        // 가스 토치 확보 → DEX DC 8
        if (hasTorch) {
          triggerD20(
            '가스 토치 해빙',
            'DEX',
            8,
            0,

            () => {
              sfx.playSuccess();
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

        // 토치 없음 + 냉각기 정지 → STR DC 13
        if (isChillerOff) {
          const bonus =
            state.character.key === 'AQUARIST'
              ? 2
              : 0;

          triggerD20(
            '결빙 래치 강제 파쇄',
            'STR',
            13,
            bonus,

            () => {
              sfx.playSuccess();
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

        // 토치도 없고 냉각기도 못 멈춤
        sfx.playDanger();

        dispatch({
          type: 'TRIGGER_ENDING',
          payload: 'BAD_3'
        });
      };

      setStory({
        kind: 'SCENE',
        title: '00:18 — 동결 한계',
        tag: '위기 발생',

        body: `손가락 끝의 감각이 사라지고, 숨을 들이쉴 때마다 차가운 통증이 폐를 찔렀다.
얼어붙은 방열문을 지금 열지 못하면, 여기서 그대로 냉동 표본이 된다.`,

        image: {
          src:
            SCENARIOS
              .STAGE_3_FREEZER
              .bg,

          alt:
            '영하 35도의 급속 냉동고'
        },

        onAdvance:
          resolveFrozenDoor
      });

      return;
    }

    // -------------------------------------------------------
    // STAGE 4
    // -------------------------------------------------------

    if (state.phase === 'STAGE_4_PUMP') {
      sfx.playSuccess();

      advanceStage(
        'STAGE_5_DOME'
      );
    }
  };

  // =========================================================
  // STAGE 5 — 최종 파쇄
  // =========================================================

  const handleStage5Break = () => {
    const hasTorch =
      state.inventory.some(
        i =>
          i.id === 'HEATING_TORCH'
      );

    const hasCrowbar =
      state.inventory.some(
        i =>
          i.id === 'CROWBAR'
      );

    const hasMask =
      state.inventory.some(
        i =>
          i.id === 'OXYGEN_MASK'
      );

    const keyCount = [
      hasTorch,
      hasCrowbar,
      hasMask
    ].filter(Boolean).length;

    let targetDc = 14;

    if (keyCount === 3) {
      targetDc = 8;
    } else if (keyCount === 2) {
      targetDc = 11;
    }

    const bonus =
      state.character.key === 'AQUARIST'
        ? 2
        : 0;

    triggerD20(
      '채광 아크릴 돔 파쇄 및 지상 수직 사출',
      'STR',
      targetDc,
      bonus,

      () => {
        setIsRolling(true);

        dispatch({
          type: 'SET_BG',
          payload:
            SCENARIOS
              .STAGE_5_DOME
              .breakBg
        });

        sfx.playSuccess();

        setTimeout(() => {
          setIsRolling(false);

          if (keyCount === 3) {
            dispatch({
              type: 'TRIGGER_ENDING',
              payload: 'TRUE'
            });
          } else if (keyCount === 2) {
            dispatch({
              type: 'TRIGGER_ENDING',
              payload: 'GOOD'
            });
          } else {
            dispatch({
              type: 'TRIGGER_ENDING',
              payload: 'NORMAL'
            });
          }
        }, settings.disableEffects ? 0 : 700);
      },

      () => {
        sfx.playDanger();

        dispatch({
          type: 'TRIGGER_ENDING',
          payload: 'BAD_4'
        });
      }
    );
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
      const reward =
        success && point.reward
          ? ITEM_DB[point.reward]
          : null;

      const full =
        reward &&
        state.inventory.length >= 5 &&
        !state.inventory.some(
          i =>
            i.id === reward.id
        );

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
              : point.failDmg,

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
              ? point.successLog ||
              point.log
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
          ? point.successLog ||
          point.log
          : point.failLog;

      const resultBody =
        (baseResult ||
          '조사를 마쳤다.') +
        (
          full
            ? '\n가방이 가득 차 장비를 챙기지 못했다. 다음 조사 전에 가방을 정리해야 한다.'
            : ''
        );

      // 장비 획득
      // 장면 이미지를 같이 넣지 않는다.
      if (
        reward?.img &&
        !full
      ) {
        setStory({
          kind: 'REWARD',
          title: point.name,
          tag: '장비 획득',
          body: resultBody,
          rewardItems: [
            reward
          ]
        });
      } else {
        // 일반 조사
        setStory({
          kind: 'RESULT',
          title: point.name,
          tag:
            success
              ? '조사 기록'
              : '판정 실패',
          body: resultBody
        });
      }

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
    state.character.key === 'VET' &&
    id === 'c3_3'
  ) {
    dc = 9;
  }

  // 보안요원 특권
  // STAGE 4 방재 장비 보관함: DC 12 → 8
  if (
    state.character.key === 'SECURITY' &&
    id === 'c4_4'
  ) {
    dc = 8;
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
      9,
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
      state.inventory
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

    activeModalText,
    screenFlash,

    endingData:
      state.ending
        ? {
          ...state.ending,

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
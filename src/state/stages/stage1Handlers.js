import { ITEM_DB } from '../../data/itemDB.js';
import { SCENARIO_TEXT } from '../../data/scenarioDB.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';

export function createStage1Handlers({ ap, examinedPoints, setStage, setPlayer, setAp, setExaminedPoints, setActiveModalText, setFlags, setEndingData, sfx, addLog, triggerGlitch, openDiceCheck, getState }) {
// ===========================================================================
// STAGE 1 : 6호차 객차 탐사 핸들러 (AP 3 소모)
// ===========================================================================
const examineCar6Point = (pointId) => {
if (ap <= 0 || examinedPoints.includes(pointId)) return;
sfx.playClick();
const nextAp = ap - 1;
setAp(nextAp);
setExaminedPoints((prev) => [...prev, pointId]);

// 배터리 자연 소모
setPlayer((p) => ({ ...p, battery: Math.max(0, p.battery - 3) }));

switch (pointId) {
  case 'p1_padding':
    setFlags((f) => ({ ...f, clue_acid_cloth: true }));
    setPlayer((p) => ({
      ...p,
      battery: Math.min(100, p.battery + 20),
      inventory: [
        ...p.inventory,
        { ...ITEM_DB.cutter },
        { ...ITEM_DB.powerbank }
      ]
    }));
    addLog("롱패딩 수색: 보조배터리 & 커터칼 획득. 강산성 용해 흔적 발견.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_1,
      body: SCENARIO_TEXT.text_2,
      tag: SCENARIO_TEXT.text_3,
      onClose: () => checkCar6Crisis(nextAp)
    });
    break;

  case 'p2_intercom':
    openDiceCheck(
      "벽면 비상 인터폰 수화기 호출",
      "INT",
      11,
      () => {
        setFlags((f) => ({ ...f, warned_cabin: true }));
        addLog("비상 인터폰: 기관실 경고 청취 ('8호차로 오지 마라...')");
        setActiveModalText({
          title: SCENARIO_TEXT.text_4,
          body: SCENARIO_TEXT.text_5,
          tag: SCENARIO_TEXT.text_6,
          onClose: () => checkCar6Crisis(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 4) }));
        sfx.playHeartbeat();
        addLog("비상 인터폰 실패: 초고주파 하울링으로 이성 하락 (SAN -4)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_7,
          body: SCENARIO_TEXT.text_8,
          tag: SCENARIO_TEXT.text_9,
          onClose: () => checkCar6Crisis(nextAp)
        });
      }
    );
    break;

  case 'p3_valve':
    setFlags((f) => ({ ...f, valve_needs_wrench: true }));
    addLog("수동 밸브 확인: 회전 레버 손상. 육각 스패너 규격 확인.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_10,
      body: SCENARIO_TEXT.text_11,
      tag: SCENARIO_TEXT.text_12,
      onClose: () => checkCar6Crisis(nextAp)
    });
    break;

  case 'p4_shelf':
    setFlags((f) => ({ ...f, has_wrench: true }));
    setPlayer((p) => ({
      ...p,
      inventory: [...p.inventory, { ...ITEM_DB.wrench }]
    }));
    addLog("선반 수색: [휴대용 비상 스패너] 획득!");
    setActiveModalText({
      title: SCENARIO_TEXT.text_13,
      body: SCENARIO_TEXT.text_14,
      tag: SCENARIO_TEXT.text_15,
      onClose: () => checkCar6Crisis(nextAp)
    });
    break;

  case 'p5_door':
    openDiceCheck(
      "7호차 연결 통로 유리창 정숙 관찰",
      "DEX",
      12,
      () => {
        setFlags((f) => ({ ...f, seen_monster: true }));
        setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 2) }));
        addLog("7호차 관찰: 승객 가죽을 기워 입은 지네형 의태 괴물 목격.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_16,
          body: SCENARIO_TEXT.text_17,
          tag: SCENARIO_TEXT.text_18,
          onClose: () => checkCar6Crisis(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 6) }));
        sfx.playDanger();
        addLog("7호차 관찰 실패: 캔커피를 차서 소음 발생! 괴물이 유리를 긁음.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_19,
          body: SCENARIO_TEXT.text_20,
          tag: SCENARIO_TEXT.text_21,
          onClose: () => checkCar6Crisis(nextAp)
        });
      }
    );
    break;

  case 'p6_floor':
    addLog("바닥 얼룩 조사: 치이익 거품을 물며 녹는 금속. 강산성 소화액.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_22,
      body: SCENARIO_TEXT.text_23,
      tag: SCENARIO_TEXT.text_24,
      onClose: () => checkCar6Crisis(nextAp)
    });
    break;

  default:
    break;
}


};

// Stage 1 위기 체크 (AP 소진)
const checkCar6Crisis = (currentAp) => {
if (currentAp > 0) return;
triggerGlitch(700);
addLog("위기 발생: 행동력 소진! 7호차 격벽 파괴 및 허물 괴물 침입.");

setTimeout(() => {
  setActiveModalText({
    title: '7호차 격벽 붕괴',
    body: '문틈으로 승객의 허물을 뒤집어쓴 거대한 지네가 기어들어온다. 지금 탈출해야 한다.',
    image: SCENE_ASSETS.MIMIC,
    onClose: () => {
  const latest = getState();
  const hasWrench = latest.flags.has_wrench || latest.player.inventory.some((i) => i.id === 'wrench');

  if (!hasWrench) {
    // BAD END 1
    sfx.playDanger();
    setEndingData({
      type: 'BAD',
      cardId: 'BAD_1',
      title: SCENARIO_TEXT.text_25,
      desc: SCENARIO_TEXT.text_26
    });
    setActiveModalText(null);
    setStage('ENDING');
  } else {
    // 성공적 탈출 -> STAGE 2
    sfx.playSuccess();
    setActiveModalText({
      title: SCENARIO_TEXT.text_27,
      body: SCENARIO_TEXT.text_28,
      tag: SCENARIO_TEXT.text_29,
      onClose: () => {
        setActiveModalText(null);
        setStage('STAGE_2_TUNNEL');
        setAp(3);
        setExaminedPoints([]);
        addLog("Stage 2 진입: 6호선 선로 터널 300m 지점. 승강장 사다리를 향해 전진.");
      }
    });
  }
    },
  });
}, 400);


};


return { examineCar6Point };
}

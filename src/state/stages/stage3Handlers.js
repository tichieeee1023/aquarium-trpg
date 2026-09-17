import { ITEM_DB, ITEM_DATABASE } from '../../data/itemDB.js';
import { SCENARIO_TEXT } from '../../data/scenarioDB.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';

export function createStage3Handlers({ ap, examinedPoints, flags, setStage, setPlayer, setAp, setExaminedPoints, setActiveModalText, setFlags, setEndingData, sfx, addLog, openDiceCheck }) {
// ===========================================================================
// STAGE 3 : 의태된 환승역 (플랫폼) 핸들러 (AP 3 소모)
// ===========================================================================
const examinePlatformPoint = (pointId) => {
if (ap <= 0 || examinedPoints.includes(pointId)) return;
sfx.playClick();
const nextAp = ap - 1;
setAp(nextAp);
setExaminedPoints((prev) => [...prev, pointId]);

switch (pointId) {
  case 'm1_map':
    openDiceCheck(
      "초록색 2호선 아크릴 종합 노선도 정밀 판독",
      "INT",
      11,
      () => {
        setFlags((f) => ({ ...f, anomalyCount: f.anomalyCount + 1 }));
        addLog("위화감 포착(1): 노선도에 '유골', '연옥', '위산' 역명 인쇄 확인.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_57,
          illustration: ITEM_DATABASE.CLUE_MAP,
          body: SCENARIO_TEXT.text_58,
          tag: SCENARIO_TEXT.text_59,
          onClose: () => checkPlatformAnomalyNotice(nextAp)
        });
      },
      () => {
        addLog("노선도 관찰 실패: 피로로 인해 글자를 대충 훑고 넘김.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_60,
          body: SCENARIO_TEXT.text_61,
          tag: SCENARIO_TEXT.text_62,
          onClose: () => checkPlatformAnomalyNotice(nextAp)
        });
      }
    );
    break;

  case 'm2_vending':
    setFlags((f) => ({ ...f, anomalyCount: f.anomalyCount + 1 }));
    setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 4) }));
    sfx.playHeartbeat();
    addLog("위화감 포착(2): 자판기 잔돈 반환구 안쪽이 이빨 달린 붉은 점막으로 차 있음.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_63,
      body: SCENARIO_TEXT.text_64,
      tag: SCENARIO_TEXT.text_65,
      onClose: () => checkPlatformAnomalyNotice(nextAp)
    });
    break;

  case 'm3_mirror':
    setFlags((f) => ({ ...f, anomalyCount: f.anomalyCount + 1 }));
    setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 3) }));
    sfx.playHeartbeat();
    addLog("위화감 포착(3): 거울 속 내 잔상이 고개를 돌리지 않고 1초 늦게 웃음.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_66,
      body: SCENARIO_TEXT.text_67,
      tag: SCENARIO_TEXT.text_68,
      onClose: () => checkPlatformAnomalyNotice(nextAp)
    });
    break;

  case 'm4_office':
    setFlags((f) => ({ ...f, anomalyCount: f.anomalyCount + 1 }));
    setPlayer((p) => ({
      ...p,
      inventory: [...p.inventory, { ...ITEM_DB.master_key }]
    }));
    addLog("위화감 포착(4): 역무원 허물 가죽 발견 & [역무 마스터키] 획득.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_69,
      illustration: ITEM_DATABASE.CLUE_SKIN,
      body: SCENARIO_TEXT.text_70,
      tag: SCENARIO_TEXT.text_71,
      onClose: () => checkPlatformAnomalyNotice(nextAp)
    });
    break;

  case 'm5_breaker_gate':
    addLog("배전반 철문 관찰: 델리만쥬 냄새 없음. 차가운 오존향과 진짜 고압 전류 소리.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_72,
      body: SCENARIO_TEXT.text_73,
      tag: SCENARIO_TEXT.text_74,
      onClose: () => checkPlatformAnomalyNotice(nextAp)
    });
    break;

  default:
    break;
}


};

const checkPlatformAnomalyNotice = (_currentAp) => {
// 알림만 수행
};

// 3번 출구 vs 배전반 철문 중대 갈림길
const choosePlatformExit = (choiceType) => {
sfx.playClick();
if (choiceType === 'EXIT_3') {
if (flags.anomalyCount === 0) {
// BAD END 2 : 소화 완료
sfx.playDanger();
setActiveModalText({
  title: '가짜 3번 출구',
  body: '계단이 일렁이더니 붉은 식도로 변했다. 출구가 아니다. 역 전체가 입을 벌리고 있다.',
  image: SCENE_ASSETS.TRAP_EXIT,
  onClose: () => {
setEndingData({
type: 'BAD',
cardId: 'BAD_2',
title: SCENARIO_TEXT.text_75,
desc: SCENARIO_TEXT.text_76
});
setActiveModalText(null);
setStage('ENDING');
  },
});
} else {
// 위화감을 간파하여 멈춰 섬
sfx.playHeartbeat();
setActiveModalText({
title: SCENARIO_TEXT.text_77,
body: SCENARIO_TEXT.text_78,
tag: SCENARIO_TEXT.text_79,
onClose: () => proceedToStage4()
});
}
} else {
// 점검구 직행
proceedToStage4();
}
};

const proceedToStage4 = () => {
setActiveModalText(null);
setStage('STAGE_4_MALL');
setAp(3);
setExaminedPoints([]);
addLog("Stage 4 진입: 셔터 내린 지하 환승 상가. 마스터 제어실을 뚫고 환기탑으로 도달해야 함.");
};


return { examinePlatformPoint, choosePlatformExit };
}

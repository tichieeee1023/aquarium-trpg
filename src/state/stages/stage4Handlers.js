import { ITEM_DB } from '../../data/itemDB.js';
import { SCENARIO_TEXT } from '../../data/scenarioDB.js';

export function createStage4Handlers({ ap, examinedPoints, setStage, setPlayer, setAp, setTurnLimit, setExaminedPoints, setActiveModalText, setFlags, sfx, addLog, openDiceCheck }) {
// ===========================================================================
// STAGE 4 : 뒤틀린 지하 환승 상가 & 개찰구 핸들러 (AP 3 소모)
// ===========================================================================
const examineMallPoint = (pointId) => {
if (ap <= 0 || examinedPoints.includes(pointId)) return;
sfx.playClick();
const nextAp = ap - 1;
setAp(nextAp);
setExaminedPoints((prev) => [...prev, pointId]);

switch (pointId) {
  case 'c1_store':
    setFlags((f) => ({ ...f, has_master_card: true }));
    setPlayer((p) => ({
      ...p,
      hp: Math.min(p.maxHp, p.hp + 4),
      inventory: [...p.inventory, { ...ITEM_DB.master_card }]
    }));
    addLog("24시 편의점 수색: 에너지 드링크(HP +4) 및 [마스터 카드키] 획득.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_80,
      body: SCENARIO_TEXT.text_81,
      tag: SCENARIO_TEXT.text_82,
      onClose: () => checkMallAdvance(nextAp)
    });
    break;

  case 'c2_mannequin':
    openDiceCheck(
      "쇼윈도 정장 마네킹 무리 수색",
      "INT",
      12,
      () => {
        setPlayer((p) => ({
          ...p,
          san: Math.max(0, p.san - 2),
          inventory: [...p.inventory, { ...ITEM_DB.multitool }]
        }));
        addLog("마네킹 수색: 사람 손톱 간파, 주머니에서 [접이식 멀티툴] 수거.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_83,
          body: SCENARIO_TEXT.text_84,
          tag: SCENARIO_TEXT.text_85,
          onClose: () => checkMallAdvance(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 4) }));
        sfx.playDanger();
        addLog("마네킹 피격: 뼈마디를 꺾은 손가락에 목덜미를 잡힘 (HP -4)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_86,
          body: SCENARIO_TEXT.text_87,
          tag: SCENARIO_TEXT.text_88,
          onClose: () => checkMallAdvance(nextAp)
        });
      }
    );
    break;

  case 'c3_cctv':
    openDiceCheck(
      "CCTV 관제 모니터실 환기탑 전원 배선 분석",
      "INT",
      13,
      () => {
        setFlags((f) => ({ ...f, knows_fan_circuit: true }));
        addLog("CCTV 분석 성공: 지상 환기탑 거대 배기팬 전원 차단기 위치 포착!");
        setActiveModalText({
          title: SCENARIO_TEXT.text_89,
          body: SCENARIO_TEXT.text_90,
          tag: SCENARIO_TEXT.text_91,
          onClose: () => checkMallAdvance(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 5) }));
        sfx.playHeartbeat();
        addLog("CCTV 분석 실패: 화면에 내 등 뒤에 서 있는 검은 형체 노출 (SAN -5)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_92,
          body: SCENARIO_TEXT.text_93,
          tag: SCENARIO_TEXT.text_94,
          onClose: () => checkMallAdvance(nextAp)
        });
      }
    );
    break;

  case 'c4_gate':
    addLog("개찰구 통과: 안전 우회로 확인.");
    setActiveModalText({
      title: SCENARIO_TEXT.text_95,
      body: SCENARIO_TEXT.text_96,
      tag: SCENARIO_TEXT.text_97,
      onClose: () => checkMallAdvance(nextAp)
    });
    break;

  default:
    break;
}


};

const checkMallAdvance = (currentAp) => {
if (currentAp > 0) return;
addLog("Stage 4 클리어: 역무 제어실 방화문 돌파 -> 지상 환기탑 배전실 진입.");
setActiveModalText({
title: SCENARIO_TEXT.text_98,
body: SCENARIO_TEXT.text_99,
tag: SCENARIO_TEXT.text_100,
onClose: () => {
setActiveModalText(null);
setStage('STAGE_5_VENT');
setTurnLimit(3);
addLog("Stage 5 진입: 수직 환기탑 갱도. 방화문 붕괴까지 3턴 남음.");
}
});
};


return { examineMallPoint };
}

import { ITEM_DB } from '../../data/itemDB.js';
import { SCENARIO_TEXT } from '../../data/scenarioDB.js';

export function createStage2Handlers({ ap, examinedPoints, flags, setStage, setPlayer, setAp, setExaminedPoints, setActiveModalText, setFlags, sfx, addLog, openDiceCheck }) {
// ===========================================================================
// STAGE 2 : 침묵의 선로 터널 핸들러 (AP 3 소모)
// ===========================================================================
const examineTunnelPoint = (pointId) => {
if (ap <= 0 || examinedPoints.includes(pointId)) return;
sfx.playClick();
const nextAp = ap - 1;
setAp(nextAp);
setExaminedPoints((prev) => [...prev, pointId]);

if (!flags.has_lantern) {
  setPlayer((p) => ({ ...p, battery: Math.max(0, p.battery - 6) }));
}

switch (pointId) {
  case 't1_recess':
    openDiceCheck(
      "벽면 비상 대피 홈 수색",
      "INT",
      11,
      () => {
        setFlags((f) => ({ ...f, has_lantern: true }));
        setPlayer((p) => ({
          ...p,
          inventory: [...p.inventory, { ...ITEM_DB.lantern }]
        }));
        addLog("대피 홈 수색 성공: [방수 충전식 안전 랜턴] 획득! 배터리 압박 해제.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_30,
          body: SCENARIO_TEXT.text_31,
          tag: SCENARIO_TEXT.text_32,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 3) }));
        sfx.playDanger();
        addLog("대피 홈 수색 실패: 산성 점액 유충에 쏘임 (HP -3)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_33,
          body: SCENARIO_TEXT.text_34,
          tag: SCENARIO_TEXT.text_35,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      }
    );
    break;

  case 't2_phone':
    openDiceCheck(
      "주황색 선로 비상 전화기 다이얼 호출",
      "WILL",
      11,
      () => {
        setFlags((f) => ({ ...f, knows_vent_shaft: true }));
        addLog("비상 전화기: 관제소 ARS ('지상 환기탑 외 모든 일반 출구 차단').");
        setActiveModalText({
          title: SCENARIO_TEXT.text_36,
          body: SCENARIO_TEXT.text_37,
          tag: SCENARIO_TEXT.text_38,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, san: Math.max(0, p.san - 4) }));
        sfx.playHeartbeat();
        addLog("비상 전화기 실패: 수화기에서 피 냄새 진물과 저주파 귓속말 (SAN -4)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_39,
          body: SCENARIO_TEXT.text_40,
          tag: SCENARIO_TEXT.text_41,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      }
    );
    break;

  case 't3_cart':
    openDiceCheck(
      "보수용 트로리 카트 자재 수색",
      "STR",
      12,
      () => {
        setFlags((f) => ({ ...f, has_prybar: true }));
        setPlayer((p) => ({
          ...p,
          inventory: [...p.inventory, { ...ITEM_DB.prybar }]
        }));
        addLog("손수레 수색 성공: [공사용 쇠지렛대(빠루)] 획득!");
        setActiveModalText({
          title: SCENARIO_TEXT.text_42,
          body: SCENARIO_TEXT.text_43,
          tag: SCENARIO_TEXT.text_44,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      },
      () => {
        sfx.playDanger();
        addLog("손수레 수색 실패: 철근 붕괴 굉음! 괴물이 추격해 오기 시작함.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_45,
          body: SCENARIO_TEXT.text_46,
          tag: SCENARIO_TEXT.text_47,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      }
    );
    break;

  case 't4_rail':
    openDiceCheck(
      "750V 고전압 공급 레일(제3궤조) 신중 도약",
      "DEX",
      13,
      () => {
        addLog("제3궤조 도약 성공: 스파크를 피해 안전 발판에 안착.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_48,
          body: SCENARIO_TEXT.text_49,
          tag: SCENARIO_TEXT.text_50,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 6) }));
        sfx.playDanger();
        addLog("제3궤조 접촉: 푸른 번개 스파크 감전! (HP -6)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_51,
          body: SCENARIO_TEXT.text_52,
          tag: SCENARIO_TEXT.text_53,
          onClose: () => checkTunnelAdvance(nextAp)
        });
      }
    );
    break;

  default:
    break;
}


};

const checkTunnelAdvance = (currentAp) => {
if (currentAp > 0) return;
addLog("Stage 2 클리어: 플랫폼 점검 사다리를 타고 신도림역 승강장으로 탈출.");
setActiveModalText({
title: SCENARIO_TEXT.text_54,
body: SCENARIO_TEXT.text_55,
tag: SCENARIO_TEXT.text_56,
onClose: () => {
setActiveModalText(null);
setStage('STAGE_3_PLATFORM');
setAp(3);
setExaminedPoints([]);
addLog("Stage 3 진입: 2호선-1호선 신도림 환승역 플랫폼. 은은한 델리만쥬 냄새와 형광등 불빛.");
}
});
};


return { examineTunnelPoint };
}

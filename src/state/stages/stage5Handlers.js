import { SCENARIO_TEXT } from '../../data/scenarioDB.js';

export function createStage5Handlers({ player, turnLimit, flags, setStage, setPlayer, setTurnLimit, setActiveModalText, setFlags, setEndingData, sfx, addLog, openDiceCheck }) {
// ===========================================================================
// STAGE 5 : 배전실 & 수직 환기 갱도 핸들러 (타임어택 3턴)
// ===========================================================================
const handleStage5Action = (approachType) => {
if (turnLimit <= 0) return;
sfx.playClick();

if (approachType === 'TOOL_WRENCH') {
  // 스패너 프리패스
  setFlags((f) => ({ ...f, fanStopped: true }));
  addLog("스패너 사용: 메인 볼트를 풀어 환풍기 무소음 정지 완료! (턴 소모 없음)");
  setActiveModalText({
    title: SCENARIO_TEXT.text_101,
    body: SCENARIO_TEXT.text_102,
    tag: SCENARIO_TEXT.text_103,
    onClose: () => setActiveModalText(null)
  });
  return;
}

const nextTurns = turnLimit - 1;
setTurnLimit(nextTurns);

switch (approachType) {
  case 'INT':
    openDiceCheck(
      "고압 배전반 퓨즈 차단기 단선",
      "INT",
      flags.knows_fan_circuit ? 9 : 12,
      () => {
        setFlags((f) => ({ ...f, fanStopped: true }));
        addLog("지능 판정 성공: 배기팬 회로 차단 성공. 날개 정지.");
        setActiveModalText({
          title: SCENARIO_TEXT.text_104,
          body: SCENARIO_TEXT.text_105,
          tag: SCENARIO_TEXT.text_106,
          onClose: () => setActiveModalText(null)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 5) }));
        sfx.playDanger();
        addLog("지능 판정 실패: 누전 차단기 폭발 감전 (HP -5, 턴 1 소모)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_107,
          body: SCENARIO_TEXT.text_108,
          tag: SCENARIO_TEXT.text_109,
          onClose: () => checkVentFailure(nextTurns)
        });
      }
    );
    break;

  case 'STR':
    openDiceCheck(
      "쇠지렛대(빠루)로 회전 기어 축 강제 파괴",
      "STR",
      13,
      () => {
        setFlags((f) => ({ ...f, fanStopped: true }));
        addLog("완력 판정 성공: 기어 축 파괴로 날개 정지 (사용 도구 파손).");
        setActiveModalText({
          title: SCENARIO_TEXT.text_110,
          body: SCENARIO_TEXT.text_111,
          tag: SCENARIO_TEXT.text_112,
          onClose: () => setActiveModalText(null)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 4) }));
        sfx.playDanger();
        addLog("완력 판정 실패: 반동으로 튕겨 나가며 어깨 탈구 (HP -4, 턴 1 소모)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_113,
          body: SCENARIO_TEXT.text_114,
          tag: SCENARIO_TEXT.text_115,
          onClose: () => checkVentFailure(nextTurns)
        });
      }
    );
    break;

  case 'DEX':
    openDiceCheck(
      "회전 날개 틈새로 칼날 타이밍 도약",
      "DEX",
      14,
      () => {
        setFlags((f) => ({ ...f, fanStopped: true }));
        addLog("기교 판정 성공: 찰나의 틈새로 몸을 던져 사다리 착지!");
        setActiveModalText({
          title: SCENARIO_TEXT.text_116,
          body: SCENARIO_TEXT.text_117,
          tag: SCENARIO_TEXT.text_118,
          onClose: () => setActiveModalText(null)
        });
      },
      () => {
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 7) }));
        sfx.playDanger();
        addLog("기교 판정 실패: 회전 날개 끝에 스쳐 깊은 열상 (HP -7)");
        setActiveModalText({
          title: SCENARIO_TEXT.text_119,
          body: SCENARIO_TEXT.text_120,
          tag: SCENARIO_TEXT.text_121,
          onClose: () => checkVentFailure(nextTurns)
        });
      }
    );
    break;

  default:
    break;
}


};

const checkVentFailure = (turns) => {
if (turns <= 0 && !flags.fanStopped) {
triggerBadEnd3();
}
};

// 최종 관문 : 맨홀 뚜껑 개방
const handlePushManhole = () => {
openDiceCheck(
"빗물 쏟아지는 주철 맨홀 뚜껑 강제 개방",
"STR",
11,
() => {
sfx.playSuccess();
// 최종 엔딩 분기
if (player.hp >= 12 && player.san > 10) {
// TRUE END
setEndingData({
type: 'TRUE',
cardId: 'TRUE',
title: SCENARIO_TEXT.text_122,
desc: SCENARIO_TEXT.text_123
});
} else {
// NORMAL END
setEndingData({
type: 'NORMAL',
cardId: 'NORMAL',
title: SCENARIO_TEXT.text_124,
desc: SCENARIO_TEXT.text_125
});
}
setStage('ENDING');
},
() => {
// 실패 시
setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - 4) }));
setTurnLimit((t) => t - 1);
sfx.playDanger();
addLog("맨홀 개방 실패: 뚜껑 위에 장애물이 얹혀 있어 꿈쩍 않음 (HP -4)");
setActiveModalText({
title: SCENARIO_TEXT.text_126,
body: SCENARIO_TEXT.text_127,
tag: SCENARIO_TEXT.text_128,
onClose: () => {
if (turnLimit <= 1) {
triggerBadEnd3();
} else {
setActiveModalText(null);
}
}
});
}
);
};

const triggerBadEnd3 = () => {
sfx.playDanger();
setEndingData({
type: 'BAD',
cardId: 'BAD_3',
title: SCENARIO_TEXT.text_129,
desc: SCENARIO_TEXT.text_130
});
setStage('ENDING');
};


return { handleStage5Action, handlePushManhole };
}

import { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { gameReducer } from '../state/gameReducer.js';
import { GAME_ACTIONS } from '../state/gameActions.js';
import { createInitialGameState } from '../state/initialGameState.js';
import { createStageHandlers } from '../state/stageHandlers.js';
import { executeD20Check } from '../utils/diceEngine.js';
import { advanceStoryModal } from '../utils/storyFlow.js';

export function useGameEngine(sfx) {
const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
const stateRef = useRef(state);
useLayoutEffect(() => { stateRef.current = state; }, [state]);
const getState = useCallback(() => stateRef.current, []);
const { player, ap, turnLimit, examinedPoints, flags, diceModal } = state;
const [isGlitching, setIsGlitching] = useState(false);
const resolvedStories = useRef(new WeakSet());
const diceBusy = useRef(false);
const advanceAfterRoll = useRef(false);
const resolvedDiceResults = useRef(new WeakSet());
const setStage = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'stage', value });
const setPlayer = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'player', value });
const setAp = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'ap', value });
const setTurnLimit = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'turnLimit', value });
const setExaminedPoints = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'examinedPoints', value });
const setActiveModalText = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'activeModalText', value });
const setFlags = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'flags', value });
const setLogs = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'logs', value });
const setDiceModal = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'diceModal', value });
const setEndingData = (value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field: 'endingData', value });
// 로그 추가 유틸리티
const addLog = (msg) => {
const timeStr = new Date().toTimeString().split(' ')[0];
 setLogs((prev) => [`[${timeStr}] ${msg}`, ...prev.slice(0, 19)]);
};

// 글리치 트리거
const triggerGlitch = (duration = 300) => {
 sfx.playGlitch();
setIsGlitching(true);
setTimeout(() => setIsGlitching(false), duration);
};

// ===========================================================================
// D20 주사위 판정 실행 로직
// ===========================================================================
const openDiceCheck = (title, statKey, dc, onSuccess, onFail) => {
sfx.playClick();
advanceAfterRoll.current = false;
setDiceModal({
isOpen: true,
kind: 'CHECK',
title,
statKey,
dc,
rolling: false,
result: null,
onSuccess,
onFail
});
};

const openConditionDice = (onResolve) => {
  advanceAfterRoll.current = false;
  setDiceModal({ isOpen: true, kind: 'CONDITION', title: '오늘의 야근 컨디션', statKey: 'LUK', dc: 0,
    rolling: false, result: null, onResolve });
};

const resolveDiceResult = (modal, result) => {
  if (resolvedDiceResults.current.has(result)) return;
  resolvedDiceResults.current.add(result);
  setDiceModal((prev) => ({ ...prev, isOpen: false }));
  if (modal.kind === 'CONDITION') modal.onResolve?.(result.rawDice);
  else (result.isSuccess ? modal.onSuccess : modal.onFail)?.();
};

const advanceStory = () => {
  const modal = getState().activeModalText;
  if (!modal || resolvedStories.current.has(modal)) return;
  resolvedStories.current.add(modal);
  advanceStoryModal(modal, setActiveModalText);
};

const rollD20Check = () => {
if (!diceModal.isOpen || diceModal.rolling || diceModal.result || diceBusy.current) return;
diceBusy.current = true;
sfx.playDiceRoll();
setDiceModal((prev) => ({ ...prev, rolling: true, result: null }));

setTimeout(() => {
  const statVal = player.stats[diceModal.statKey] || 10;
  
  // 특성 보너스 체크
  let traitBonus = 0;
  if (player.trait.includes('가벼운 발걸음') && (diceModal.statKey === 'DEX')) traitBonus += 2;
  if (player.trait.includes('카페인 중독') && (diceModal.statKey === 'DEX')) traitBonus -= 1;
  if (flags.knows_fan_circuit && diceModal.title.includes('환풍기')) traitBonus += 3;

  const resultObj = executeD20Check(diceModal.kind === 'CONDITION' ? 10 : statVal, diceModal.dc, diceModal.kind === 'CONDITION' ? 0 : traitBonus);
  if (resultObj.isSuccess) sfx.playSuccess();
  else sfx.playDanger();

  setDiceModal((prev) => ({
    ...prev,
    rolling: false,
    result: resultObj
  }));
  diceBusy.current = false;
  if (advanceAfterRoll.current) {
    advanceAfterRoll.current = false;
    resolveDiceResult(diceModal, resultObj);
  }
}, 2200);


};

const confirmDiceResult = () => {
const modal = getState().diceModal;
if (!modal.result || diceBusy.current) return;
resolveDiceResult(modal, modal.result);
};

const dismissDice = () => {
  const modal = getState().diceModal;
  if (modal.result) confirmDiceResult();
  else {
    advanceAfterRoll.current = true;
    if (!diceBusy.current) rollD20Check();
  }
};


const context = { player, ap, turnLimit, examinedPoints, flags, setStage, setPlayer, setAp, setTurnLimit, setExaminedPoints, setActiveModalText, setFlags, setLogs, setEndingData, sfx, addLog, triggerGlitch, openDiceCheck, openConditionDice, dispatch, getState };
const handlers = Object.fromEntries([
  'handleSelectArchetype', 'handleRollCondition', 'examineCar6Point',
  'examineTunnelPoint', 'examinePlatformPoint', 'choosePlatformExit',
  'examineMallPoint', 'handleStage5Action', 'handlePushManhole', 'handleRestart',
].map((name) => [name, (...args) => createStageHandlers(context)[name](...args)]));
return { ...state, ...handlers, isGlitching, rollD20Check, confirmDiceResult, dismissDice, advanceStory, addLog };
}

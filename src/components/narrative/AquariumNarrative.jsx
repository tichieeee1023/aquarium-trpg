import { SCENARIOS } from '../../data/game/scenarios.js';
import SurveyView from './SurveyView.jsx';
import SceneOverview from './SceneOverview.jsx';
import ConditionCheckPanel from './ConditionCheckPanel.jsx';
import StageExploration from './StageExploration.jsx';
import FinalEscapePanel from './FinalEscapePanel.jsx';

export default function AquariumNarrative(game) {
  const { stage, state, ap, player } = game;
  const scenario = SCENARIOS[stage];
  const busy = Boolean(game.activeModalText || game.diceModal.isOpen);

  return (
    <main className="game-narrative bg-[#0a0c12] p-6 flex flex-col overflow-y-auto">
      {stage !== 'STAGE_5_DOME' && <SceneOverview key={stage} stage={stage} currentBg={state.currentBg} />}
      <SurveyView stage={stage} handleSelectArchetype={game.handleSelectArchetype} />
      {stage === 'DICE_CONDITION' && <ConditionCheckPanel onRoll={game.handleRollCondition} />}
      {scenario?.points && <StageExploration scenario={scenario} state={state} ap={ap} busy={busy} onExamine={game.handleExamine} onAdvance={game.handleStageResolve} />}
      {stage === 'STAGE_5_DOME' && <FinalEscapePanel scenario={scenario} player={player} busy={busy} rolling={game.diceModal.rolling} onBreak={game.handleStage5Break} />}
    </main>
  );
}
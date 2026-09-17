import { useCallback, useState } from 'react';
import { useAudioSynth } from './hooks/useAudioSynth.js';
import { useGameEngine } from './hooks/useGameEngine.js';
import MainLayout from './components/layout/MainLayout.jsx';
import GameHeader from './components/layout/GameHeader.jsx';
import CharacterSheet from './components/sheet/CharacterSheet.jsx';
import GameNarrative from './components/narrative/GameNarrative.jsx';
import GameConsole from './components/console/GameConsole.jsx';
import DiceModal from './components/modal/DiceModal.jsx';
import StoryDisplay from './components/narrative/StoryDisplay.jsx';
import EndingModal from './components/modal/EndingModal.jsx';
import IntroScreen from './components/narrative/IntroScreen.jsx';
import UtilityModal from './components/modal/UtilityModal.jsx';
import { useGameSettings } from './hooks/useGameSettings.js';

export default function App() {
  const sfx = useAudioSynth();
  const game = useGameEngine(sfx);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [utility, setUtility] = useState(null);
  const { settings, updateSettings } = useGameSettings();
  const closeUtility = useCallback(() => setUtility(null), []);
  const toggleSound = () => {
    sfx.setEnabled(!soundEnabled);
    setSoundEnabled(!soundEnabled);
  };
  const restart = () => { game.handleRestart(); setShowIntro(true); };
  return (
    <MainLayout isGlitching={game.isGlitching && !settings.disableEffects}>
      {showIntro ? <IntroScreen onStart={() => { sfx.playClick(); setShowIntro(false); }} onSettings={() => setUtility('settings')} onHelp={() => setUtility('help')} /> : <>
      <GameHeader {...game} soundEnabled={soundEnabled} toggleSound={toggleSound} onSettings={() => setUtility('settings')} onHelp={() => setUtility('help')} />
      {game.stage === 'ENDING' ? (
        <EndingModal {...game} handleRestart={restart} />
      ) : <div className="game-columns flex-1 flex overflow-hidden">
        <CharacterSheet player={game.player} />
        <GameNarrative {...game} />
        <GameConsole stage={game.stage} logs={game.logs} />
      </div>}
      <DiceModal {...game} disableEffects={settings.disableEffects} />
      <StoryDisplay activeModalText={game.activeModalText} onAdvance={game.advanceStory} />
      </>}
      {utility && <UtilityModal kind={utility} settings={settings} updateSettings={updateSettings} onClose={closeUtility} />}
    </MainLayout>
  );
}

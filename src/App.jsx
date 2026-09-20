import { useCallback, useEffect, useState } from 'react';
import { useAudioSynth } from './hooks/useAudioSynth.js';
import { useAquariumGame } from './hooks/useAquariumGame.js';
import { useGameSettings } from './hooks/useGameSettings.js';
import { useEndingCollection } from './hooks/useEndingCollection.js';

import MainLayout from './components/layout/MainLayout.jsx';
import GameHeader from './components/layout/GameHeader.jsx';
import CharacterSheet from './components/sheet/CharacterSheet.jsx';
import AquariumNarrative from './components/narrative/AquariumNarrative.jsx';
import GameConsole from './components/console/GameConsole.jsx';
import DiceModal from './components/modal/DiceModal.jsx';
import StoryDisplay from './components/narrative/StoryDisplay.jsx';
import EndingModal from './components/modal/EndingModal.jsx';
import IntroScreen from './components/narrative/IntroScreen.jsx';
import OpeningSequence from './components/narrative/OpeningSequence.jsx';
import UtilityModal from './components/modal/UtilityModal.jsx';
import CollectionModal from './components/modal/CollectionModal.jsx';
import MobileInventoryDock from './components/sheet/MobileInventoryDock.jsx';
import CreditsModal from './components/modal/CreditsModal.jsx';

import { SCENARIOS } from './game/index.js';
import { ENDING_DEFINITIONS } from './data/endingDB.js';
import { getRelevantItemIds } from './utils/itemRelevance.js';

const ENDING_COUNT = Object.keys(ENDING_DEFINITIONS).length;

export default function App() {
  const sfx = useAudioSynth();

  const {
    settings,
    updateSettings
  } = useGameSettings();

  const game = useAquariumGame(
    sfx,
    settings
  );

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [showIntro, setShowIntro] =
    useState(true);

  const [hasActiveRun, setHasActiveRun] =
    useState(false);

  const [showOpening, setShowOpening] =
    useState(false);

  const [utility, setUtility] =
    useState(null);

  const [celebrationActive, setCelebrationActive] =
    useState(false);

  const {
    collected,
    unlockAllEndings
  } = useEndingCollection(
    game.endingData
  );

  const collectionUnlocked =
    collected.length > 0;

  const collectionComplete =
    collected.length === ENDING_COUNT;

  const highlightedItemIds =
    settings.easyMode
      ? getRelevantItemIds(game.stage)
      : [];

  const closeUtility =
    useCallback(
      () => setUtility(null),
      []
    );

  const openCollection = () => {
    if (collectionUnlocked) {
      setUtility('collection');
    }
  };

  // =========================================================
  // DEV 전용 엔딩 컬렉션 해금
  // Ctrl + Shift + F10
  // =========================================================

  useEffect(() => {
    if (
      !import.meta.env.DEV ||
      showOpening ||
      (!showIntro &&
        game.stage !== 'SURVEY') ||
      utility
    ) {
      return;
    }

    const handleDeveloperKey = event => {
      if (
        event.repeat ||
        event.isComposing ||
        document.querySelector(
          '[role="dialog"]'
        ) ||
        event.target?.closest(
          'input, textarea, select, [contenteditable="true"]'
        )
      ) {
        return;
      }

      if (
        event.code !== 'F10' ||
        !event.ctrlKey ||
        !event.shiftKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      event.preventDefault();

      unlockAllEndings();
      setUtility('collection');
    };

    window.addEventListener(
      'keydown',
      handleDeveloperKey
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleDeveloperKey
      );
  }, [
    showIntro,
    showOpening,
    game.stage,
    utility,
    unlockAllEndings
  ]);

  // =========================================================
  // SOUND
  // =========================================================

  const toggleSound = () => {
    sfx.setEnabled(
      !soundEnabled
    );

    setSoundEnabled(
      !soundEnabled
    );
  };

  // =========================================================
  // OPENING
  // =========================================================

  const completeOpening = () => {
    sfx.playClick();

    setShowOpening(false);
  };

  // =========================================================
  // RESTART
  // =========================================================

  const restart = () => {
    game.handleRestart();

    setHasActiveRun(false);
    setShowOpening(false);
    setShowIntro(true);
  };

  const replayFromSettings = () => {
    game.handleRestart();
    setHasActiveRun(false);
    setUtility(null);
    setShowOpening(false);
    setShowIntro(true);
  };

  const returnHome = () => {
    setUtility(null);
    setShowOpening(false);
    setShowIntro(true);
  };

  // =========================================================
  // SECRET ENDING → HOME CELEBRATION
  // =========================================================

  const completeSecretEnding = () => {
    setUtility(null);

    game.handleRestart();

    setHasActiveRun(false);
    setShowOpening(false);
    setShowIntro(true);
    setCelebrationActive(true);

    sfx.playFinalFanfare();
  };

  // =========================================================
  // ITEM
  // =========================================================

  const canUseItems =
    game.stage.startsWith(
      'STAGE_'
    ) &&
    !game.activeModalText &&
    !game.diceModal.isOpen &&
    !game.diceModal.rolling;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <MainLayout>

      {/* ================================================
          전체 화면 시네마틱 효과
          전기 섬광 / 암전 / 냉기 / 돔 파쇄 / 지상 생환
      ================================================= */}

      {game.screenEffect &&
        !settings.disableEffects && (
          <div
            key={game.screenEffect.key}
            className={`screen-effect screen-effect--${game.screenEffect.type}`}
            aria-hidden="true"
          />
        )}

      {/* ================================================
          INTRO
      ================================================= */}

      {showIntro ? (
        <IntroScreen
          onStart={() => {
            sfx.playClick();

            setHasActiveRun(true);
            setShowIntro(false);
            setShowOpening(true);
          }}
          onContinue={() => {
            sfx.playClick();
            setShowOpening(false);
            setShowIntro(false);
          }}
          hasActiveRun={hasActiveRun}
          onSettings={() =>
            setUtility(
              'settings'
            )
          }
          onHelp={() =>
            setUtility('help')
          }
          onCollection={
            openCollection
          }
          collectionUnlocked={
            collectionUnlocked
          }
          collectionComplete={
            collectionComplete
          }
          disableEffects={
            settings.disableEffects
          }
          celebrationActive={
            celebrationActive
          }
          onCelebrationFinish={() =>
            setCelebrationActive(false)
          }
        />
      ) : showOpening ? (

        /* ==============================================
            OPENING
        ============================================== */

        <OpeningSequence
          onComplete={
            completeOpening
          }
          onSkip={
            completeOpening
          }
        />

      ) : (
        <>

          {/* ============================================
              HEADER
          ============================================ */}

          <GameHeader
            {...game}
            location={
              SCENARIOS[
                game.stage
              ]?.title.split(
                ' — '
              )[1]
            }
            waterLevel={
              game.state
                .waterLevel
            }
            soundEnabled={
              soundEnabled
            }
            toggleSound={
              toggleSound
            }
            onSettings={() =>
              setUtility(
                'settings'
              )
            }
            onHelp={() =>
              setUtility(
                'help'
              )
            }
            onHint={() =>
              setUtility(
                'hint'
              )
            }
          />

          {/* ============================================
              ENDING
          ============================================ */}

          {game.stage ===
          'ENDING' ? (
            <EndingModal
              key={
                game
                  .endingData
                  .id
              }
              {...game}
              handleRestart={
                restart
              }
              onCollection={
                openCollection
              }
              collectedCount={
                collected.length
              }
              totalEndingCount={
                ENDING_COUNT
              }
              collectionComplete={
                collectionComplete
              }
              disableEffects={
                settings
                  .disableEffects
              }
            />
          ) : (

            /* ==========================================
                GAME MAIN
            ========================================== */

            <div className="game-columns flex-1 flex overflow-hidden">

              <CharacterSheet
                player={
                  game.player
                }
                handleUseItem={
                  game.handleUseItem
                }
                canUseItems={
                  canUseItems
                }
                highlightedItemIds={
                  highlightedItemIds
                }
                discardItem={
                  game.discardItem
                }
              />

              <AquariumNarrative
                {...game}
              />

              <GameConsole
                stage={
                  game.stage
                }
                logs={
                  game.state
                    .logs
                }
                onSaveLog={
                  game.handleDownloadLog
                }
              />

              {game.stage.startsWith('STAGE_') && (
                <MobileInventoryDock
                  player={game.player}
                  handleUseItem={game.handleUseItem}
                  canUseItems={canUseItems}
                  highlightedItemIds={highlightedItemIds}
                />
              )}

            </div>
          )}

          {/* ============================================
              DICE
          ============================================ */}

          <DiceModal
            {...game}
            disableEffects={
              settings
                .disableEffects
            }
            skipDiceAnimation={
              settings
                .skipDiceAnimation
            }
          />

          {/* ============================================
              STORY
          ============================================ */}

          <StoryDisplay
            activeModalText={
              game.activeModalText
            }
            onAdvance={
              game.advanceStory
            }
          />

        </>
      )}

      {/* ================================================
          UTILITY / COLLECTION
      ================================================= */}

      {utility === 'credits' ? (
        <CreditsModal onClose={closeUtility} />
      ) : utility === 'collection' ? (
        collectionUnlocked && (
          <CollectionModal
            collected={collected}
            onClose={closeUtility}
            onSecretComplete={completeSecretEnding}
          />
        )
      ) : utility ? (
        <UtilityModal
          kind={utility}
          stage={game.stage}
          settings={settings}
          updateSettings={updateSettings}
          onCredits={() => setUtility('credits')}
          onClose={closeUtility}
          canReplay={hasActiveRun && game.stage !== 'ENDING'}
          onReplay={replayFromSettings}
          onHome={returnHome}
        />
      ) : null}
    </MainLayout>
  );
}

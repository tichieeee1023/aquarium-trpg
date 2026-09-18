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

import { SCENARIOS } from './aquariumEngine.js';
import { getRelevantItemIds } from './utils/itemRelevance.js';

const OPENING_KEY = 'aquarium-opening-seen-v1';

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

  const [showOpening, setShowOpening] =
    useState(false);

  const [hasSeenOpening, setHasSeenOpening] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            OPENING_KEY
          ) === '1'
        );
      } catch {
        return false;
      }
    });

  const [utility, setUtility] =
    useState(null);

  const {
    collected,
    unlockAllEndings
  } = useEndingCollection(
    game.endingData
  );

  const collectionUnlocked =
    collected.length > 0;

  const collectionComplete =
    collected.length === 7;

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
    try {
      localStorage.setItem(
        OPENING_KEY,
        '1'
      );
    } catch {}

    setHasSeenOpening(true);

    sfx.playClick();

    setShowOpening(false);
  };

  // =========================================================
  // RESTART
  // =========================================================

  const restart = () => {
    game.handleRestart();

    setShowOpening(false);
    setShowIntro(true);
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
          전체 화면 전기 섬광 연출
          useAquariumGame의 screenFlash가 true일 때 표시
      ================================================= */}

      {game.screenFlash &&
        !settings.disableEffects && (
          <div
            className="screen-flash"
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

            setShowIntro(false);

            setShowOpening(
              !hasSeenOpening
            );
          }}
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

      {utility ===
      'collection' ? (
        collectionUnlocked && (
          <CollectionModal
            collected={
              collected
            }
            onClose={
              closeUtility
            }
          />
        )
      ) : (
        utility && (
          <UtilityModal
            kind={
              utility
            }
            stage={
              game.stage
            }
            settings={
              settings
            }
            updateSettings={
              updateSettings
            }
            onClose={
              closeUtility
            }
          />
        )
      )}

    </MainLayout>
  );
}
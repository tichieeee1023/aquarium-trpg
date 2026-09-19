import { useState } from 'react';
import { SCENARIOS } from '../../data/game/scenarios.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';

export default function SceneOverview({ stage, currentBg }) {
  const [expanded, setExpanded] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const scene = SCENE_ASSETS[stage];
  if (!scene) return null;
  const toggleOverview = (event) => {
    const isOpen = event.currentTarget.open;
    setExpanded(isOpen);
    if (!isOpen) setDescriptionExpanded(false);
  };
  return (
    <details className="scene-overview" open={expanded} onToggle={toggleOverview}>
      <summary>장면 · 상황 설명 <span>{expanded ? '접기 −' : '펼치기 +'}</span></summary>
      <div className="scene-overview-content">
        <img src={currentBg || scene.src} alt={scene.alt} />
        <details className="scene-description" open={descriptionExpanded} onToggle={(event) => setDescriptionExpanded(event.currentTarget.open)}>
          <summary>상황 설명 읽기 <span>{descriptionExpanded ? '접기 −' : '펼치기 +'}</span></summary>
          <p>{SCENARIOS[stage]?.sub}</p>
        </details>
      </div>
    </details>
  );
}

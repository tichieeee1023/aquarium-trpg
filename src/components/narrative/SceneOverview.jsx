import { useEffect, useState } from 'react';
import { SCENARIOS } from '../../aquariumEngine.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';

const DESKTOP_QUERY = '(min-width: 1201px) and (min-height: 701px)';

export default function SceneOverview({ stage, currentBg }) {
  const [expanded, setExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  const [descriptionExpanded, setDescriptionExpanded] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  const scene = SCENE_ASSETS[stage];
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const updateLayout = () => {
      setIsDesktop(media.matches);
      if (media.matches) {
        setExpanded(true);
        setDescriptionExpanded(true);
      }
    };
    updateLayout();
    media.addEventListener('change', updateLayout);
    return () => media.removeEventListener('change', updateLayout);
  }, []);
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
        {isDesktop ? <div className="scene-description scene-description-static"><p>{SCENARIOS[stage]?.sub}</p></div> : <details className="scene-description" open={descriptionExpanded} onToggle={(event) => setDescriptionExpanded(event.currentTarget.open)}>
          <summary>상황 설명 읽기 <span>{descriptionExpanded ? '접기 −' : '펼치기 +'}</span></summary>
          <p>{SCENARIOS[stage]?.sub}</p>
        </details>}
      </div>
    </details>
  );
}

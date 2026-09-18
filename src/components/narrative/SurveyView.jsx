import { ARCHETYPES } from '../../data/surveyDB.js';
import { useCallback, useState } from 'react';
import DialogFrame from '../modal/DialogFrame.jsx';

export default function SurveyView({ stage, handleSelectArchetype }) {
  const [gender, setGender] = useState('M');
  const [preview, setPreview] = useState(null);
  const closePreview = useCallback(() => setPreview(null), []);
  return (
stage === 'SURVEY' && (
          <div className="space-y-4 my-auto">
            <div className="border-l-4 border-amber-500 pl-3 py-1">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">[ 돌발 퀘스트 : 캐릭터 생성 ]</div>
              <h2 className="text-lg font-bold text-neutral-100">막차에 오른 당신은 누구입니까?</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              직무에 따라 능력치와 시작 소지품이 달라집니다. 이 밤을 함께 버틸 인물을 선택하십시오.
            </p>

            <div className="flex gap-2" role="group" aria-label="캐릭터 성별">
              {[{ id: 'M', label: '남성' }, { id: 'F', label: '여성' }].map((option) => (
                <button key={option.id} type="button" aria-pressed={gender === option.id} onClick={() => setGender(option.id)}
                  className={`px-4 py-2 rounded-lg border text-xs cursor-pointer ${gender === option.id ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-neutral-700 text-neutral-400'}`}>
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              {ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setPreview({ arch, gender })}
                  className="w-full p-2 rounded-xl text-left bg-[#131826] hover:bg-[#1b2236] border border-[#232d44] hover:border-amber-400 transition-all flex flex-col gap-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img src={arch.portraits[gender]} alt={`${arch.title} ${gender === 'M' ? '남성' : '여성'} 포트레이트`} className="w-12 h-12 aspect-square object-cover rounded-lg shrink-0" />
                    <div className="flex-1 flex justify-between items-center">
                    <span className="font-bold text-sm text-neutral-100 group-hover:text-amber-300">{arch.title}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">주력: {Object.entries(arch.stats).sort((a,b)=>b[1]-a[1])[0].join(' ')}</span>
                  </div>
                  </div>
                  <p className="text-xs text-neutral-400 italic font-serif leading-tight">{arch.quote}</p>
                </button>
              ))}
            </div>
            {preview && <DialogFrame title="탑승 전 사원증 확인" onClose={closePreview}>
              <div className="character-preview"><img src={preview.arch.portraits[preview.gender]} alt={preview.arch.title} /><div><h3>{preview.arch.title}</h3><p>{preview.arch.quote}</p><dl>{Object.entries(preview.arch.stats).map(([stat, value]) => <div key={stat}><dt>{stat}</dt><dd>{value}</dd></div>)}</dl></div></div>
              <h3>시작 소지품</h3><ul className="preview-items">{preview.arch.items.map((item) => <li key={item.id} className="preview-item-tag">{item.name}</li>)}</ul>
              <button className="utility-done" onClick={() => { const selected = preview; closePreview(); handleSelectArchetype(selected.arch, selected.gender); }}>이 사원증으로 탑승</button><button className="utility-done" onClick={closePreview}>다시 선택</button>
            </DialogFrame>}
          </div>
        )
  );
}

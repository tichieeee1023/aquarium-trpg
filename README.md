# [작업지시서 & 개발 인수인계서] 00:37 AM — 심야 지하철 생존기

---

## 1. 프로젝트 개요 및 미션

* **프로젝트명**: 00:37 AM (심야 지하철 텍스트 로그라이크 TRPG)
* **목표**: 캔버스 물리 엔진 대신, React의 순수 상태 관리(`useReducer`, State Machine)와 데이터 주도 설계(Data-Driven Architecture)를 극대화한 고밀도 서스펜스 텍스트 로그라이크 웹 게임 구현.
* **타겟 환경**: PC 데스크톱 웹 (16:9 와이드스크린 최적화 레이아웃)
* **기술 스택**: React 18+, Vite, Tailwind CSS, Lucide-react, Web Audio API (순수 합성 사운드)
* **디자인 레퍼런스**: 《미제사건은 끝내야 하니까》, 《Life in Adventure》
* 극도의 절제된 모노크롬 다크 테마 (`#0a0d14`), 차콜 그레이, 앰버 옐로우 (`#f59e0b`), 스산한 레드 (`#ef4444`)
* 타이포그래피 중심의 인터랙션, D20 3D 주사위 연출, 타임스탬프 로그 시스템



---

## 2. 디렉토리 및 파일 구조 (Directory Tree)

모든 데이터와 UI, 상태 로직을 완전히 격리하여 모듈화합니다.

```text
subway-trpg/
├── index.html                       # Tailwind CDN / 픽셀 폰트 로드
├── package.json                     # react, react-dom, lucide-react, jszip
├── vite.config.js
└── src/
    ├── main.jsx                     # React DOM 마운트
    ├── App.jsx                      # 최상위 뷰 오케스트레이터
    ├── index.css                    # 스캔라인, 픽셀 폰트, 커스텀 스크롤바
    ├── data/
    │   ├── surveyDB.js              # Stage 0 직장인 성향 설문 5종 데이터
    │   ├── conditionDB.js           # Stage 0 D20 컨디션/특성 판정표
    │   ├── scenarioDB.js            # Stage 1 ~ 5 지문, 4대 성향 선택지, DC 난이도, 분기
    │   └── itemDB.js                # 아이템/도구 마스터 데이터
    ├── state/
    │   ├── initialGameState.js      # 전역 상태 스키마 기본값
    │   ├── gameActions.js           # Action Types 상수 정의
    │   └── gameReducer.js           # 순수 함수 기반 상태 전이 FSM 로직
    ├── hooks/
    │   ├── useGameEngine.js         # Reducer 바인딩 및 주요 디스패치 래퍼 훅
    │   ├── useAudioSynth.js         # Web Audio API 절차적 사운드 신디사이저
    │   └── useTypewriter.js         # 텍스트 출력 한 글자씩 타이핑 & 스킵 제어
    ├── components/
    │   ├── layout/
    │   │   ├── MainLayout.jsx       # 16:9 비율 컨테이너 (28% : 48% : 24%)
    │   │   ├── GameHeader.jsx       # 위치, 배터리, 잔여 AP 표시줄
    │   │   └── GameFooter.jsx       # 시스템 단말기 라벨 및 백업 버튼
    │   ├── sheet/                   # [좌측 28%] 사원증 & 캐릭터 시트
    │   │   ├── ProfileCard.jsx      # 사원증 도트, 이름, 컨디션 태그
    │   │   ├── StatGauge.jsx        # HP / SAN 실시간 바 게이지
    │   │   ├── StatGrid.jsx         # STR/DEX/INT/WILL/LUK 및 보정치 (+X)
    │   │   └── InventorySlot.jsx    # 4칸 인벤토리 그리드 & 툴팁
    │   ├── narrative/               # [중앙 48%] 메인 내러티브 & 상호작용
    │   │   ├── SurveyView.jsx       # Stage 0 전용 5대 프로필 설문 UI
    │   │   ├── StoryDisplay.jsx     # 상황 지문, 웹소설풍 독백, 퀘스트 알림창
    │   │   └── ActionPanel.jsx      # 2×3 탐사 카드 (Stage 1~4) 및 2×2 성향 선택지 (Stage 5)
    │   ├── console/                 # [우측 24%] 맵 & 콘솔
    │   │   ├── MiniTracker.jsx      # 5단계 지하철/터널 진행도 노드 다이어그램
    │   │   └── ConsoleLog.jsx       # 타임스탬프 기반 불변 판정/사건 로그 콘솔
    │   └── modal/
    │       ├── DiceModal.jsx        # 3D D20 주사위 회전 및 난수 계산 모달
    │       └── EndingModal.jsx      # True / Normal / Bad 1~3 엔딩 리포트 카드
    └── utils/
        ├── diceEngine.js            # 주사위 난수 생성, 보정치 합산, 대성공/대실패 판정
        └── zipDownloader.js         # JSZip 기반 원클릭 프로젝트 백업 유틸

```

---

## 3. 핵심 전역 상태 스키마 (`initialGameState.js`)

단일 상태 트리를 구성하여 복합 분기 및 조건부 렌더링을 완전히 통제합니다.

```javascript
export const initialGameState = {
  // 1. 유한 상태 머신 (Stage Phase Flow)
  phase: 'STAGE_0_SURVEY',
  // 'STAGE_0_SURVEY' | 'STAGE_0_DICE' | 'STAGE_1_CAR6' | 'STAGE_2_TUNNEL' |
  // 'STAGE_3_PLATFORM' | 'STAGE_4_MALL' | 'STAGE_5_SHAFT' | 'ENDING'

  // 2. 캐릭터 프로필 및 스탯 시트
  character: {
    name: '김대리',
    profileKey: null,      // 'ENGINEER' | 'GYM' | 'RUNNER' | 'NEGOTIATOR' | 'GAMBLER'
    title: '',             // 예: "분석형 엔지니어"
    condition: '',         // 예: "내일 연차 승인됨"
    stats: {
      STR: 10,
      DEX: 10,
      INT: 10,
      WILL: 10,
      LUK: 10,
    },
    hp: 20,
    maxHp: 20,
    san: 30,
    maxSan: 30,
    trait: null,           // 고유 특성 (예: '가벼운 발걸음', '잃을 게 없음')
  },

  // 3. 자원 관리
  resources: {
    ap: 3,                 // 각 스테이지별 탐사 가능 횟수 (3 -> 0)
    battery: 23,           // 스마트폰 배터리 잔량 (%)
    turnLimit: 3,          // Stage 5 타임어택 카운트다운
  },

  // 4. 소지품 (최대 4슬롯)
  inventory: [],           // [{ id, name, icon, desc, type }]

  // 5. 탐사 완료 기록 (스테이지별 중복 방지)
  examinedPoints: [],      // ['point_1', 'point_3']

  // 6. 핵심 서사 플래그 (조건부 분기 및 엔딩 결정자)
  flags: {
    hasEmergencyWrench: false, // 6호차 스패너 획득 여부 (Stage 1 생존 키)
    hasLantern: false,         // 방수 안전 랜턴 (Stage 2 배터리 소모 무효화)
    clueFakeStation: false,    // 의태 승강장 위화감 눈치챔 여부 (Stage 3 함정 회피 키)
    discoveredAnomalies: 0,    // 발견한 이상 징후 개수 (0~4)
    hasMasterKey: false,       // 상가 마스터 카드키 획득 여부
    knowsBreakerPos: false,    // CCTV로 환기팬 배선 확인 여부
    isFanStopped: false,       // Stage 5 환풍기 정지 완료 여부
  },

  // 7. D20 주사위 판정 모달 상태
  diceModal: {
    isOpen: false,
    stat: null,                // 'STR' | 'DEX' | 'INT' | 'WILL' | 'LUK'
    dc: 0,                     // 난이도 기준값
    rollValue: null,           // 1 ~ 20 난수
    modifier: 0,               // (스탯 - 10) / 2
    total: 0,                  // rollValue + modifier
    isSuccess: false,
    isCritSuccess: false,      // Natural 20
    isCritFail: false,         // Natural 1
    onResolve: null,           // 판정 후 실행할 콜백
  },

  // 8. 엔딩 리포트 데이터
  endingData: {
    type: null,                // 'TRUE' | 'NORMAL' | 'BAD_1' | 'BAD_2' | 'BAD_3'
    title: '',
    description: '',
  },

  // 9. 불변 시스템 콘솔 로그
  logs: ['00:37 AM. 지하철 6호선 전동차가 급정거하며 모든 조명이 소멸했습니다.'],
};

```

---

## 4. 스테이지별 시나리오 & 분기 로직 명세

### Stage 0. 캐릭터 생성 (설문 + 주사위)

1. **설문 5종 (`surveyDB.js`)**:
* `ENGINEER`: INT 14 / 소지품: 노트북 가방 (방어구)
* `GYM`: STR 14 / 소지품: 보냉 텀블러 (둔기)
* `RUNNER`: DEX 14 / 소지품: 릴홀더 사원증 (도구)
* `NEGOTIATOR`: WILL 14 / 소지품: 멘톨 캔디 (SAN 회복제)
* `GAMBLER`: LUK 14 / 소지품: 스피또 복권 3장


2. **D20 컨디션 롤 (`conditionDB.js`)**:
* `1 (대실패)`: 3일 연속 철야 (HP 16, SAN 24, 특성: *카페인 중독 [DEX -1]*)
* `2~7`: 수면 부족 (HP 18, SAN 28)
* `8~14`: 보통 야근 (HP 20, SAN 30)
* `15~19`: 내일 연차 (HP 22, SAN 32, 특성: *가벼운 발걸음 [도주 판정 +2]*)
* `20 (대성공)`: 사직서 품음 (HP 20, SAN 40, 특성: *잃을 게 없음 [공포 자동 면제]*)



---

### Stage 1. 암전된 6호차 객차 (Hub: AP 3)

* **조사 포인트 (6개 중 3선택)**:
* `point_1 (롱패딩)`: [소형 커터칼] or 허탕 (영수증)
* `point_2 (비상 인터폰)`: 기관사 단서 획득 (SAN -4 리스크)
* `point_3 (수동 밸브)`: 스패너 필요성 정보 획득
* `point_4 (선반 쇼핑백)`: **[비상 탈출용 스패너]** 획득 (`hasEmergencyWrench: true`)
* `point_5 (7호차 창문)`: 기어 다니는 허물 괴물 목격 (SAN -5, 정보 획득)
* `point_6 (바닥 점액)`: 강산성 소화액 단서 (허탕: 포도주스)


* **AP = 0 결단 이벤트**:
* `hasEmergencyWrench === false`: 문을 못 열고 좌석 밑에 숨음 ➔ 💀 **BAD END 1: [미수거된 유실물]**
* `hasEmergencyWrench === true`: 스패너로 밸브 강제 개방 ➔ 선로 자갈밭으로 탈출 (Stage 2 전이)



---

### Stage 2. 침묵의 선로 터널 (Hub: AP 3)

* **환경 페널티**: 행동마다 배터리 -5%. 배터리 0% 시 모든 판정 DC +3 페널티.
* **조사 포인트 (4선택지)**:
* `point_t1 (대피 홈)`: **[충전식 방수 랜턴]** 획득 (`hasLantern: true`, 배터리 감소 영구 면제)
* `point_t2 (비상 전화)`: 폐쇄 방역 구역 경고 청취 (INT DC 11)
* `point_t3 (정비 손수레)`: **[쇠지렛대(빠루)]** 획득 (STR DC 12)
* `point_t4 (고압 전력 레일)`: 감전 회피 기동 (DEX DC 13, 실패 시 HP -6)


* **돌파 조건**: AP 3 소진 후 터널 끝 점검 계단을 통해 승강장으로 기어오름 (Stage 3 전이).

---

### Stage 3. 의태된 환승역 승강장 (Hub: AP 3)

* **환경 트랩**: 델리만쥬 냄새와 정상 작동하는 전광판 등 거짓 안도감 연출.
* **위화감 조사 포인트 (5개)**:
* `point_p1 (종합 노선도)`: 역 이름이 '유골', '종착'으로 기재됨 (`clueFakeStation = true`)
* `point_p2 (음료 자판기)`: 투입구 내부가 붉은 점막과 이빨로 구성됨 (SAN -5)
* `point_p3 (대형 거울)`: 거울 속 상이 0.5초 늦게 반응함
* `point_p4 (역무실)`: 바닥에 널려 있는 역무원의 피부 허물 목격
* `point_p5 (직원 배전실 문)`: 구석의 잠긴 철문 확인


* **결정적 함정 버튼: `[3번 출구로 즉시 퇴근한다]**`:
* `clueFakeStation === false`: 위화감 없이 출구로 나감 ➔ 계단이 식도로 변해 삼켜짐 ➔ 💀 **BAD END 2: [02:40 AM, 소화 완료]**
* `clueFakeStation === true`: 함정을 눈치채고 멈춤 ➔ 상가 대합실 통로로 우회 (Stage 4 전이).



---

### Stage 4. 뒤틀린 환승 상가 & 개찰구 (Hub: AP 3)

* **조사 포인트 (4선택지)**:
* `point_m1 (24시 편의점)`: 에너지 드링크(HP +5) + **[역무 마스터 카드키]** 획득 (`hasMasterKey: true`)
* `point_m2 (마네킹 매장)`: 관찰(INT DC 12) / 멀티툴 및 케이블 타이 수거 (DEX DC 11)
* `point_m3 (방재 모니터실)`: 환기탑 배선 위치 파악 (`knowsBreakerPos: true`, INT DC 13)
* `point_m4 (개찰구 단말기)`: 사원증 태그 통과 (LUK DC 13) / 플랩 강행 돌파 (STR DC 14)


* **돌파 조건**: AP 3 소진 후 마스터키 또는 우회로를 통해 **환기탑 배전실(Stage 5)** 진입.

---

### Stage 5. 환기탑 배전실 & 수직 갱도 (Time-Attack: 3 Turns)

* **규칙**: 매 턴마다 촉수가 점검구를 조여옴 (`turnLimit` 3 $\rightarrow$ 0). 0 도달 시 💀 **BAD END 3: [역류하는 수직 통로]**.
* **거대 환풍기 정지 4대 성향 판정**:
* **지능 (INT DC 12)**: 고압 배선도 분석 및 무소음 차단
* **완력 (STR DC 13)**: 쇠지렛대/가방을 모터 축에 박아 물리적 파괴
* **민첩 (DEX DC 14)**: 회전 날개의 틈새 타이밍 도약
* **도구 (스패너/마스터키/멀티툴 보유)**: 주사위 없이 1턴 만에 자동 성공


* **최종 관문**: 사다리 등반 후 빗물 쏟아지는 주철 맨홀 뚜껑 밀어내기 (STR DC 11 or WILL DC 10).
* **엔딩 판정**:
* **성공 + HP 12 이상**: ✨ **TRUE END: [새벽 03:15, 아스팔트의 비]**
* **성공 + HP 11 이하 또는 SAN 10 이하**: ⚠️ **NORMAL END: [영구적 야간 트라우마]**
* **맨홀 개방 2회 연속 실패 또는 턴 초과**: 💀 **BAD END 3: [역류하는 수직 통로]**



---

## 5. UI 레이아웃 사양 (PC 16:9 와이드스크린)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [HEADER] 📍 6호선 6호차 (암전) | 🔋 배터리: 23% | ⏳ 남은 행동력: ● ● ○ (2/3) | [ZIP 백업]      │
├──────────────────────┬───────────────────────────────────────────┬───────────────────────────────┤
│ [좌측: 28% SHEET]    │ [중앙: 48% NARRATIVE & ACTION]            │ [우측: 24% CONSOLE]           │
│                      │                                           │                               │
│ ┌─ [사원증 카드] ──┐ │ 📜 [웹소설풍 상황 지문 창]                │ 🗺️ [스테이지 트래커]          │
│ │ 👤 김대리 (엔지니어│ "창밖은 완벽한 암흑이다. 모터 구동음이    │   [1] ➔ [2] ➔ [3] ➔ [4] ➔ [5] │
│ │ HP  [======= ] 18│  멎은 객차 안에 지독한 식초 냄새가 번진다."│   (현재: 1호차)               │
│ │ SAN [=====   ] 20│                                           ├───────────────────────────────┤
│ └──────────────────┘ │ ┌─ [2×3 탐사 카드 그리드] ──────────────┐ │ 💻 [시스템 단말기 로그]       │
│ • STR  10 (+0)       │ │ [1. 버려진 롱패딩]   [2. 비상 인터폰] │ │ • 00:37 급제동 및 암전 발생   │
│ • DEX  12 (+1)       │ │ [3. 수동 밸브]      [4. 선반 쇼핑백]  │ │ • [선반 쇼핑백] 조사 완료     │
│ • INT  14 (+2)       │ │ [5. 7호차 창문]     [6. 바닥 점액질]  │ │   ➔ [비상 스패너] 획득!       │
│ • WILL 11 (+0)       │ └───────────────────────────────────────┘ │ • 7호차 연결문 긁는 소리 감지 │
│ • LUK  10 (+0)       │                                           │ • 잔여 행동력: 2              │
│                      │ [상호작용 버튼 및 뒤로가기 컨트롤러]       │                               │
│ [소지품 슬롯 (4칸)]  │                                           │                               │
│ [스패너] [사원증]    │                                           │                               │
│ [빈슬롯] [빈슬롯]    │                                           │                               │
└──────────────────────┴───────────────────────────────────────────┴───────────────────────────────┘

```

---

## 6. D20 주사위 판정 공식 및 유틸리티 (`diceEngine.js`)

```javascript
/**
 * TRPG D20 판정 공식
 * 최종값 = D20 난수(1~20) + Math.floor((스탯 - 10) / 2) + 장비 보너스
 */
export function calculateModifier(statValue) {
  return Math.floor((statValue - 10) / 2);
}

export function executeD20Check(statValue, dc, equipmentBonus = 0) {
  const roll = Math.floor(Math.random() * 20) + 1;
  const modifier = calculateModifier(statValue);
  const total = roll + modifier + equipmentBonus;

  const isCritSuccess = roll === 20;
  const isCritFail = roll === 1;
  const isSuccess = isCritSuccess ? true : isCritFail ? false : total >= dc;

  return {
    roll,
    modifier,
    equipmentBonus,
    total,
    dc,
    isSuccess,
    isCritSuccess,
    isCritFail,
  };
}

/**
 * 성공 확률 프리뷰 연산 (Derived State용)
 */
export function getSuccessProbability(statValue, dc, equipmentBonus = 0) {
  const modifier = calculateModifier(statValue);
  const neededRoll = dc - modifier - equipmentBonus;
  if (neededRoll <= 1) return 95; // 1은 대실패이므로 최대 95%
  if (neededRoll > 20) return 5;  // 20은 대성공이므로 최소 5%
  return Math.round(((21 - neededRoll) / 20) * 100);
}

```

---

## 7. Web Audio API 절차적 사운드 엔진 (`useAudioSynth.js`)

외부 mp3 파일 없이 브라우저 오디오 컨텍스트로 모든 SFX를 생성합니다.

* `playBeep(freq, type, duration)`: UI 클릭음 및 타자기 효과음
* `playSwitch()`: 릴레이 차단기 및 전원 스위치 조작음 (Triangle + Sine 험 노이즈)
* `playDiceRoll()`: 주사위가 테이블 위를 굴러가는 다이스 롤 타격음 (화이트 노이즈 버스트)
* `playSuccess()`: 판정 성공 시 울리는 영롱한 상승 코드 아르페지오 (C5 $\rightarrow$ E5 $\rightarrow$ G5)
* `playFail()`: 판정 실패 시 저주파 톱니파 디스토션 버저음
* `playGlitch()`: 암전, 괴물 출현 시 화면 노이즈와 결합되는 핑퐁 노이즈

---

## 8. Codex 구현 단계별 작업 지시 (Tasks)

1. **Task 1: 환경 구성 및 기본 뼈대**
* Vite React 환경에 `lucide-react`, `jszip` 설치.
* `index.html`에 Tailwind CDN 및 폰트(`Galmuri11` or `DungGeunMo`) 임베드.
* `src/state/`에 초기 상태와 Reducer 기본 골격 작성.


2. **Task 2: 시나리오 및 판정 DB 구축 (`src/data/`)**
* Stage 0 설문 및 D20 컨디션 데이터 세팅.
* Stage 1~5 전체 지문, 조사 포인트 6종/5종/4종 및 4대 성향 판정 객체 완비.
* 엔딩 데이터 5종 (True, Normal, Bad 1~3) 작성.


3. **Task 3: 3단 레이아웃 및 사원증 시트 UI 구현**
* 좌측(28%) 사원증 프로필, HP/SAN 바, 스탯 그리드, 4칸 가방 렌더링.
* 상단 헤더 HUD(배터리, AP 램프) 및 우측(24%) 미니맵/시스템 콘솔 배치.


4. **Task 4: 탐사 허브 & 조건부 분기 액션 덱 구현**
* 중앙(48%) 화면에서 AP 기반 2×3 카드 그리드 조사 및 뒤로가기 로직 연결.
* 이미 조사한 포인트 비활성화 및 AP 0 도달 시 위기 전환 FSM 로직 연동.


5. **Task 5: D20 다이스 롤러 모달 & 사운드 연동**
* 주사위 판정 시 CSS 3D 회전 애니메이션 실행 (1.0초).
* 성공 확률 뱃지 사전 렌더링 및 판정 결과(성공/실패/크리티컬) 도장 찍기 연출.
* Web Audio API 훅을 UI 액션마다 바인딩.


6. **Task 6: 엔딩 리포트 카드 & ZIP 백업 유틸**
* 엔딩 도달 시 플레이 통계(생존 시간, 발견 단서, 최종 스탯) 모달 출력.
* 상단 [ZIP 다운로드] 클릭 시 현재 소스 전체를 브라우저에서 압축 다운로드하는 유틸 연결.
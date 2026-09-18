# 아쿠아리움: 심해의 균열

텍스트로그 게임 2. 지하철 게임(1)과 별도의 React/Vite 아쿠아리움 탈출 게임입니다.

## 실행

이 폴더에서 `npm install` 후 `npm run dev -- --port 5174`를 실행합니다.

## 검증

- `npm run build`
- `npm run lint`
- `npm test`
- 개발 서버 실행 후 `node tools/verify-aquarium-browser.mjs` (설치된 Google Chrome 사용)

## 게임

4직군과 남녀 캐릭터, 5구역, 7엔딩. 각 구역에서 3곳을 조사한 뒤 돌파합니다. 가방은 5칸이며 가방 정리에서 장비를 내려놓을 수 있습니다. 기록 저장은 플레이 로그를 JSON으로 내려받습니다.

코드 분석과 검증 범위는 `docs/aquarium-code-review.md`에 기록했습니다. 복사되어 남아 있는 지하철 모듈과 기존 도구는 새 게임에서 사용하지 않습니다.

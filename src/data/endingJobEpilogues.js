const ENDING_DIALOGUES = {
  BAD_1: {
    AQUARIST: '“아… 해파리, 저렇게 가까이서 보는 건 처음인데.”',
    DIVER: '“몸이 말을 안 듣네… 여기서 그대로 가라앉는 건가.”',
    VET: '“윽, 심장이… 이건, 안 되겠네.”',
    SECURITY: '“차단기까지… 몇 걸음이었는데.”'
  },

  BAD_2: {
    AQUARIST: '“물은 좋아했는데… 이건 좀 아니지.”',
    DIVER: '“하… 숨 참는 건 자신 있었는데.”',
    VET: '“호흡이 점점 얕아져… 숨이, 안 쉬어져….”',
    SECURITY: '“이 문… 내가 매일 점검했는데.”'
  },

  BAD_3: {
    AQUARIST: '“손도 발도 감각이 없네… 이제 정말 얼어붙는 건가.”',
    DIVER: '“따뜻한 물에… 들어가고 싶다.”',
    VET: '“졸리면 안 되는데… 너무 졸려…….”',
    SECURITY: '“손가락도 안 움직이네… 이제 진짜 끝인가 보다.”'
  },

  BAD_4: {
    AQUARIST: '“거의 다 왔는데… 진짜 거의 다 왔는데.”',
    DIVER: '“빛이 보이는데… 저기까지만 가면 되는데.”',
    VET: '“살 수 있었는데… 조금만 더 빨랐으면.”',
    SECURITY: '“하필… 마지막 문 앞에서.”'
  },

  NORMAL: {
  AQUARIST: '“살긴 살았는데… 이제 수조 앞에 다시 설 수 있을지 모르겠네.”',
  DIVER: '“밖으로 나왔는데도… 아직 물이 목까지 차오른 것 같아.”',
  VET: '“괜찮아졌다고 생각했는데… 손이 왜 아직도 이렇게 떨리지.”',
  SECURITY: '“끝난 거 맞지… 이제 뭐가 또 터지는 건 아니지.”'
},

GOOD: {
  AQUARIST: '“온몸이 쑤시긴 해도… 두 발로 땅을 밟고 있으니 됐지.”',
  DIVER: '“하아… 공기 좋다, 진짜 오늘만큼은 나 자신을 칭찬해.”',
  VET: '“상처도 얕고 의식도 멀쩡해… 그래, 이 정도면 잘 버텼어.”',
  SECURITY: '“결국 출구까지 왔네… 마지막까지 포기 안 하길 잘했어.”'
},

TRUE: {
  AQUARIST: '“와… 저걸 진짜 깨고 나왔네, 나 생각보다 꽤 질긴 사람이었구나.”',
  DIVER: '“그래… 결국 물 밖으로 나왔잖아, 이번에도 끝까지 안 가라앉았어.”',
  VET: '“호흡 정상, 맥박 정상… 나 용케 살아 있네… 정말.”',
  SECURITY: '“경보도 잠금도 전부 뚫고 나왔다… 역시 내 목숨은 끈질겨.”'
}
};

const ENDING_DESCRIPTIONS = {
  BAD_1: '푸른 비상등 아래, 해파리의 빛만이 물에 잠긴 복도를 천천히 떠돌았다.',
  BAD_2: '강철문 너머에서 마지막 기포가 떠올라, 천장 끝에서 조용히 터졌다.',
  BAD_3: '새벽 교대등이 켜졌을 때도 냉동고 안에서는 팬 소리만 일정하게 이어졌다.',
  BAD_4: '수장 프로토콜이 멎은 뒤에도 깨진 돔 틈으로 빗물이 한 방울씩 떨어졌다.',
  NORMAL: '구조대가 담요를 둘러준 뒤에도, 나는 구급차 바닥에 번진 물자국을 한참 바라봤다.',
  GOOD: '구조대의 손이 어깨에 닿을 때까지, 깨진 돔에서는 차가운 물이 빗속으로 흘러내렸다.',
  TRUE: '무전기 너머로 생환 확인이 돌아왔다. 새벽빛은 무너진 전시관 안쪽까지 천천히 번졌다.'
};

export function getEndingJobEpilogue(jobKey, endingType) {
  const dialogue = ENDING_DIALOGUES[endingType]?.[jobKey];
  const description = ENDING_DESCRIPTIONS[endingType];
  return dialogue && description ? { dialogue, description } : null;
}

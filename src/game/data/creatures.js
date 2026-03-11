export const CREATURES = {
  LEAFKIT: {
    id: "LEAFKIT",
    class: "스타팅",
    name: "리프킷",
    type: "Forest",
    description: "활기찬 초록 고양이. 상쾌한 소나무 향기가 난다.",
    baseHp: 20,
    baseAttack: 5,
    baseDefense: 4,
    catchRate: 1,
    skills: [
      "vine_swipe",
      "leaf_dart",
      "forest_guard"
    ],
    evolution: {
      target: "BRAMBLECAT",
      level: 10
    }
  },
  BRAMBLECAT: {
    id: "BRAMBLECAT",
    class: "스타팅",
    name: "브램블캣",
    type: "Forest",
    description: "털이 단단하고 두꺼운 덩굴로 변해 몸을 보호한다.",
    baseHp: 45,
    baseAttack: 12,
    baseDefense: 10,
    catchRate: 0.5,
    skills: [
      "thorn_whip",
      "root_snare",
      "nature_roar"
    ],
    evolution: null
  },
  EMBERPAW: {
    id: "EMBERPAW",
    class: "스타팅",
    name: "엠버파우",
    type: "Fire",
    description: "타오르는 불꽃 고양이. 발바닥이 따뜻하다.",
    baseHp: 18,
    baseAttack: 7,
    baseDefense: 3,
    catchRate: 1,
    skills: [
      "ember_bite",
      "flame_dash",
      "heat_claw"
    ],
    evolution: {
      target: "CINDERCLAW",
      level: 10
    }
  },
  CINDERCLAW: {
    id: "CINDERCLAW",
    class: "스타팅",
    name: "신더클로",
    type: "Fire",
    description: "사납고 다혈질인 고양이. 발톱이 지나간 자리에 그을음이 남는다.",
    baseHp: 40,
    baseAttack: 16,
    baseDefense: 8,
    catchRate: 0.5,
    skills: [
      "inferno_slash",
      "blazing_pounce",
      "firestorm"
    ],
    evolution: null
  },
  MISTTAIL: {
    id: "MISTTAIL",
    class: "스타팅",
    name: "미스트테일",
    type: "Water",
    description: "수영을 좋아하는 날렵하고 매끄러운 고양이.",
    baseHp: 22,
    baseAttack: 4,
    baseDefense: 6,
    catchRate: 1,
    skills: [
      "water_slash",
      "mist_burst",
      "tidal_wave"
    ],
    evolution: {
      target: "DEWTAIL",
      level: 10
    }
  },
  DEWTAIL: {
    id: "DEWTAIL",
    class: "스타팅",
    name: "듀테일",
    type: "Water",
    description: "수영의 달인. 화가 나면 가벼운 비를 부를 수 있다.",
    baseHp: 50,
    baseAttack: 10,
    baseDefense: 14,
    catchRate: 0.5,
    skills: [
      "aqua_fang",
      "tidal_crash",
      "ocean_wrath"
    ],
    evolution: null
  },
  SNAGPUSS: {
    id: "SNAGPUSS",
    class: "노말",
    name: "스내그퍼스",
    type: "Grass",
    description: "키 큰 풀숲에 숨어 있는 호기심 많은 가시털 고양이.",
    baseHp: 15,
    baseAttack: 4,
    baseDefense: 5,
    catchRate: 0.8,
    skills: [
      "scratch",
      "vine_swipe",
      "leaf_dart"
    ],
    evolution: {
      target: "THISTLEFUR",
      level: 12
    }
  },
  THISTLEFUR: {
    id: "THISTLEFUR",
    class: "레어",
    name: "씨슬퍼",
    type: "Grass",
    description: "온몸이 가시로 덮여 있어 직접 공격하기 어렵다.",
    baseHp: 38,
    baseAttack: 11,
    baseDefense: 13,
    catchRate: 0.4,
    skills: [
      "bite",
      "thorn_whip",
      "root_snare"
    ],
    evolution: null
  },
  MOSSLYNX: {
    id: "MOSSLYNX",
    class: "노말",
    name: "모스링스",
    type: "Forest",
    description: "숲 바닥에 숨어 지내는 조용한 이끼 덮인 야생 고양이.",
    baseHp: 18,
    baseAttack: 6,
    baseDefense: 4,
    catchRate: 0.7,
    skills: [
      "quick_strike",
      "vine_swipe",
      "forest_guard"
    ],
    evolution: {
      target: "VERDANTLYNX",
      level: 14
    }
  },
  VERDANTLYNX: {
    id: "VERDANTLYNX",
    class: "전설",
    name: "버던트링스",
    type: "Forest",
    description: "깊은 숲의 고대 수호자. 발걸음마다 꽃이 피어난다.",
    baseHp: 120,
    baseAttack: 28,
    baseDefense: 30,
    catchRate: 0.01,
    skills: [
      "nature_roar",
      "phantom_claw",
      "soul_reap",
      "world_tree_root"
    ],
    evolution: null
  },
  THORNKIT: {
    id: "THORNKIT",
    class: "노말",
    name: "쏜킷",
    type: "Grass",
    description: "부드러운 가시로 덮인 작은 고양이. 무서우면 가시가 단단해진다.",
    baseHp: 15,
    baseAttack: 5,
    baseDefense: 3,
    catchRate: 0.8,
    skills: [
      "scratch",
      "vine_swipe",
      "root_snare"
    ],
    evolution: {
      target: "THORNMANE",
      level: 12
    }
  },
  THORNMANE: {
    id: "THORNMANE",
    class: "에픽",
    name: "쏜메인",
    type: "Grass",
    description: "면도날처럼 날카로운 덤불 갈기를 가진 사나운 포식자.",
    baseHp: 42,
    baseAttack: 20,
    baseDefense: 8,
    catchRate: 0.2,
    skills: [
      "pounce",
      "thorn_whip",
      "nature_roar"
    ],
    evolution: null
  },
  FERNCLAW: {
    id: "FERNCLAW",
    class: "노말",
    name: "펀클로",
    type: "Grass",
    description: "날카로운 잎사귀처럼 자란 발톱으로 영역을 지킨다.",
    baseHp: 16,
    baseAttack: 7,
    baseDefense: 3,
    catchRate: 0.7,
    skills: [
      "scratch",
      "leaf_dart",
      "vine_swipe"
    ],
    evolution: {
      target: "VINEFANG",
      level: 13
    }
  },
  VINEFANG: {
    id: "VINEFANG",
    class: "레어",
    name: "바인팽",
    type: "Grass",
    description: "꼬리에서 뻗어 나온 덩굴로 먹잇감을 꼼짝 못 하게 만든다.",
    baseHp: 40,
    baseAttack: 16,
    baseDefense: 8,
    catchRate: 0.3,
    skills: [
      "bite",
      "root_snare",
      "thorn_whip"
    ],
    evolution: null
  },
  BARKPELT: {
    id: "BARKPELT",
    class: "노말",
    name: "바크펠트",
    type: "Forest",
    description: "나무껍질 같은 털을 가져 포식자로부터 몸을 보호한다.",
    baseHp: 22,
    baseAttack: 3,
    baseDefense: 8,
    catchRate: 0.8,
    skills: [
      "scratch",
      "forest_guard",
      "leaf_dart"
    ],
    evolution: {
      target: "IRONBARK",
      level: 15
    }
  },
  IRONBARK: {
    id: "IRONBARK",
    class: "에픽",
    name: "아이언바크",
    type: "Forest",
    description: "보통의 공격으로는 뚫을 수 없는 단단한 가죽을 가졌다.",
    baseHp: 55,
    baseAttack: 8,
    baseDefense: 20,
    catchRate: 0.3,
    skills: [
      "pounce",
      "nature_roar",
      "root_snare"
    ],
    evolution: null
  },
  THISTLEKIT: {
    id: "THISTLEKIT",
    class: "노말",
    name: "씨슬킷",
    type: "Grass",
    description: "가시 덤불 속에 몸을 구부려 숨는 아주 작은 고양이.",
    baseHp: 12,
    baseAttack: 5,
    baseDefense: 2,
    catchRate: 0.9,
    skills: [
      "quick_strike",
      "vine_swipe",
      "leaf_dart"
    ],
    evolution: {
      target: "THORNPROWLER",
      level: 11
    }
  },
  THORNPROWLER: {
    id: "THORNPROWLER",
    class: "레어",
    name: "쏜프라울러",
    type: "Grass",
    description: "빽빽한 가시 덤불 속에서 매복하여 공격적으로 사냥한다.",
    baseHp: 32,
    baseAttack: 14,
    baseDefense: 7,
    catchRate: 0.4,
    skills: [
      "flurry",
      "thorn_whip",
      "root_snare"
    ],
    evolution: null
  },
  SPARKPAW: {
    id: "SPARKPAW",
    class: "노말",
    name: "스파크파우",
    type: "Fire",
    description: "달릴 때마다 불꽃이 튀는 장난기 많은 고양이.",
    baseHp: 15,
    baseAttack: 6,
    baseDefense: 3,
    catchRate: 0.8,
    evolution: {
      target: "BLAZECLAW",
      level: 14
    }
  },
  BLAZECLAW: {
    id: "BLAZECLAW",
    class: "레어",
    name: "블레이즈클로",
    type: "Fire",
    description: "발을 딛는 곳마다 땅을 뜨겁게 달구는 강력한 발걸음의 고양이.",
    baseHp: 38,
    baseAttack: 16,
    baseDefense: 9,
    catchRate: 0.3,
    evolution: null
  },
  CINDERCAT: {
    id: "CINDERCAT",
    class: "노말",
    name: "신더캣",
    type: "Fire",
    description: "어둠 속에서 불씨처럼 희미하게 빛나는 털을 가졌다.",
    baseHp: 18,
    baseAttack: 5,
    baseDefense: 5,
    catchRate: 0.7,
    evolution: {
      target: "INFERMANE",
      level: 16
    }
  },
  INFERMANE: {
    id: "INFERMANE",
    class: "에픽",
    name: "인퍼메인",
    type: "Fire",
    description: "끊임없이 타오르는 불꽃으로 이루어진 위엄 있는 갈기를 가졌다.",
    baseHp: 45,
    baseAttack: 14,
    baseDefense: 12,
    catchRate: 0.2,
    evolution: null
  },
  ASHLYNX: {
    id: "ASHLYNX",
    class: "노말",
    name: "애시링스",
    type: "Fire",
    description: "불이 휩쓸고 지나간 자리에 나타나 활발하게 움직인다.",
    baseHp: 17,
    baseAttack: 7,
    baseDefense: 4,
    catchRate: 0.7,
    evolution: {
      target: "PYROLYNX",
      level: 15
    }
  },
  PYROLYNX: {
    id: "PYROLYNX",
    class: "레어",
    name: "파이로링스",
    type: "Fire",
    description: "주변의 공기 온도를 자유자재로 조절할 수 있다.",
    baseHp: 42,
    baseAttack: 18,
    baseDefense: 8,
    catchRate: 0.3,
    evolution: null
  },
  RIPPLEPAW: {
    id: "RIPPLEPAW",
    class: "노말",
    name: "리플파우",
    type: "Water",
    description: "얕은 개울 위로 퍼지는 물결을 쫓는 것을 좋아하는 고양이.",
    baseHp: 16,
    baseAttack: 5,
    baseDefense: 5,
    catchRate: 0.8,
    skills: [
      "scratch",
      "water_slash",
      "mist_burst"
    ],
    evolution: {
      target: "TIDALCLAW",
      level: 13
    }
  },
  TIDALCLAW: {
    id: "TIDALCLAW",
    class: "레어",
    name: "타이달클로",
    type: "Water",
    description: "부서지는 바다 파도와 같은 묵직한 힘을 발톱에 품고 있다.",
    baseHp: 40,
    baseAttack: 13,
    baseDefense: 13,
    catchRate: 0.4,
    evolution: null
  },
  STREAMTAIL: {
    id: "STREAMTAIL",
    class: "노말",
    name: "스트림테일",
    type: "Water",
    description: "강한 물살을 거슬러 수영할 수 있게 도와주는 긴 꼬리를 가졌다.",
    baseHp: 18,
    baseAttack: 6,
    baseDefense: 4,
    catchRate: 0.7,
    skills: [
      "quick_strike",
      "water_slash",
      "mist_burst"
    ],
    evolution: {
      target: "FLOODLYNX",
      level: 15
    }
  },
  FLOODLYNX: {
    id: "FLOODLYNX",
    class: "에픽",
    name: "플러드링스",
    type: "Water",
    description: "울부짖으면 주변의 물이 갑자기 범람하여 수위를 높인다.",
    baseHp: 46,
    baseAttack: 15,
    baseDefense: 10,
    catchRate: 0.3,
    evolution: null
  },
  DEWKIT: {
    id: "DEWKIT",
    class: "노말",
    name: "듀킷",
    type: "Water",
    description: "수줍음이 많으며 털이 항상 약간 젖어 있는 듯한 느낌을 주는 고양이.",
    baseHp: 14,
    baseAttack: 4,
    baseDefense: 6,
    catchRate: 0.9,
    skills: [
      "scratch",
      "mist_burst",
      "water_slash"
    ],
    evolution: {
      target: "MISTLYNX",
      level: 12
    }
  },
  MISTLYNX: {
    id: "MISTLYNX",
    class: "레어",
    name: "미스트링스",
    type: "Water",
    description: "짙은 안개 속에서 완벽하게 모습을 감출 수 있다.",
    baseHp: 38,
    baseAttack: 10,
    baseDefense: 15,
    catchRate: 0.4,
    evolution: null
  },
  PEBBLEPAW: {
    id: "PEBBLEPAW",
    class: "노말",
    name: "페블파우",
    type: "Rock",
    description: "반짝이는 돌을 모으는 고집불통 아기 고양이.",
    baseHp: 19,
    baseAttack: 5,
    baseDefense: 7,
    catchRate: 0.8,
    skills: [
      "scratch",
      "pebble_toss",
      "bite"
    ],
    evolution: {
      target: "STONECLAW",
      level: 14
    }
  },
  STONECLAW: {
    id: "STONECLAW",
    class: "에픽",
    name: "스톤클로",
    type: "Rock",
    description: "단단한 대리석도 단번에 가를 수 있는 강력한 발톱을 가졌다.",
    baseHp: 45,
    baseAttack: 14,
    baseDefense: 16,
    catchRate: 0.3,
    evolution: null
  },
  GRANITECAT: {
    id: "GRANITECAT",
    class: "노말",
    name: "그래니트캣",
    type: "Rock",
    description: "위협을 느끼면 털이 돌처럼 딱딱하게 굳는다.",
    baseHp: 20,
    baseAttack: 4,
    baseDefense: 9,
    catchRate: 0.7,
    skills: [
      "quick_strike",
      "pebble_toss",
      "rock_smash"
    ],
    evolution: {
      target: "TITANPELT",
      level: 16
    }
  },
  TITANPELT: {
    id: "TITANPELT",
    class: "에픽",
    name: "타이탄펠트",
    type: "Rock",
    description: "거의 움직이지 않으며 산사태의 한복판에서도 잠을 자는 묵직한 고양이.",
    baseHp: 55,
    baseAttack: 10,
    baseDefense: 22,
    catchRate: 0.2,
    evolution: null
  },
  BOULDERLYNX: {
    id: "BOULDERLYNX",
    class: "노말",
    name: "볼더링스",
    type: "Rock",
    description: "바위를 밀어 경쟁자를 제압하는 것으로 유명한 거대한 고양이.",
    baseHp: 48,
    baseAttack: 16,
    baseDefense: 14,
    catchRate: 0.3,
    skills: [
      "flurry",
      "pebble_toss",
      "rock_smash"
    ],
    evolution: {
      target: "CLIFFMAW",
      level: 25
    }
  },
  CLIFFMAW: {
    id: "CLIFFMAW",
    class: "에픽",
    name: "클리프마우",
    type: "Rock",
    description: "석순도 무너뜨리는 강력한 턱을 가진 산악 지대의 최상위 포집자.",
    baseHp: 70,
    baseAttack: 22,
    baseDefense: 18,
    catchRate: 0.1,
    evolution: null
  },
  NIGHTKIT: {
    id: "NIGHTKIT",
    class: "노말",
    name: "나이트킷",
    type: "Shadow",
    description: "소리 없이 움직이는 조용한 그림자 고양이.",
    baseHp: 14,
    baseAttack: 6,
    baseDefense: 3,
    catchRate: 0.8,
    skills: [
      "scratch",
      "shadow_sneak",
      "bite"
    ],
    evolution: {
      target: "NIGHTPELT",
      level: 15
    }
  },
  NIGHTPELT: {
    id: "NIGHTPELT",
    class: "레어",
    name: "나이트펠트",
    type: "Shadow",
    description: "완벽한 어둠을 틈타 먹잇감을 매복 공격한다.",
    baseHp: 38,
    baseAttack: 16,
    baseDefense: 8,
    catchRate: 0.3,
    skills: [
      "pounce",
      "dark_pulse",
      "shadow_sneak"
    ],
    evolution: null
  },
  DUSKPAW: {
    id: "DUSKPAW",
    class: "노말",
    name: "더스크파우",
    type: "Shadow",
    description: "그림자가 길어지는 황혼 무렵에만 모습을 드러낸다.",
    baseHp: 16,
    baseAttack: 6,
    baseDefense: 4,
    catchRate: 0.7,
    skills: [
      "scratch",
      "shadow_sneak",
      "dark_pulse"
    ],
    evolution: {
      target: "UMBRAFANG",
      level: 16
    }
  },
  UMBRAFANG: {
    id: "UMBRAFANG",
    class: "전설",
    name: "엄브라팽",
    type: "Shadow",
    description: "순수한 그림자의 생명체. 주변의 빛을 빨아들인다고 전해진다.",
    baseHp: 85,
    baseAttack: 38,
    baseDefense: 22,
    catchRate: 0.01,
    skills: [
      "dark_pulse",
      "shadow_sneak",
      "void_strike",
      "abyssal_devour"
    ],
    evolution: null
  },
  SHADECLAW: {
    id: "SHADECLAW",
    class: "노말",
    name: "쉐이드클로",
    type: "Shadow",
    description: "몸이 어둠 속에서 나타났다 사라졌다 하는 듯한 기이한 고양이.",
    baseHp: 15,
    baseAttack: 8,
    baseDefense: 3,
    catchRate: 0.6,
    skills: [
      "quick_strike",
      "shadow_sneak",
      "dark_pulse"
    ],
    evolution: {
      target: "VOIDLYNX",
      level: 18
    }
  },
  VOIDLYNX: {
    id: "VOIDLYNX",
    class: "에픽",
    name: "보이드링스",
    type: "Shadow",
    description: "완벽하게 보이지 않는 상태에서 사냥을 하는 공포의 포식자.",
    baseHp: 45,
    baseAttack: 20,
    baseDefense: 7,
    catchRate: 0.2,
    skills: [
      "quick_strike",
      "phantom_claw",
      "dark_pulse"
    ],
    evolution: null
  },
  FROSTKIT: {
    id: "FROSTKIT",
    class: "노말",
    name: "프로스트킷",
    type: "Ice",
    description: "얼어붙은 호수 위를 미끄러지며 노는 것을 즐기는 아기 고양이.",
    baseHp: 16,
    baseAttack: 5,
    baseDefense: 5,
    catchRate: 0.8,
    skills: [
      "scratch",
      "ice_shard",
      "frost_breath"
    ],
    evolution: {
      target: "GLACIERPAW",
      level: 15
    }
  },
  GLACIERPAW: {
    id: "GLACIERPAW",
    class: "레어",
    name: "글레이시아파우",
    type: "Ice",
    description: "묵직한 발걸음은 한여름에도 얼어붙은 발자국을 남긴다.",
    baseHp: 42,
    baseAttack: 14,
    baseDefense: 13,
    catchRate: 0.3,
    skills: [
      "bite",
      "ice_shard",
      "blizzard_claw"
    ],
    evolution: null
  },
  SNOWPELT: {
    id: "SNOWPELT",
    class: "노말",
    name: "스노우펠트",
    type: "Ice",
    description: "하얗게 내리는 눈과 완벽하게 동화되는 털을 가졌다.",
    baseHp: 18,
    baseAttack: 6,
    baseDefense: 4,
    catchRate: 0.7,
    skills: [
      "quick_strike",
      "ice_shard",
      "frost_breath"
    ],
    evolution: {
      target: "BLIZZARDFANG",
      level: 16
    }
  },
  BLIZZARDFANG: {
    id: "BLIZZARDFANG",
    class: "에픽",
    name: "블리자드팽",
    type: "Ice",
    description: "꼬리를 휘둘러 눈을 뜨기 힘들 정도의 강력한 눈보라를 일으킨다.",
    baseHp: 48,
    baseAttack: 12,
    baseDefense: 16,
    catchRate: 0.2,
    skills: [
      "scratch",
      "blizzard_claw",
      "absolute_zero"
    ],
    evolution: null
  },
  STORMKIT: {
    id: "STORMKIT",
    class: "노말",
    name: "스톰킷",
    type: "Storm",
    description: "털에서 정전기가 기분 좋게 따끔거리는 아기 번개 고양이.",
    baseHp: 15,
    baseAttack: 7,
    baseDefense: 3,
    catchRate: 0.7,
    skills: [
      "scratch",
      "spark_strike",
      "gust"
    ],
    evolution: {
      target: "THUNDERLYNX",
      level: 16
    }
  },
  THUNDERLYNX: {
    id: "THUNDERLYNX",
    class: "레어",
    name: "선더링스",
    type: "Storm",
    description: "울음소리가 천둥처럼 울려 퍼지는 늠름한 번개 고양이.",
    baseHp: 40,
    baseAttack: 18,
    baseDefense: 8,
    catchRate: 0.3,
    skills: [
      "bite",
      "spark_strike",
      "thunder_paw"
    ],
    evolution: null
  },
  GALECLAW: {
    id: "GALECLAW",
    class: "노말",
    name: "게일클로",
    type: "Storm",
    description: "바람을 타고 믿을 수 없을 만큼 먼 거리를 도약하는 것으로 유명하다.",
    baseHp: 17,
    baseAttack: 8,
    baseDefense: 4,
    catchRate: 0.6,
    skills: [
      "flurry",
      "gust",
      "spark_strike"
    ],
    evolution: {
      target: "TEMPESTFANG",
      level: 18
    }
  },
  TEMPESTFANG: {
    id: "TEMPESTFANG",
    class: "레어",
    name: "템페스트팽",
    type: "Storm",
    description: "허리케인과 같이 예측할 수 없는 속도로 공격을 퍼붓는다.",
    baseHp: 38,
    baseAttack: 21,
    baseDefense: 7,
    catchRate: 0.2,
    skills: [
      "flurry",
      "thunder_paw",
      "storm_call"
    ],
    evolution: null
  },
  WHISPERKIT: {
    id: "WHISPERKIT",
    class: "노말",
    name: "위스퍼킷",
    type: "Spirit",
    description: "오래전 잊힌 고양이의 영혼이 깃들었다고 전해지는 신비로운 고양이.",
    baseHp: 14,
    baseAttack: 4,
    baseDefense: 7,
    catchRate: 0.7,
    skills: [
      "scratch",
      "shadow_sneak",
      "phantom_claw"
    ],
    evolution: {
      target: "SOULPELT",
      level: 19
    }
  },
  SOULPELT: {
    id: "SOULPELT",
    class: "레어",
    name: "소울펠트",
    type: "Spirit",
    description: "길 잃은 영혼들을 집으로 인도하는 묘지의 수호자.",
    baseHp: 38,
    baseAttack: 11,
    baseDefense: 18,
    catchRate: 0.3,
    skills: [
      "bite",
      "phantom_claw",
      "soul_reap"
    ],
    evolution: null
  },
  PHANTOMLYNX: {
    id: "PHANTOMLYNX",
    class: "노말",
    name: "팬텀링스",
    type: "Spirit",
    description: "발걸음 소리가 전혀 들리지 않는 유령 같은 고양이.",
    baseHp: 16,
    baseAttack: 7,
    baseDefense: 4,
    catchRate: 0.5,
    skills: [
      "quick_strike",
      "shadow_sneak",
      "phantom_claw"
    ],
    evolution: {
      target: "SPECTRALCLAW",
      level: 21
    }
  },
  SPECTRALCLAW: {
    id: "SPECTRALCLAW",
    class: "에픽",
    name: "스펙트럴클로",
    type: "Spirit",
    description: "먹잇감을 잡기 위해 단단한 물체도 통과할 수 있는 기이한 존재.",
    baseHp: 44,
    baseAttack: 19,
    baseDefense: 10,
    catchRate: 0.2,
    skills: [
      "phantom_claw",
      "soul_reap",
      "spectral_strike"
    ],
    evolution: null
  },
  RUNECLAW: {
    id: "RUNECLAW",
    class: "노말",
    name: "룬클로",
    type: "Mystic",
    description: "털 위로 신비롭게 빛나는 룬 문자가 떠오르는 마법 고양이.",
    baseHp: 18,
    baseAttack: 6,
    baseDefense: 5,
    catchRate: 0.6,
    skills: [
      "scratch",
      "mana_burst",
      "star_fall"
    ],
    evolution: {
      target: "ARCANEFANG",
      level: 20
    }
  },
  ARCANEFANG: {
    id: "ARCANEFANG",
    class: "에픽",
    name: "아르케인팽",
    type: "Mystic",
    description: "신비로운 울음소리로 사소한 현실을 뒤틀어버릴 수 있는 능력을 가졌다.",
    baseHp: 45,
    baseAttack: 15,
    baseDefense: 12,
    catchRate: 0.2,
    skills: [
      "bite",
      "star_fall",
      "cosmic_roar"
    ],
    evolution: null
  },
  STARLIGHTKIT: {
    id: "STARLIGHTKIT",
    class: "노말",
    name: "스타라이트잇",
    type: "Mystic",
    description: "멀리 떨어진 별들처럼 반짝이는 눈동자를 가진 신비한 아기 고양이.",
    baseHp: 16,
    baseAttack: 5,
    baseDefense: 6,
    catchRate: 0.7,
    skills: [
      "scratch",
      "mana_burst",
      "solar_beam"
    ],
    evolution: {
      target: "CELESTIPELT",
      level: 22
    }
  },
  CELESTIPELT: {
    id: "CELESTIPELT",
    class: "에픽",
    name: "셀레스티펠트",
    type: "Mystic",
    description: "맑은 밤에 은하수로부터 내려온다고 전해지는 천상의 고양이.",
    baseHp: 42,
    baseAttack: 13,
    baseDefense: 16,
    catchRate: 0.2,
    skills: [
      "star_fall",
      "cosmic_roar",
      "celestial_strike"
    ],
    evolution: null
  },
  AURORACAT: {
    id: "AURORACAT",
    class: "에픽",
    name: "오로라캣",
    type: "Ice/Mystic",
    description: "오로라를 닮은 털 자락이 신비로운 조화를 이루는 고양이.",
    baseHp: 60,
    baseAttack: 16,
    baseDefense: 18,
    catchRate: 0.05,
    skills: [
      "ice_shard",
      "mana_burst",
      "solar_beam"
    ],
    evolution: null
  },
  EMBERLYNX: {
    id: "EMBERLYNX",
    class: "에픽",
    name: "엠버링스",
    type: "Fire/Storm",
    description: "들불과 번개가 결합된 강력하고 사나운 힘을 발휘하는 맹수.",
    baseHp: 55,
    baseAttack: 22,
    baseDefense: 12,
    catchRate: 0.05,
    skills: [
      "inferno_slash",
      "storm_call",
      "blazing_pounce"
    ],
    evolution: null
  },
  VERDANTCLAW: {
    id: "VERDANTCLAW",
    class: "에픽",
    name: "버던트클로",
    type: "Forest/Spirit",
    description: "가장 깊은 동굴을 지키는 수호자. 고대부터 전해오는 강력한 힘을 지녔다.",
    baseHp: 70,
    baseAttack: 14,
    baseDefense: 22,
    catchRate: 0.05,
    skills: [
      "vine_whip",
      "nature_roar",
      "spirit_drain"
    ],
    evolution: null
  },
  SOLARION: {
    id: "SOLARION",
    class: "전설",
    name: "솔라리온",
    type: "Fire",
    description: "태양 그 자체를 구현했다고 전해지는 전설적인 고양이. 눈부시게 빛난다.",
    baseHp: 100,
    baseAttack: 35,
    baseDefense: 25,
    catchRate: 0.01,
    skills: [
      "solar_beam",
      "firestorm",
      "holy_smite",
      "supernova"
    ],
    evolution: null
  },
  GLACIARA: {
    id: "GLACIARA",
    class: "전설",
    name: "글라시아라",
    type: "Ice",
    description: "주변의 공기를 얼려버리는 신화 속의 고양이. 털은 절대 영도를 상징한다.",
    baseHp: 110,
    baseAttack: 25,
    baseDefense: 35,
    catchRate: 0.01,
    skills: [
      "ice_shard",
      "blizzard_claw",
      "absolute_zero",
      "permafrost"
    ],
    evolution: null
  },
  TEMPESTCLAW: {
    id: "TEMPESTCLAW",
    class: "전설",
    name: "템페스트클로",
    type: "Storm",
    description: "울음소리가 허리케인처럼 들리는 전설적인 고양이. 바람 그 자체를 다스린다.",
    baseHp: 100,
    baseAttack: 35,
    baseDefense: 25,
    catchRate: 0.01,
    skills: [
      "thunder_paw",
      "storm_call",
      "hurricane_strike",
      "typhoon_fury"
    ],
    evolution: null
  },
  AQUARION: {
    id: "AQUARION",
    class: "전설",
    name: "아쿠아리온",
    type: "Water",
    description: "깊은 바다의 지배자. 급류와 같이 거침없고 유연하게 움직인다.",
    baseHp: 105,
    baseAttack: 30,
    baseDefense: 28,
    catchRate: 0.01,
    skills: [
      "aqua_fang",
      "tidal_crash",
      "ocean_wrath",
      "tsunami_burst"
    ],
    evolution: null
  },
  TERRACLAW: {
    id: "TERRACLAW",
    class: "전설",
    name: "테라클로",
    type: "Rock",
    description: "대지 그 자체에서 빚어진 존재. 털은 결코 뚫을 수 없는 단단한 암석과 같다.",
    baseHp: 130,
    baseAttack: 25,
    baseDefense: 45,
    catchRate: 0.01,
    skills: [
      "stone_throw",
      "earth_shatter",
      "mountain_shield",
      "tectonic_slam"
    ],
    evolution: null
  },
  LUMINA: {
    id: "LUMINA",
    class: "전설",
    name: "루미나",
    type: "Light",
    description: "순수한 희망과 빛의 결정체. 사악한 의도를 가진 자들의 눈을 멀게 한다.",
    baseHp: 95,
    baseAttack: 32,
    baseDefense: 25,
    catchRate: 0.01,
    skills: [
      "light_beam",
      "radiant_burst",
      "divine_glow",
      "genesis_light"
    ],
    evolution: null
  },
  AETHERION: {
    id: "AETHERION",
    class: "전설",
    name: "에더리온",
    type: "Mystic",
    description: "에테르의 우주 바람을 타고 떠다니는 신비로운 천상의 고양이.",
    baseHp: 90,
    baseAttack: 35,
    baseDefense: 35,
    catchRate: 0.01,
    skills: [
      "cosmic_roar",
      "star_fall",
      "aether_blast",
      "astral_judgment"
    ],
    evolution: null
  },
  NOCTYRA: {
    id: "NOCTYRA",
    class: "전설",
    name: "녹티라",
    type: "Spirit/Shadow",
    description: "밤의 정적을 지키는 자. 그녀의 발길이 닿는 곳마다 꿈과 악몽이 피어난다.",
    baseHp: 110,
    baseAttack: 30,
    baseDefense: 30,
    catchRate: 0.01,
    skills: [
      "soul_reap",
      "dark_pulse",
      "phantom_claw",
      "dream_eater"
    ],
    evolution: null
  },
  RUSSIAN_BLUE: {
    id: "RUSSIAN_BLUE",
    class: "레어",
    name: "러시안 블루",
    type: "얼음",
    description: "차가운 기운을 머금은 은빛 고양이. 조용하지만 날카롭다.",
    baseHp: 22,
    baseAttack: 7,
    baseDefense: 8,
    catchRate: 0.55,
    skills: [
      "ice_claw_g3",
      "silver_gaze_g3",
      "cold_step_g3"
    ],
    evolution: null
  },
  SIAMESE: {
    id: "SIAMESE",
    class: "레어",
    name: "샴",
    type: "불",
    description: "호기심이 강하고 뜨거운 성격의 고양이.",
    baseHp: 20,
    baseAttack: 9,
    baseDefense: 5,
    catchRate: 0.6,
    skills: [
      "heat_bite_g3",
      "ember_tail_g3",
      "sun_stare_g3"
    ],
    evolution: null
  },
  PERSIAN: {
    id: "PERSIAN",
    class: "레어",
    name: "페르시안",
    type: "빛",
    description: "우아한 털을 휘날리며 빛의 기운을 품은 고양이.",
    baseHp: 24,
    baseAttack: 6,
    baseDefense: 9,
    catchRate: 0.6,
    skills: [
      "light_paw_g3",
      "silk_guard_g3",
      "glow_breath_g3"
    ],
    evolution: null
  },
  MAINE_COON: {
    id: "MAINE_COON",
    class: "레어",
    name: "메인쿤",
    type: "땅",
    description: "거대한 체구와 강한 앞발을 지닌 수호형 고양이.",
    baseHp: 30,
    baseAttack: 8,
    baseDefense: 10,
    catchRate: 0.45,
    skills: [
      "earth_paw_g3",
      "heavy_push_g3",
      "wild_roar_g3"
    ],
    evolution: null
  },
  BENGAL: {
    id: "BENGAL",
    class: "레어",
    name: "벵갈",
    type: "번개",
    description: "표범 같은 무늬를 가진 민첩한 고양이.",
    baseHp: 21,
    baseAttack: 10,
    baseDefense: 5,
    catchRate: 0.55,
    skills: [
      "spark_claw_g3",
      "quick_pounce_g3",
      "flash_tail_g3"
    ],
    evolution: null
  },
  RAGDOLL: {
    id: "RAGDOLL",
    class: "레어",
    name: "랙돌",
    type: "물",
    description: "부드러운 털과 차분한 성격을 가진 치유형 고양이.",
    baseHp: 26,
    baseAttack: 5,
    baseDefense: 9,
    catchRate: 0.65,
    skills: [
      "water_touch_g3",
      "soft_wave_g3",
      "mist_wrap_g3"
    ],
    evolution: null
  },
  SCOTTISH_FOLD: {
    id: "SCOTTISH_FOLD",
    class: "레어",
    name: "스코티시 폴드",
    type: "숲",
    description: "접힌 귀와 잔잔한 숲의 기운을 품은 고양이.",
    baseHp: 23,
    baseAttack: 6,
    baseDefense: 8,
    catchRate: 0.65,
    skills: [
      "leaf_step_g3",
      "vine_bat_g3",
      "nature_hide_g3"
    ],
    evolution: null
  },
  NORWEGIAN_FOREST: {
    id: "NORWEGIAN_FOREST",
    class: "레어",
    name: "노르웨이 숲",
    type: "얼음",
    description: "두꺼운 털로 혹한을 견디는 북방의 고양이.",
    baseHp: 28,
    baseAttack: 8,
    baseDefense: 11,
    catchRate: 0.45,
    skills: [
      "snow_claw_g3",
      "frost_tail_g3",
      "winter_guard_g3"
    ],
    evolution: null
  },
  SPHYNX: {
    id: "SPHYNX",
    class: "레어",
    name: "스핑크스",
    type: "신비",
    description: "매끈한 피부에 신비한 문양이 떠오르는 고양이.",
    baseHp: 20,
    baseAttack: 7,
    baseDefense: 6,
    catchRate: 0.5,
    skills: [
      "mind_wave_g3",
      "arcane_touch_g3",
      "mystic_blink_g3"
    ],
    evolution: null
  },
  BRITISH_SHORTHAIR: {
    id: "BRITISH_SHORTHAIR",
    class: "레어",
    name: "브리티시 숏헤어",
    type: "바위",
    description: "묵직한 몸집과 단단한 방어를 자랑하는 고양이.",
    baseHp: 28,
    baseAttack: 7,
    baseDefense: 12,
    catchRate: 0.5,
    skills: [
      "stone_paw_g3",
      "solid_stance_g3",
      "rock_nudge_g3"
    ],
    evolution: null
  },
  ABYSSINIAN: {
    id: "ABYSSINIAN",
    class: "레어",
    name: "아비시니안",
    type: "불",
    description: "사막의 태양 같은 열기를 품은 날렵한 고양이.",
    baseHp: 19,
    baseAttack: 9,
    baseDefense: 5,
    catchRate: 0.6,
    skills: [
      "sand_heat_g3",
      "fire_dash_g3",
      "sun_bite_g3"
    ],
    evolution: null
  },
  TURKISH_ANGORA: {
    id: "TURKISH_ANGORA",
    class: "레어",
    name: "터키시 앙고라",
    type: "빛",
    description: "새하얀 털과 가벼운 몸놀림으로 빛을 다루는 고양이.",
    baseHp: 21,
    baseAttack: 7,
    baseDefense: 7,
    catchRate: 0.6,
    skills: [
      "light_slash_g3",
      "gleam_tail_g3",
      "halo_step_g3"
    ],
    evolution: null
  },
  SAVANNAH: {
    id: "SAVANNAH",
    class: "레어",
    name: "사바나",
    type: "폭풍",
    description: "긴 다리와 거친 질주를 자랑하는 초원의 고양이.",
    baseHp: 22,
    baseAttack: 10,
    baseDefense: 4,
    catchRate: 0.5,
    skills: [
      "gust_pounce_g3",
      "storm_step_g3",
      "claw_rush_g3"
    ],
    evolution: null
  },
  MUNCHKIN: {
    id: "MUNCHKIN",
    class: "레어",
    name: "먼치킨",
    type: "신비",
    description: "짧은 다리지만 믿기 힘든 속도로 움직이는 고양이.",
    baseHp: 18,
    baseAttack: 7,
    baseDefense: 6,
    catchRate: 0.7,
    skills: [
      "tiny_dash_g3",
      "mana_nudge_g3",
      "lucky_paw_g3"
    ],
    evolution: null
  },
  BIRMAN: {
    id: "BIRMAN",
    class: "레어",
    name: "버만",
    type: "빛",
    description: "성스러운 발을 지녔다고 전해지는 고양이.",
    baseHp: 24,
    baseAttack: 6,
    baseDefense: 8,
    catchRate: 0.55,
    skills: [
      "holy_paw_g3",
      "soft_glow_g3",
      "blessing_tail_g3"
    ],
    evolution: null
  },
  DEVON_REX: {
    id: "DEVON_REX",
    class: "레어",
    name: "데본 렉스",
    type: "폭풍",
    description: "곱슬 털과 장난기 많은 번개 같은 움직임의 고양이.",
    baseHp: 18,
    baseAttack: 8,
    baseDefense: 5,
    catchRate: 0.65,
    skills: [
      "spark_roll_g3",
      "zigzag_claw_g3",
      "wind_nip_g3"
    ],
    evolution: null
  },
  CORNISH_REX: {
    id: "CORNISH_REX",
    class: "레어",
    name: "콘월 렉스",
    type: "바람",
    description: "날렵한 선과 빠른 회피가 특징인 고양이.",
    baseHp: 19,
    baseAttack: 8,
    baseDefense: 5,
    catchRate: 0.65,
    skills: [
      "air_slice_g3",
      "quick_turn_g3",
      "whirl_step_g3"
    ],
    evolution: null
  },
  ORIENTAL_SHORTHAIR: {
    id: "ORIENTAL_SHORTHAIR",
    class: "레어",
    name: "오리엔탈 숏헤어",
    type: "신비",
    description: "예리한 귀와 지적인 눈빛을 가진 마력형 고양이.",
    baseHp: 20,
    baseAttack: 7,
    baseDefense: 6,
    catchRate: 0.6,
    skills: [
      "focus_stare_g3",
      "mana_spike_g3",
      "mind_tap_g3"
    ],
    evolution: null
  },
  AMERICAN_SHORTHAIR: {
    id: "AMERICAN_SHORTHAIR",
    class: "레어",
    name: "아메리칸 숏헤어",
    type: "땅",
    description: "균형 잡힌 체격과 안정적인 전투 능력을 지닌 고양이.",
    baseHp: 24,
    baseAttack: 7,
    baseDefense: 8,
    catchRate: 0.65,
    skills: [
      "steady_claw_g3",
      "earth_step_g3",
      "plain_strike_g3"
    ],
    evolution: null
  },
  EGYPTIAN_MAU: {
    id: "EGYPTIAN_MAU",
    class: "레어",
    name: "이집션 마우",
    type: "빛",
    description: "고대 유적의 비밀을 품고 있다는 전설의 고양이.",
    baseHp: 20,
    baseAttack: 9,
    baseDefense: 5,
    catchRate: 0.55,
    skills: [
      "sun_mark_g3",
      "relic_claw_g3",
      "flash_dash_g3"
    ],
    evolution: null
  },
  TURKISH_VAN: {
    id: "TURKISH_VAN",
    class: "레어",
    name: "터키시 반",
    type: "물",
    description: "물을 두려워하지 않고 헤엄치는 호수의 고양이.",
    baseHp: 23,
    baseAttack: 7,
    baseDefense: 7,
    catchRate: 0.6,
    skills: [
      "lake_splash_g3",
      "wet_claw_g3",
      "wave_turn_g3"
    ],
    evolution: null
  },
  MANX: {
    id: "MANX",
    class: "레어",
    name: "맹크스",
    type: "바위",
    description: "짧은 꼬리와 단단한 하체로 지면을 박차는 고양이.",
    baseHp: 25,
    baseAttack: 8,
    baseDefense: 9,
    catchRate: 0.55,
    skills: [
      "tail_less_rush_g3",
      "stone_jump_g3",
      "hard_push_g3"
    ],
    evolution: null
  },
  NEBELUNG: {
    id: "NEBELUNG",
    class: "레어",
    name: "네벨룽",
    type: "어둠",
    description: "안개처럼 흐릿한 털빛을 가진 그림자 고양이.",
    baseHp: 21,
    baseAttack: 8,
    baseDefense: 6,
    catchRate: 0.55,
    skills: [
      "mist_shadow_g3",
      "dark_swipe_g3",
      "night_step_g3"
    ],
    evolution: null
  },
  HAVANA_BROWN: {
    id: "HAVANA_BROWN",
    class: "레어",
    name: "하바나 브라운",
    type: "불",
    description: "짙은 갈색 털에 은근한 열기를 품은 고양이.",
    baseHp: 21,
    baseAttack: 8,
    baseDefense: 6,
    catchRate: 0.6,
    skills: [
      "warm_bite_g3",
      "ember_swipe_g3",
      "brown_flare_g3"
    ],
    evolution: null
  },
  RAGAMUFFIN: {
    id: "RAGAMUFFIN",
    class: "레어",
    name: "라가머핀",
    type: "물",
    description: "온화한 성격과 넓은 품을 지닌 회복형 고양이.",
    baseHp: 27,
    baseAttack: 5,
    baseDefense: 9,
    catchRate: 0.65,
    skills: [
      "healing_drop_g3",
      "soft_wave_g3",
      "calm_tail_g3"
    ],
    evolution: null
  },
  CHARTREUX: {
    id: "CHARTREUX",
    class: "레어",
    name: "차트뢰",
    type: "바람",
    description: "푸른 회색 털과 조용한 움직임이 특징인 고양이.",
    baseHp: 23,
    baseAttack: 7,
    baseDefense: 8,
    catchRate: 0.55,
    skills: [
      "sky_claw_g3",
      "silent_step_g3",
      "blue_gust_g3"
    ],
    evolution: null
  },
  SINGAPURA: {
    id: "SINGAPURA",
    class: "레어",
    name: "싱가푸라",
    type: "번개",
    description: "작지만 엄청난 에너지를 품은 도시형 고양이.",
    baseHp: 17,
    baseAttack: 8,
    baseDefense: 4,
    catchRate: 0.75,
    skills: [
      "tiny_spark_g3",
      "electric_nip_g3",
      "flash_step_g3"
    ],
    evolution: null
  },
  SOMALI: {
    id: "SOMALI",
    class: "레어",
    name: "소말리",
    type: "불",
    description: "붉은 털과 뜨거운 야성을 지닌 사냥꾼 고양이.",
    baseHp: 20,
    baseAttack: 9,
    baseDefense: 5,
    catchRate: 0.6,
    skills: [
      "red_claw_g3",
      "fire_rush_g3",
      "ember_roar_g3"
    ],
    evolution: null
  },
  TOYGER: {
    id: "TOYGER",
    class: "레어",
    name: "토이거",
    type: "땅",
    description: "작은 호랑이처럼 보이는 줄무늬 고양이.",
    baseHp: 24,
    baseAttack: 9,
    baseDefense: 7,
    catchRate: 0.55,
    skills: [
      "stripe_pounce_g3",
      "earth_roar_g3",
      "hunter_step_g3"
    ],
    evolution: null
  },
  BURMILLA: {
    id: "BURMILLA",
    class: "레어",
    name: "버밀라",
    type: "빛",
    description: "은은하게 반짝이는 털빛을 가진 우아한 고양이.",
    baseHp: 22,
    baseAttack: 7,
    baseDefense: 7,
    catchRate: 0.6,
    skills: [
      "silver_flash_g3",
      "light_bite_g3",
      "mirror_tail_g3"
    ],
    evolution: null
  },
  SELKIRK_REX: {
    id: "SELKIRK_REX",
    class: "레어",
    name: "셀커크 렉스",
    type: "바위",
    description: "곱슬 털과 묵직한 체구를 동시에 지닌 독특한 고양이.",
    baseHp: 26,
    baseAttack: 7,
    baseDefense: 10,
    catchRate: 0.55,
    skills: [
      "curl_guard_g3",
      "stone_roll_g3",
      "rough_paw_g3"
    ],
    evolution: null
  }
};

import re
import sys
import os

# Skill category data based on skills.js
SKILLS_TIER3 = {
    'Forest': ['vine_swipe', 'leaf_dart', 'forest_guard'],
    'Fire': ['ember_bite', 'flame_dash', 'heat_claw', 'firestorm'],
    'Water': ['water_slash', 'mist_burst', 'tidal_wave', 'aqua_fang', 'tidal_crash', 'ocean_wrath'],
    'Rock': ['pebble_toss', 'rock_smash', 'stone_throw', 'earth_shatter', 'mountain_shield'],
    'Ice': ['ice_shard', 'frost_breath', 'blizzard_claw', 'absolute_zero'],
    'Storm': ['spark_strike', 'thunder_paw', 'storm_call'],
    'Shadow': ['shadow_sneak', 'dark_pulse', 'void_strike'],
    'Spirit': ['phantom_claw', 'soul_reap', 'void_strike'],
    'Mystic': ['star_fall', 'cosmic_roar', 'aether_blast'],
    'Light': ['solar_beam', 'holy_smite', 'light_beam', 'radiant_burst', 'divine_glow'],
    'Normal': ['scratch', 'quick_strike', 'void_strike', 'gust', 'hurricane_strike']
}

SKILLS_TIER1 = {
    'Forest': ['thorn_whip', 'root_snare', 'nature_roar'],
    'Fire': ['inferno_slash', 'blazing_pounce', 'nature_roar'],
    'Mystic': ['mana_burst', 'celestial_strike', 'star_fall'],
    'Water': ['nature_roar', 'bite', 'pounce'],
    'Normal': ['bite', 'pounce', 'flurry', 'spectral_strike', 'celestial_strike', 'vine_whip', 'spirit_drain']
}

SKILLS_LEGENDARY_POOL = [
    'world_tree_root', 'abyssal_devour', 'supernova', 'permafrost', 'typhoon_fury',
    'tsunami_burst', 'tectonic_slam', 'genesis_light', 'astral_judgment', 'dream_eater'
]

LEGENDARY_THEMES = {
    'Forest': ['world_tree_root', 'nature_roar', 'abyssal_devour', 'dream_eater'],
    'Fire': ['supernova', 'genesis_light', 'astral_judgment', 'typhoon_fury'],
    'Water': ['tsunami_burst', 'typhoon_fury', 'abyssal_devour', 'dream_eater'],
    'Ice': ['permafrost', 'tsunami_burst', 'abyssal_devour', 'dream_eater'],
    'Storm': ['typhoon_fury', 'supernova', 'astral_judgment', 'abyssal_devour'],
    'Rock': ['tectonic_slam', 'abyssal_devour', 'dream_eater', 'world_tree_root'],
    'Light': ['genesis_light', 'supernova', 'astral_judgment', 'world_tree_root'],
    'Shadow': ['abyssal_devour', 'dream_eater', 'supernova', 'astral_judgment'],
    'Spirit': ['dream_eater', 'abyssal_devour', 'astral_judgment', 'supernova'],
    'Mystic': ['astral_judgment', 'genesis_light', 'supernova', 'abyssal_devour']
}

TYPE_NORM = {
    'Forest': 'Forest', 'Grass': 'Forest', '풀': 'Forest', '숲': 'Forest',
    'Fire': 'Fire', '불': 'Fire',
    'Water': 'Water', '물': 'Water',
    'Rock': 'Rock', '바위': 'Rock', '땅': 'Rock',
    'Ice': 'Ice', '얼음': 'Ice',
    'Storm': 'Storm', '번개': 'Storm', '폭풍': 'Storm',
    'Shadow': 'Shadow', '어둠': 'Shadow', '그림자': 'Shadow',
    'Spirit': 'Spirit', '영혼': 'Spirit',
    'Mystic': 'Mystic', '신비': 'Mystic',
    'Light': 'Light', '빛': 'Light',
    'Normal': 'Normal', '노말': 'Normal'
}

FILLER_SKILLS = [f"filler_skill_{i}" for i in range(1, 44)]
rare_count = 0

def get_basic_skills(key_typ):
    pool = SKILLS_TIER3.get(key_typ, SKILLS_TIER3['Normal'])
    if len(pool) < 3:
        combined = pool + [s for s in SKILLS_TIER3['Normal'] if s not in pool]
        return combined[:3]
    return pool[:3]

def get_elite_skills():
    global rare_count
    skills = [
        FILLER_SKILLS[(rare_count * 3) % 43],
        FILLER_SKILLS[(rare_count * 3 + 1) % 43],
        FILLER_SKILLS[(rare_count * 3 + 2) % 43]
    ]
    rare_count += 1
    return skills

def get_apex_skills(key_typ):
    pool = SKILLS_TIER1.get(key_typ, [])
    normals = SKILLS_TIER1['Normal']
    combined = pool + [s for s in normals if s not in pool]
    return combined[:3]

def get_legendary_skills(key_typ):
    pool = LEGENDARY_THEMES.get(key_typ, SKILLS_LEGENDARY_POOL)
    # Ensure 4 skills by padding with rest of pool if needed
    if len(pool) < 4:
        pool = pool + [s for s in SKILLS_LEGENDARY_POOL if s not in pool]
    return pool[:4]

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    current_object = None
    buffer = []
    
    in_creatures = False
    
    for line in lines:
        # Detect start of a creature block
        match = re.search(r'^\s*([A-Z0-9_]+):\s*{', line)
        if match:
            current_object = match.group(1)
            buffer = [line]
            continue
        
        if current_object:
            buffer.append(line)
            if re.search(r'^\s*},?\s*$', line):
                # Process the block
                block = "".join(buffer)
                
                class_m = re.search(r'class:\s*"(.*?)"', block)
                type_m = re.search(r'type:\s*"(.*?)"', block)
                
                if class_m and type_m:
                    cls = class_m.group(1)
                    typ = type_m.group(1).split('/')[0].strip()
                    key_typ = TYPE_NORM.get(typ, 'Normal')
                    
                    new_skills = []
                    if cls in ['스타팅', '노말']:
                        new_skills = get_basic_skills(key_typ)
                    elif cls == '레어':
                        new_skills = get_elite_skills()
                    elif cls == '에픽':
                        new_skills = get_apex_skills(key_typ)
                    elif cls == '전설':
                        new_skills = get_legendary_skills(key_typ)
                    
                    if new_skills:
                        skills_block = '    skills: [\n' + ',\n'.join([f'      "{s}"' for s in new_skills]) + '\n    ],\n'
                        
                        if 'skills:' in block:
                            block = re.sub(r'\s*skills:\s*\[.*?\]\s*,?\s*\n', '\n' + skills_block, block, flags=re.DOTALL)
                        else:
                            # Insert after catchRate or baseDefense
                            if 'catchRate:' in block:
                                block = block.replace('catchRate:', 'catchRate:')
                                block = re.sub(r'(catchRate:.*?\n)', r'\1' + skills_block, block)
                            else:
                                block = re.sub(r'(baseDefense:.*?\n)', r'\1' + skills_block, block)

                new_lines.append(block)
                current_object = None
                buffer = []
            continue
        
        new_lines.append(line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    target = 'c:\\Feloria\\Feloria\\src\\game\\data\\creatures.js'
    process_file(target)
    print("Restore complete.")

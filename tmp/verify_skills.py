import re
import os

def verify_skills(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all blocks
    blocks = re.findall(r'([A-Z0-9_]+):\s*{(.*?)}', content, re.DOTALL)
    
    results = []
    for cid, body in blocks:
        class_m = re.search(r'class:\s*"(.*?)"', body)
        skills_m = re.findall(r'"(.*?)"', re.search(r'skills:\s*\[(.*?)\]', body, re.DOTALL).group(1)) if re.search(r'skills:\s*\[(.*?)\]', body, re.DOTALL) else []
        
        if not class_m:
            continue
            
        cls = class_m.group(1)
        count = len(skills_m)
        
        expected = 4 if cls == '전설' else 3
        
        if count != expected:
            results.append(f"FAIL: {cid} ({cls}) has {count} skills, expected {expected}")
        else:
            pass # Success

    if not results:
        print("Verification SUCCESS: All creatures have correct skill counts.")
    else:
        for res in results:
            print(res)

if __name__ == "__main__":
    target = 'c:\\Feloria\\Feloria\\src\\game\\data\\creatures.js'
    verify_skills(target)

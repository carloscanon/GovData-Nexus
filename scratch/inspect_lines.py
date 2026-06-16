with open("C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(1339, 1352):
    print(f"{i+1}: {repr(lines[i])}")

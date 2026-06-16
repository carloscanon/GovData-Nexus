import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

start_line = -1
end_line = -1
for i, line in enumerate(lines):
    if "selectedPolicy && (" in line:
        start_line = i
    if start_line != -1 and line.strip() == ")}" and i > start_line:
        bracket_count = 0
        for j in range(start_line, i + 1):
            bracket_count += lines[j].count("{") - lines[j].count("}")
        if bracket_count == 0:
            end_line = i
            break

if start_line != -1 and end_line != -1:
    modal_content = "\n".join(lines[start_line:end_line+1])
    with open("C:/Users/carlo/Desktop/GovData Nexus/scratch/selected_policy_modal_head.tsx", "w", encoding="utf-8") as f:
        f.write(modal_content)
    print(f"Exported selectedPolicy modal (lines {start_line+1} to {end_line+1}) to scratch.")
else:
    print("Not found!")

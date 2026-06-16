import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

# Search for the start of selectedPolicy block (probably {selectedPolicy && ...)
start_line = -1
end_line = -1
for i, line in enumerate(lines):
    if "selectedPolicy && (" in line:
        start_line = i
    if start_line != -1 and line.strip() == ")}" and i > start_line:
        # Check if this closes the selectedPolicy block
        # Let's count open brackets
        bracket_count = 0
        for j in range(start_line, i + 1):
            bracket_count += lines[j].count("{") - lines[j].count("}")
        if bracket_count == 0:
            end_line = i
            break

print(f"Start: {start_line+1}, End: {end_line+1}")
if start_line != -1 and end_line != -1:
    for idx in range(start_line, end_line + 1):
        print(f"{idx+1}: {lines[idx]}")

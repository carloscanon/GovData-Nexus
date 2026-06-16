import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

start_line = -1
end_line = -1
for i, line in enumerate(lines):
    if "printContainer" in line or "printHeader" in line or "printFooter" in line:
        if start_line == -1:
            start_line = i - 5
        end_line = i + 15

print(f"Start: {start_line+1}, End: {end_line+1}")
if start_line != -1 and end_line != -1:
    for idx in range(start_line, end_line + 1):
        print(f"{idx+1}: {lines[idx]}")

import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

for idx, line in enumerate(lines):
    if "selectedPolicy" in line and 300 < idx < 1800:
        print(f"Line {idx+1}: {line}")
        start = max(0, idx - 2)
        end = min(len(lines), idx + 8)
        for c in range(start, end):
            print(f"  {c+1}: {lines[c]}")
        print("-" * 40)

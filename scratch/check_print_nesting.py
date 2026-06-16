import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

for i in range(1859, 1876):
    print(f"{i+1}: {lines[i]}")

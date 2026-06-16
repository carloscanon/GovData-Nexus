import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

# Lines 1864 to 1947 (0-indexed indices 1863 to 1946)
print_lines = lines[1863:1947]
printable_block = "\n".join(print_lines)

with open("C:/Users/carlo/Desktop/GovData Nexus/scratch/printable_document_head.txt", "w", encoding="utf-8") as f:
    f.write(printable_block)
print("Successfully written to scratch/printable_document_head.txt")

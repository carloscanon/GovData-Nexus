import subprocess

res = subprocess.run(["git", "show", "HEAD:src/app/policies/page.tsx"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.splitlines()

# Search for "Template Formal para"
start_idx = -1
for i, line in enumerate(lines):
    if "Template Formal para" in line:
        start_idx = i
        break

if start_idx != -1:
    # Let's count matching parentheses for {selectedPolicy && (
    bracket_count = 0
    end_idx = -1
    for idx in range(start_idx + 1, len(lines)):
        if "selectedPolicy && (" in lines[idx]:
            bracket_count = 1
            for k in range(idx + 1, len(lines)):
                bracket_count += lines[k].count("(") - lines[k].count(")")
                if bracket_count == 0 and lines[k].strip() == ")":
                    # Let's check if there is an outer check
                    end_idx = k + 1
                    break
            break
            
    print(f"Start: {start_idx+1}, End: {end_idx+1}")
    if end_idx != -1:
        printable_block = "\n".join(lines[start_idx:end_idx+1])
        with open("C:/Users/carlo/Desktop/GovData Nexus/scratch/printable_document_head.txt", "w", encoding="utf-8") as f:
            f.write(printable_block)
        print("Successfully written to scratch/printable_document_head.txt")
else:
    print("Not found!")

filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Locate the conditional line in policies/page.tsx:
# {selectedPolicy.status === 'Subir Documento' || selectedPolicy.status === 'Borrador' || (selectedPolicy.currentStep === 0 && !selectedPolicy.documentUrl) ? (
target_cond = "selectedPolicy.status === 'Subir Documento' || selectedPolicy.status === 'Borrador' || (selectedPolicy.currentStep === 0 && !selectedPolicy.documentUrl)"

# Let's replace it with a cleaner condition that only requires upload if documentUrl is missing
replacement_cond = "((selectedPolicy.status === 'Subir Documento' || selectedPolicy.status === 'Borrador') && !selectedPolicy.documentUrl)"

content = content.replace(target_cond, replacement_cond)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Display condition for document upload updated successfully.")

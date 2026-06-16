filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Let's locate the Approve Workflow Modal block
target_str = """                      setIsApproveModalOpen(false);
                      setPolicyToApprove(null);
                    }}
                  >
                    Asignar y Avanzar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

# Load the print template block
with open("C:/Users/carlo/Desktop/GovData Nexus/scratch/printable_document_head.txt", "r", encoding="utf-8") as f:
    print_template = f.read()

# Insert the print template right after the target block
replacement_str = target_str + "\n\n      " + print_template

content = content.replace(target_str, replacement_str)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Print document template restored successfully!")

import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Remove the later declaration
content = content.replace("const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);\n      \n      if (isMobile) {", "if (isMobile) {")

# Add it before exportOptions
old_start = """      // Small delay to ensure all DOM is fully painted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      
      const exportOptions = {"""

new_start = """      // Small delay to ensure all DOM is fully painted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const exportOptions = {"""

content = content.replace(old_start, new_start)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


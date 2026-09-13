import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 7. Table row gap
content = content.replace("gap-[3px]", "gap-[2px]")

# 8. Venue Row margin
content = content.replace("gap-3 w-full mb-4", "gap-3 w-full mb-2")

# 9. Phase Details margin
content = content.replace("px-4 py-1.5 mb-2", "px-4 py-1.5 mb-1.5")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Update scale height reference
content = content.replace("containerHeight / 1100", "containerHeight / 1000")

# 2. Update inline canvas wrapper styles
content = content.replace("height: 1100 * previewScale", "height: 1000 * previewScale")

# 3. Update tailwind class dimensions
content = content.replace("h-[1100px]", "h-[1000px]")

# 4. Update the overlay scaling
content = content.replace("window.innerHeight / 1100", "window.innerHeight / 1000")

# 5. Update inline styling for screenshot mode
content = content.replace("height: '1100px'", "height: '1000px'")

# To be safe, any remaining 1100px -> 1000px
content = content.replace("1100px", "1000px")
# any remaining 1100 -> 1000 for height logic
# Actually, the above replacements should catch everything related to the dimensions.

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


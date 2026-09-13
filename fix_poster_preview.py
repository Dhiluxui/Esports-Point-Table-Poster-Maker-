import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Remove the invalid SCREENSHOT MODE OVERLAY block from the bottom
overlay_pattern = r'\{\/\* SCREENSHOT MODE OVERLAY \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*;\s*\}|\s*<\/div>\s*\)\s*;\s*\})'
# A more robust way to remove it:
start_idx = content.find('{/* SCREENSHOT MODE OVERLAY */}')
if start_idx != -1:
    end_string = '      )}'
    end_idx = content.find(end_string, start_idx)
    if end_idx != -1:
        # Also need to make sure we get the closing tag of the condition
        end_idx = end_idx + len(end_string)
        content = content[:start_idx] + content[end_idx:]

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


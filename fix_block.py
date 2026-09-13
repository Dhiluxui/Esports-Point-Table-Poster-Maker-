import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# fix 892 line
content = content.replace("(!isOwner || mobileTab === 'preview' || screenshotMode)", "(!isOwner || mobileTab === 'preview')")

# remove the block from {false && ( to )}
block_pattern = r"\s*\{false && \(\s*<div className=\"absolute top-4.*?</div>\s*\)\}"
content = re.sub(block_pattern, "", content, flags=re.DOTALL)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


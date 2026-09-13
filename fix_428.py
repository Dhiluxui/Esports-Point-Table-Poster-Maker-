import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

content = content.replace("style={{ display: screenshotMode ? 'none' : undefined }}", "")
content = content.replace("${mobileTab === 'editor' && !'hidden lg:flex'}", "${mobileTab === 'editor' ? '' : 'hidden lg:flex'}")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Replace any remaining screenshotMode ternary strings with just the falsy class
content = re.sub(r"\$\{screenshotMode \? '[^']*' : '([^']*)'\}", r"\1", content)
content = re.sub(r"\$\{screenshotMode \? '[^']*' : ''\}", "", content)
content = re.sub(r"screenshotMode \? '[^']*' : '([^']*)'", r"'\1'", content)
content = re.sub(r"screenshotMode \? '[^']*' : ''", "''", content)

# Remove the whole overlay block at the bottom
overlay_pattern = r"\{/\* SCREENSHOT MODE OVERLAY \*/\}[\s\S]*?(?=</div>\s*<div[^>]*>\{/\* EXPORT MODAL \*/\}|</div>\s*\)\s*;\s*\})"
content = re.sub(overlay_pattern, "", content)

# just in case
content = content.replace("!screenshotMode &&", "")
content = content.replace("screenshotMode &&", "false &&")
content = content.replace("setScreenshotMode(false)", "")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

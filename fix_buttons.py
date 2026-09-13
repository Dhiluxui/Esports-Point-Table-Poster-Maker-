import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Remove Share Link button
share_btn_pattern = r"""              <button\s+onClick=\{copyPublicLink\}\s+className="[^"]*"\s*>\s*<Copy className="[^"]*" />\s*\{copySuccess \|\| 'Share Link'\}\s*</button>"""
content = re.sub(share_btn_pattern, "", content)

# 2. Remove Screenshot Mode button
screenshot_btn_pattern = r"""          <button\s+onClick=\{[^}]*setScreenshotMode\(true\)\}\s+className="[^"]*"\s*>\s*<Maximize2 className="[^"]*" />\s*Screenshot Mode\s*</button>"""
content = re.sub(screenshot_btn_pattern, "", content)

# 3. Rename Export Poster to 'Save Image' or similar? I'll keep it as Export Poster or just change it to 'Save to Device'
# Wait, user might still look for 'Export Poster'. I'll leave it as 'Export Poster'.
content = content.replace("{isExporting ? 'Exporting...' : 'Export Poster'}", "{isExporting ? 'Saving...' : 'Save to Device'}")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

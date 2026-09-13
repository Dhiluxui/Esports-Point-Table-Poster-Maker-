import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Remove duplicate Download and Maximize2 (since we don't use it anymore)
content = content.replace("Maximize2, Download, Trash2,", "Trash2,")

# 2. Let's see if screenshotMode is used
# we still have screenshotMode state?
# Let's check where it's used.
content = content.replace("const [screenshotMode, setScreenshotMode] = useState(false);", "")
# the main container class uses screenshotMode
content = content.replace("${screenshotMode ? 'fixed inset-0 z-[9999] bg-black' : ''}", "")

# Also there's a setScreenshotMode(true) in the try/catch fallback
fallback_code = """      if (window.confirm('Your device browser blocked the automatic export. Would you like to open Fullscreen Mode so you can take a screenshot instead?')) {
        setScreenshotMode(true);
      }"""
content = content.replace(fallback_code, "alert('Please try again. Your browser blocked the download.');")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

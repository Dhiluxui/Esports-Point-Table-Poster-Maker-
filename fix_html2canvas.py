import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Swap import back to html-to-image
content = content.replace("import html2canvas from 'html2canvas';", "import * as htmlToImage from 'html-to-image';")

# Find the export logic block
old_export_pattern = r'      const canvas = await html2canvas.*?const dataUrl = canvas\.toDataURL\(\'image/png\'\);'

new_export_logic = """      const dataUrl = await htmlToImage.toPng(posterRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });"""

content = re.sub(old_export_pattern, new_export_logic, content, flags=re.DOTALL)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

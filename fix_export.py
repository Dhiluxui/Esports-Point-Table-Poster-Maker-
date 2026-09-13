import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

old_options = """      const exportOptions = {
        scale: isMobile ? 1.5 : 2, // Slightly lower scale on mobile prevents RAM crash on Xiaomi/budget devices
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },"""

new_options = """      const exportOptions = {
        width: 800,
        height: 1000,
        scale: isMobile ? 1.5 : 2, // Slightly lower scale on mobile prevents RAM crash on Xiaomi/budget devices
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '800px',
          height: '1000px'
        },"""

content = content.replace(old_options, new_options)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

replacements = {
    "'https://i.ibb.co/jtBpNKy/ff3296e8-d09a-4995-841a-c67ae36fc17d.jpg'": "'/assets/default-bg.jpg'",
    "'https://i.ibb.co/Q7wZKMNy/edited-photo.png'": "'/assets/default-logo.png'",
    "'https://i.ibb.co/LzVwR5w6/i-need-only-logo-now-202606011213-removebg-preview.png'": "'/assets/default-tl.png'",
    "'https://i.ibb.co/6cdfW7yW/Whats-App-Image-2026-05-04-at-5-47-10-PM-1-removebg-preview.png'": "'/assets/default-tr.png'",
    "'https://i.ibb.co/LLBfHtC/IMG-3269-2.png'": "'/assets/default-sponsor.png'",
    "'https://i.ibb.co/3m3JZCY0/edited-photo-1.png'": "'/assets/default-college.png'"
}

for old_str, new_str in replacements.items():
    content = content.replace(old_str, new_str)

# Also let's update modern-screenshot options to reduce memory usage on mobile (fixes blank exports caused by RAM)
old_export = """      const exportOptions = {
        scale: 2,
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        fetch: {
          bypassingCache: true
        }
      };"""

new_export = """      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const exportOptions = {
        scale: isMobile ? 1.5 : 2, // Slightly lower scale on mobile prevents RAM crash on Xiaomi/budget devices
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        fetch: {
          bypassingCache: true
        }
      };"""

content = content.replace(old_export, new_export)

# Ensure the isMobile variable isn't redeclared later in the block
content = content.replace("const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);", "", 1) # Only replace the second one

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


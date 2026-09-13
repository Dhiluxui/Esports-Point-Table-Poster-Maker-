import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Tagline margin: mb-6 mt-2 -> mb-4 mt-2
content = content.replace("mb-6 mt-2", "mb-3 mt-2")
content = content.replace("h-[35px] mb-6 mt-2", "h-[25px] mb-3 mt-2")

# 2. Top Header margin: mb-10 -> mb-4
content = content.replace("mb-10 overflow-visible", "mb-4 overflow-visible")

# 3. Top Logo height: h-[155px] -> h-[135px]
content = content.replace("h-[155px]", "h-[135px]")
content = content.replace("w-[130px] h-[155px]", "w-[120px] h-[135px]")

# 4. Table Header height: h-[38px] -> h-[34px]
content = content.replace("h-[38px] bg-[var(--theme-primary)]", "h-[34px] bg-[var(--theme-primary)]")

# 5. Table Row height: h-[40px] -> h-[37px]
content = content.replace("h-[40px] flex items-center", "h-[37px] flex items-center")

# 6. Bottom padding: pb-6 -> pb-4
content = content.replace("px-10 pb-6", "px-10 pb-4")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

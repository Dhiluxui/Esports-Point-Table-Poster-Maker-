import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Let's ensure the total points font size fits nicely in the 37px row
content = content.replace("text-[24px] font-black pb-0.5", "text-[22px] font-black pb-0.5")
content = content.replace("text-[20px] font-semibold", "text-[18px] font-semibold")
content = content.replace("text-[19px] font-bold", "text-[17px] font-bold")
content = content.replace("text-[72px] font-black text-transparent", "text-[68px] font-black text-transparent")
content = content.replace("text-[65px] font-black text-transparent", "text-[62px] font-black text-transparent")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

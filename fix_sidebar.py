import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

old_sidebar = """        {/* LEFT PANEL: CONTROLS */}
        <div className={`w-full lg:w-[450px] flex-shrink-0 border-r-0 lg:border-r border-cyan-900/30 bg-[#070f22] lg:overflow-y-auto hidden-scrollbar ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'} flex-col pb-20 lg:pb-0`}>"""

new_sidebar = """        {/* LEFT PANEL: CONTROLS */}
        {isOwner && (
        <div className={`w-full lg:w-[450px] flex-shrink-0 border-r-0 lg:border-r border-cyan-900/30 bg-[#070f22] lg:overflow-y-auto hidden-scrollbar ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'} flex-col pb-20 lg:pb-0`}>"""

old_end_sidebar = """            </div>
          </div>
        </div>""" # We need to be careful with where the sidebar ends. Let's find the exact end.

content = content.replace(old_sidebar, new_sidebar)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

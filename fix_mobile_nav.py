import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Default to preview if not owner
# We'll just force it to 'preview' in the className for RIGHT PANEL if !isOwner
old_right_panel = """        {/* RIGHT PANEL: POSTER PREVIEW */}
        <div ref={previewContainerRef} className={`flex-1 bg-[#010815] p-2 lg:p-4 overflow-auto items-center justify-start lg:justify-center relative pb-24 lg:pb-0 ${mobileTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`} style={{ backgroundImage: 'radial-gradient(circle at center, #021a30 0%, #010815 100%)' }}>"""

new_right_panel = """        {/* RIGHT PANEL: POSTER PREVIEW */}
        <div ref={previewContainerRef} className={`flex-1 bg-[#010815] p-2 lg:p-4 overflow-auto items-center justify-start lg:justify-center relative pb-24 lg:pb-0 ${(!isOwner || mobileTab === 'preview') ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`} style={{ backgroundImage: 'radial-gradient(circle at center, #021a30 0%, #010815 100%)' }}>"""

content = content.replace(old_right_panel, new_right_panel)

# Hide mobile nav if not owner
old_mobile_nav = """      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070f22] border-t border-cyan-900/50 flex">"""

new_mobile_nav = """      {/* MOBILE BOTTOM NAVIGATION */}
      {isOwner && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070f22] border-t border-cyan-900/50 flex z-50">"""

# Close mobile nav block
old_close_nav = """        </button>
      </div>

      {/* TEAMS MANAGER MODAL */}"""

new_close_nav = """        </button>
      </div>
      )}

      {/* TEAMS MANAGER MODAL */}"""

content = content.replace(old_mobile_nav, new_mobile_nav)
content = content.replace(old_close_nav, new_close_nav)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Remove the bad SCREENSHOT MODE OVERLAY block from the bottom
overlay_pattern = r'\{\/\* SCREENSHOT MODE OVERLAY \*\/\}[\s\S]*?\{\/\* EXPORT FALLBACK MODAL FOR MOBILE \*\/\}'
if "{/* SCREENSHOT MODE OVERLAY */}" in content:
    content = re.sub(overlay_pattern, '{/* EXPORT FALLBACK MODAL FOR MOBILE */}', content)

# 2. Update the main container and header to hide during screenshot mode
header_search = '      <header className="border-b border-white/5 bg-[#0b132b]/80 backdrop-blur-md px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">'
if header_search in content:
    content = content.replace(header_search, '      <header className={`border-b border-white/5 bg-[#0b132b]/80 backdrop-blur-md px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 ${screenshotMode ? \'hidden\' : \'\'}`}>')

main_search = '      <main className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-130px)] md:h-[calc(100vh-73px)] lg:overflow-hidden">'
if main_search in content:
    content = content.replace(main_search, '      <main className={`flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-130px)] md:h-[calc(100vh-73px)] lg:overflow-hidden ${screenshotMode ? \'fixed inset-0 z-[9999] bg-black\' : \'\'}`}>')

# 3. Update Left Panel to hide during screenshot mode
left_panel_search = '<div className={`w-full lg:w-[450px] flex-shrink-0 border-r-0 lg:border-r border-cyan-900/30 bg-[#070f22] lg:overflow-y-auto hidden-scrollbar ${mobileTab === \'editor\' ? \'flex\' : \'hidden lg:flex\'} flex-col pb-20 lg:pb-0`}>'
if left_panel_search in content:
    content = content.replace(left_panel_search, '<div className={`w-full lg:w-[450px] flex-shrink-0 border-r-0 lg:border-r border-cyan-900/30 bg-[#070f22] lg:overflow-y-auto hidden-scrollbar ${mobileTab === \'editor\' && !screenshotMode ? \'flex\' : \'hidden lg:flex\'} ${screenshotMode ? \'-hidden\' : \'\'} flex-col pb-20 lg:pb-0`} style={{ display: screenshotMode ? \'none\' : undefined }}>')

# 4. Update Right panel
right_panel_search = '<div ref={previewContainerRef} className={`flex-1 bg-[#010815] p-2 lg:p-4 overflow-auto items-center justify-start lg:justify-center relative pb-24 lg:pb-0 ${(!isOwner || mobileTab === \'preview\') ? \'flex flex-col\' : \'hidden lg:flex lg:flex-col\'}`}'
if right_panel_search in content:
    content = content.replace(right_panel_search, '<div ref={previewContainerRef} className={`flex-1 bg-[#010815] p-2 lg:p-4 overflow-auto items-center justify-center relative ${screenshotMode ? \'fixed inset-0 z-[9999] w-full h-full pb-0 bg-black\' : \'pb-24 lg:pb-0\'} ${(!isOwner || mobileTab === \'preview\' || screenshotMode) ? \'flex flex-col\' : \'hidden lg:flex lg:flex-col\'}`}')

# 5. Add a floating Exit button inside the right panel when in screenshot mode
# First find where the inner scaling wrapper starts
canvas_wrapper_search = '{/* THE SCALED CANVAS WRAPPER */}'
floating_button = """          {screenshotMode && (
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50 w-full max-w-md mx-auto">
              <div className="bg-black/80 text-cyan-400 text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md animate-pulse font-bold shadow-lg shadow-cyan-900/50">
                Take a screenshot now!
              </div>
              <button 
                onClick={() => setScreenshotMode(false)}
                className="p-2 bg-red-600 hover:bg-red-500 rounded-full text-white shadow-lg transition-all flex items-center gap-1 border border-red-400/50"
              >
                <X className="w-4 h-4" />
                <span className="text-xs font-bold pr-1">Exit</span>
              </button>
            </div>
          )}
          {/* THE SCALED CANVAS WRAPPER */}"""
if canvas_wrapper_search in content:
    content = content.replace(canvas_wrapper_search, floating_button)

# Also hide mobile tabs when in screenshot mode
tabs_search = '{isOwner && ('
tabs_replace = '{isOwner && !screenshotMode && ('
# wait, let's just do a specific replace for the tabs wrapper
tabs_full_search = '      {/* MOBILE TABS */}\n      {isOwner && ('
if tabs_full_search in content:
    content = content.replace(tabs_full_search, '      {/* MOBILE TABS */}\n      {isOwner && !screenshotMode && (')

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


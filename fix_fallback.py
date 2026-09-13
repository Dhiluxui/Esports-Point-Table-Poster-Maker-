import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Add screenshotMode state
if "const [screenshotMode, setScreenshotMode] = useState(false);" not in content:
    content = content.replace("const [isExporting, setIsExporting] = useState(false);", "const [isExporting, setIsExporting] = useState(false);\n  const [screenshotMode, setScreenshotMode] = useState(false);")
    content = content.replace("import { Maximize2, X } from 'lucide-react';", "import { Maximize2, X, Download } from 'lucide-react';") # make sure we have icons
    if "Maximize2" not in content:
        content = content.replace("import { Download,", "import { Download, Maximize2,")

# Update export logic catch block to suggest screenshot mode
old_catch = """    } catch (err) {
      console.error('Failed to export poster', err);
      alert('Failed to process image due to mobile browser limitations. Try taking a screenshot, or use Chrome on Desktop.');
    } finally {"""

new_catch = """    } catch (err) {
      console.error('Failed to export poster', err);
      if (window.confirm('Your device browser blocked the automatic export. Would you like to open Fullscreen Mode so you can take a screenshot instead?')) {
        setScreenshotMode(true);
      }
    } finally {"""

content = content.replace(old_catch, new_catch)

# Add Screenshot Mode button next to export
old_export_btn = """          <button
            onClick={exportPoster}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          >
            <Download className="w-4 h-4 hidden md:block" />
            {isExporting ? 'Exporting...' : 'Export Poster'}
          </button>"""

new_export_btn = """          <button
            onClick={() => setScreenshotMode(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors text-purple-300 whitespace-nowrap lg:hidden"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Screenshot Mode
          </button>
          
          <button
            onClick={exportPoster}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          >
            <Download className="w-4 h-4 hidden md:block" />
            {isExporting ? 'Exporting...' : 'Export Poster'}
          </button>"""

content = content.replace(old_export_btn, new_export_btn)

# Render Screenshot Mode Overlay
screenshot_overlay = """
      {/* SCREENSHOT MODE OVERLAY */}
      {screenshotMode && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
          <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
            <div className="bg-black/50 text-cyan-400 text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md animate-pulse">
              Take a screenshot now!
            </div>
            <button 
              onClick={() => setScreenshotMode(false)}
              className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white shadow-lg transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-bold pr-1">Close</span>
            </button>
          </div>
          
          <div className="w-full h-full flex items-center justify-center overflow-auto" style={{
            /* Scale it to fit the screen height exactly for a perfect screenshot */
            transform: `scale(${Math.min(window.innerWidth / 800, window.innerHeight / 1100) * 0.95})`
          }}>
            <div 
              style={{ width: '800px', height: '1100px' }} 
              className="flex-shrink-0 origin-center pointer-events-none"
            >
              <PosterPreview />
            </div>
          </div>
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n}", screenshot_overlay + "\n    </div>\n  );\n}")

# Make sure Maximize2 is imported
if "import { Maximize2" not in content and "Maximize2," not in content:
    content = content.replace("import { Download, ", "import { Download, Maximize2, ")
    content = content.replace("import { Trash2, ", "import { Trash2, Maximize2, ")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


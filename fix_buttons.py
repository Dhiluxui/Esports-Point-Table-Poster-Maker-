import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Replace the header buttons
old_buttons = """        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsManagerOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-6 py-2.5 bg-[#0a142f] hover:bg-[#0f1d40] border border-cyan-500/30 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-colors text-cyan-400 text-center"
          >
            <Settings className="w-4 h-4" />
            Manage Teams Data
          </button>
          
          <button
            onClick={exportPoster}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none text-center"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export HD Poster'}
          </button>
        </div>"""

new_buttons = """        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {isOwner && (
            <>
              <button
                onClick={() => setIsManagerOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-[#0a142f] hover:bg-[#0f1d40] border border-cyan-500/30 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors text-cyan-400 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" />
                Manage
              </button>
              
              <button
                onClick={saveToCloud}
                disabled={isSaving}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-cyan-900/50 hover:bg-cyan-800/80 border border-cyan-500/50 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors text-cyan-300 whitespace-nowrap disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Cloud Sync'}
              </button>

              <button
                onClick={copyPublicLink}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors text-blue-300 whitespace-nowrap"
              >
                <Copy className="w-3.5 h-3.5" />
                {copySuccess || 'Share Link'}
              </button>
            </>
          )}
          
          <button
            onClick={exportPoster}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          >
            <Download className="w-4 h-4 hidden md:block" />
            {isExporting ? 'Exporting...' : 'Export Poster'}
          </button>
        </div>"""

content = content.replace(old_buttons, new_buttons)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

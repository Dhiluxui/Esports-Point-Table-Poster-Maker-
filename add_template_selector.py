import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

template_html = """              {/* --- Section: Template Style --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Template Style
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <select 
                        value={branding.templateStyle || 'classic'} 
                        onChange={e => setBranding(p => ({...p, templateStyle: e.target.value}))} 
                        className="w-full bg-[#0a142f] border border-cyan-500/20 text-cyan-50 rounded px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 uppercase tracking-wider font-semibold"
                      >
                        <option value="classic">Classic Pro</option>
                        <option value="red_gold">Royal Red & Gold</option>
                        <option value="blue_highlight">Neon Blue Highlights</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

"""

content = content.replace("              {/* --- Section: Theme & Colors --- */}", template_html + "              {/* --- Section: Theme & Colors --- */}")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

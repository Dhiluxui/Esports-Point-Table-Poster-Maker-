import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

old_header = """            <h1 className="font-teko text-2xl md:text-3xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold uppercase tracking-wider">
              FF Max Point Table
            </h1>"""
new_header = """            <h1 className="font-teko text-2xl md:text-3xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold uppercase tracking-wider flex items-center gap-2">
              FF Max Point Table
              <span className="text-[10px] md:text-xs bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-rajdhani tracking-widest align-middle mt-1">v1.3.0</span>
            </h1>"""

content = content.replace(old_header, new_header)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()
    
old_header2 = """            <h1 className="font-oswald font-black text-xl md:text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">Tournament Hub</h1>"""
new_header2 = """            <h1 className="font-oswald font-black text-xl md:text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 flex items-center gap-2">
              Tournament Hub
              <span className="text-[10px] bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-rajdhani tracking-widest align-middle mt-0.5">v1.3.0</span>
            </h1>"""
content = content.replace(old_header2, new_header2)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_header3 = """        <h1 className="font-oswald font-black text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 mb-2">
          Tournament Hub
        </h1>"""
new_header3 = """        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="font-oswald font-black text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">
            Tournament Hub
          </h1>
          <span className="text-[10px] bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-rajdhani tracking-widest mt-1">v1.3.0</span>
        </div>"""
content = content.replace(old_header3, new_header3)

with open('src/App.tsx', 'w') as f:
    f.write(content)


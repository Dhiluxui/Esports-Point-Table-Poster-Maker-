import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Locate the space-y-5 block inside "Custom Branding Settings"
# The string to search for starts after `className="font-oswald text-lg font-semibold uppercase tracking-wider">Custom Design</h2>`
# and ends before `<div ref={previewContainerRef}` (the right panel)

# Let's find the exact indices
start_str = '<div className="space-y-5">'
# We need to find the specific one inside the branding panel.
# The calculator section also has a `<div className="space-y-5">`.
# The branding one is the *second* one. Or we can just find:
# <h2 className="font-oswald text-lg font-semibold uppercase tracking-wider">Custom Design</h2>
#             </div>
#             <div className="space-y-5">

start_idx = content.find('Custom Design</h2>')
if start_idx == -1:
    print("Error finding Custom Design")
    exit(1)

start_div = content.find('<div className="space-y-5">', start_idx)

# Find the end of this block. It ends right before:
#         {/* RIGHT PANEL: POSTER PREVIEW */}
end_idx = content.find('{/* RIGHT PANEL: POSTER PREVIEW */}', start_div)

# Now we need to backtrack to the closing </div> of the space-y-5 block.
# Actually, the block closes right before the two </div></div> that close the Custom Design panel and the left panel.
# Let's just grab the text from start_div to end_idx, and replace the whole thing.

# Wait, the structure is:
#         {/* Custom Branding Settings */}
#         <div className="p-6">
#           ...
#           <div className="space-y-5">
#             ...
#           </div>
#         </div>
#       </div>
#       {/* RIGHT PANEL: POSTER PREVIEW */}

# Let's just slice accurately.

end_div = content.rfind('</div>', 0, content.rfind('</div>', 0, content.rfind('</div>', 0, end_idx)))

# Actually, a regex might be cleaner if we do it carefully.
# Let's just replace everything from `<div className="space-y-5">` after "Custom Design"
# up to the end of the `p-6` block.

new_block = """<div className="space-y-6">
              
              {/* --- Section: Graphics & Logos --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> Graphics & Logos
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Background Image</label>
                    <label className="flex items-center justify-center p-3 border border-dashed border-cyan-500/30 rounded-lg bg-[#0a142f] hover:bg-[#0f1d40] transition-colors cursor-pointer text-sm text-cyan-100 font-medium text-center">
                        <Upload className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" /> 
                        {branding.backgroundImage === 'https://i.ibb.co/PZc3y7Jw/give-bg-only-2-K-202606011335.jpg' ? 'Replace Default BG' : 'Change Background'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} />
                    </label>
                    {branding.backgroundImage && branding.backgroundImage !== 'https://i.ibb.co/PZc3y7Jw/give-bg-only-2-K-202606011335.jpg' && (
                      <button onClick={() => setBranding(p => ({...p, backgroundImage: 'https://i.ibb.co/PZc3y7Jw/give-bg-only-2-K-202606011335.jpg'}))} className="mt-2 text-[10px] text-red-400 hover:text-red-300 uppercase font-semibold flex items-center justify-center w-full bg-red-950/20 py-1.5 rounded">Remove Custom Background</button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Center Shield</label>
                      <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        <img src={branding.tournamentLogo || "https://i.ibb.co/ymGMngLv/Whats-App-Image-2026-05-20-at-8-27-44-AM-removebg-preview.png"} alt="Center" className="h-6 object-contain opacity-50 grayscale blend-screen hover:grayscale-0 hover:opacity-100 transition-all" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'tournament')} />
                      </label>
                      {branding.tournamentLogo && branding.tournamentLogo !== 'https://i.ibb.co/ymGMngLv/Whats-App-Image-2026-05-20-at-8-27-44-AM-removebg-preview.png' && (
                        <button onClick={() => setBranding(p => ({...p, tournamentLogo: 'https://i.ibb.co/ymGMngLv/Whats-App-Image-2026-05-20-at-8-27-44-AM-removebg-preview.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Top Left</label>
                      <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.topLeftLogo ? <img src={branding.topLeftLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'topLeft')} />
                      </label>
                      {branding.topLeftLogo && branding.topLeftLogo !== 'https://i.ibb.co/LzVwR5w6/i-need-only-logo-now-202606011213-removebg-preview.png' && (
                        <button onClick={() => setBranding(p => ({...p, topLeftLogo: 'https://i.ibb.co/LzVwR5w6/i-need-only-logo-now-202606011213-removebg-preview.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Top Right</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.topRightLogo ? <img src={branding.topRightLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'topRight')} />
                      </label>
                      {branding.topRightLogo && branding.topRightLogo !== 'https://i.ibb.co/6cdfW7yW/Whats-App-Image-2026-05-04-at-5-47-10-PM-1-removebg-preview.png' && (
                        <button onClick={() => setBranding(p => ({...p, topRightLogo: 'https://i.ibb.co/6cdfW7yW/Whats-App-Image-2026-05-04-at-5-47-10-PM-1-removebg-preview.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Sponsor</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.sponsorLogo ? <img src={branding.sponsorLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sponsor')} />
                      </label>
                      {branding.sponsorLogo && (
                        <button onClick={() => setBranding(p => ({...p, sponsorLogo: null}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Remove</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">College</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.collegeLogo ? <img src={branding.collegeLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'college')} />
                      </label>
                      {branding.collegeLogo && (
                        <button onClick={() => setBranding(p => ({...p, collegeLogo: null}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Remove</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Caster</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.casterLogo ? <img src={branding.casterLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'caster')} />
                      </label>
                      {branding.casterLogo && (
                        <button onClick={() => setBranding(p => ({...p, casterLogo: null}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Section: Social Handles --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Social Handles
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 focus-within:border-cyan-400 transition-colors">
                    <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <input type="text" value={branding.instagramHandle} onChange={e=>setBranding(p=>({...p, instagramHandle: e.target.value}))} className="w-full bg-transparent py-2.5 pl-3 text-sm focus:outline-none text-cyan-50" placeholder="Instagram Handle" />
                  </div>
                  <div className="flex items-center bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 focus-within:border-cyan-400 transition-colors">
                    <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <input type="text" value={branding.youtubeHandle} onChange={e=>setBranding(p=>({...p, youtubeHandle: e.target.value}))} className="w-full bg-transparent py-2.5 pl-3 text-sm focus:outline-none text-cyan-50" placeholder="YouTube Handle" />
                  </div>
                  <div className="flex items-center bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 focus-within:border-cyan-400 transition-colors">
                    <MessageSquare className="w-4 h-4 text-[#5865F2] flex-shrink-0" />
                    <input type="text" value={branding.discordHandle || ''} onChange={e=>setBranding(p=>({...p, discordHandle: e.target.value}))} className="w-full bg-transparent py-2.5 pl-3 text-sm focus:outline-none text-cyan-50" placeholder="Discord Handle" />
                  </div>
                </div>
              </div>
              
              {/* --- Section: Titles & Text --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Titles & Text
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Organization Name</label>
                    <input type="text" value={branding.organizationName} onChange={e=>setBranding(p=>({...p, organizationName: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Title (Newlines for breaks)</label>
                    <textarea value={branding.title} onChange={e=>setBranding(p=>({...p, title: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 h-[70px] resize-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Stage name</label>
                      <select value={branding.stageName || ''} onChange={e=>setBranding(p=>({...p, stageName: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors">
                        <option value="">None</option>
                        <option value="QUALIFIER">QUALIFIER</option>
                        <option value="SEMI-FINAL">SEMI-FINAL</option>
                        <option value="FINAL">FINAL</option>
                        <option value="GRAND-FINAL">GRAND-FINAL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Subtitle</label>
                      <input type="text" value={branding.subtitle} onChange={e=>setBranding(p=>({...p, subtitle: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Footer Text</label>
                    <input type="text" value={branding.footerText} onChange={e=>setBranding(p=>({...p, footerText: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                  </div>
                </div>
              </div>

              {/* --- Section: Table Configuration --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Table Configuration
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-cyan-100 uppercase tracking-widest">Show Team Logos</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.showTeamLogos !== false} onChange={e=>setBranding(p=>({...p, showTeamLogos: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.showTeamLogos !== false ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-cyan-900/30">
                    <label className={`block text-[11px] font-semibold uppercase tracking-widest ${branding.stageName === 'GRAND-FINAL' ? 'text-cyan-400/30' : 'text-cyan-100'}`}>Show (Q/E) Status</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" disabled={branding.stageName === 'GRAND-FINAL'} checked={isShowQualification} onChange={e=>setBranding(p=>({...p, showQualification: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500 disabled:opacity-50" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${isShowQualification ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'} ${branding.stageName === 'GRAND-FINAL' ? 'opacity-50' : ''}`}></label>
                    </div>
                  </div>
                  
                  {isShowQualification && (
                    <div className="pl-3 pr-3 py-3 bg-[#0a142f]/50 rounded-lg border border-cyan-900/30">
                      <label className="flex justify-between text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-3">
                        <span>Qualified Teams Threshold</span>
                        <span className="text-cyan-400 font-bold text-xs bg-cyan-900/40 px-2 py-0.5 rounded">{branding.qualificationThreshold ?? 9}</span>
                      </label>
                      <input type="range" min="0" max="12" value={branding.qualificationThreshold ?? 9} onChange={e=>setBranding(p=>({...p, qualificationThreshold: parseInt(e.target.value, 10)}))} className="w-full h-1.5 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-cyan-900/30">
                    <label className="block text-[11px] font-semibold text-cyan-100 uppercase tracking-widest">Show Matches Col</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.showMatches !== false} onChange={e=>setBranding(p=>({...p, showMatches: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.showMatches !== false ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cyan-900/30">
                    <label className="block text-[11px] font-semibold text-amber-400/90 uppercase tracking-[0.05em]">Champion Rush Mode</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.championRushEnabled === true} onChange={e=>setBranding(p=>({...p, championRushEnabled: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-amber-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.championRushEnabled === true ? 'bg-amber-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>

                  {branding.championRushEnabled === true && (
                    <div className="pl-3 pr-3 py-3 bg-amber-950/20 rounded-lg border border-amber-900/30">
                      <label className="block text-[10px] font-semibold text-amber-400/70 uppercase tracking-widest mb-2">Champion Rush Threshold (pts)</label>
                      <input type="number" min="0" value={branding.championRushThreshold ?? 80} onChange={e=>setBranding(p=>({...p, championRushThreshold: parseInt(e.target.value, 10) || 0}))} className="w-full bg-[#0a142f] border border-amber-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 text-amber-50 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>"""

start_pos = content.find('<div className="space-y-5">', start_idx)
end_pos = content.find('</div>\n          </div>\n        </div>\n\n        {/* RIGHT PANEL', start_pos)

if start_pos != -1 and end_pos != -1:
    new_content = content[:start_pos] + new_block + content[end_pos:]
    with open('src/App.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully!")
else:
    print("Failed to find bounds.")

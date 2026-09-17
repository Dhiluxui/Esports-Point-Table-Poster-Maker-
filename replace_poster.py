import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# I want to grab from `{/* Background Overlay (if no user BG) */}` all the way down to the closing tag of the internal poster structure.
start_str = "              {/* Background Overlay (if no user BG) */}"
end_str = "              </div>\n            </div>\n          </div>"
idx1 = content.find(start_str)
idx2 = content.find(end_str, idx1)

if idx1 != -1 and idx2 != -1:
    new_render = """              {/* Background Overlay (if no user BG) */}
              {!branding.backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent)]/20 via-[color-mix(in_srgb,var(--theme-bg-accent)_80%,#000)] to-[color-mix(in_srgb,var(--theme-bg-accent)_95%,#000)] pointer-events-none z-0" />
              )}
              
              {/* Top Corner Logos */}
              {branding.topLeftLogo && (
                <div className="absolute top-1 left-2 z-30 h-16 max-w-[200px]">
                  <img src={branding.topLeftLogo} className="h-full w-full object-contain object-left drop-shadow-md" alt="Partner Left" />
                </div>
              )}
              {branding.topRightLogo && (
                <div className="absolute top-1 right-2 z-30 h-16 max-w-[200px]">
                  <img src={branding.topRightLogo} className="h-full w-full object-contain object-right drop-shadow-md" alt="Partner Right" />
                </div>
              )}
              
              {/* Internal Poster Structure */}
              {branding.templateStyle === 'red_gold' ? (
                <TemplateRedGold branding={branding} teams={teams} />
              ) : branding.templateStyle === 'blue_highlight' ? (
                <TemplateBlueHighlight branding={branding} teams={teams} />
              ) : (
                <TemplateClassic branding={branding} teams={teams} />
              )}
"""
    content = content[:idx1] + new_render + content[idx2:]
    
    with open('src/PointsTableEditor.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully.")
else:
    print("Could not find blocks.")


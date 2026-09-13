import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Add exportedImage state
state_search = "const [isExporting, setIsExporting] = useState(false);"
if state_search in content:
    content = content.replace(state_search, state_search + "\n  const [exportedImage, setExportedImage] = useState<string | null>(null);")

# 2. Update exportPoster function
old_export_function_pattern = r'  const exportPoster = async \(\) => \{.*?finally \{\n      setIsExporting\(false\);\n    \}\n  \};'

new_export_logic = """  const exportPoster = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure all DOM is fully painted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Temporarily reset scale to 1 to ensure html2canvas captures full resolution
      const originalTransform = posterRef.current.style.transform;
      posterRef.current.style.transform = 'scale(1)';
      
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        useCORS: true,
        allowTaint: false, // Must be false or toDataURL will crash due to SecurityError
        logging: false
      });
      
      // Restore scale
      posterRef.current.style.transform = originalTransform;
      
      const dataUrl = canvas.toDataURL('image/png');
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Attempt native share if available
        if (navigator.share) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `FF_Points_Table_${Date.now()}.png`, { type: 'image/png' });
            await navigator.share({
              title: 'Points Table',
              files: [file]
            });
            setIsExporting(false);
            return;
          } catch (e) {
            console.log("Native share canceled or failed", e);
            // Fallthrough to show the modal below
          }
        }
        
        // If we reach here on mobile, either share API is missing (in-app browser) or it failed.
        // Show the bulletproof fallback modal.
        setExportedImage(dataUrl);
        setIsExporting(false);
        return;
      }

      // Desktop: Fallback to standard anchor download
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `FF_Points_Table_${Date.now()}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Failed to export poster', err);
      alert('Failed to process image. Please make sure all uploaded logos are valid images.');
    } finally {
      setIsExporting(false);
    }
  };"""

content = re.sub(old_export_function_pattern, new_export_logic, content, flags=re.DOTALL)

# 3. Add the Modal UI at the bottom of the component
modal_ui = """
      {/* EXPORT FALLBACK MODAL FOR MOBILE */}
      {exportedImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setExportedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="bg-[#0b132b] border border-cyan-500/30 p-4 rounded-xl max-w-sm w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
              <Download className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-oswald font-bold text-white mb-2 uppercase tracking-wider">Image Ready!</h3>
            <p className="text-cyan-400/80 mb-6 text-sm font-medium">
              Press and hold the image below to save it to your Photos.
            </p>
            
            <div className="w-full max-h-[50vh] overflow-hidden rounded-lg border border-cyan-500/50 relative shadow-[0_0_30px_rgba(0,204,255,0.2)]">
              <img src={exportedImage} className="w-full h-auto object-contain" alt="Exported Points Table" />
            </div>
            
            <button 
              onClick={() => setExportedImage(null)}
              className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold tracking-wider uppercase transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
"""

# Insert right before the last closing div of the component
# Usually it looks like:
#     </div>
#   );
# }

content = content.replace("    </div>\n  );\n}", modal_ui + "\n    </div>\n  );\n}")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


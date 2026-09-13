import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Replace the isMobile block with direct download
pattern = r"      if \(isMobile\) \{.*?      \}      \n      // Desktop: Fallback to standard anchor download"

new_code = """      // Desktop & Mobile: Force standard anchor download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `FF_Points_Table_${Date.now()}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);"""

# I will use a more precise string replacement
old_code = """      if (isMobile) {
        if (navigator.share) {
          try {
            const file = new File([blob], `FF_Points_Table_${Date.now()}.png`, { type: mime });
            await navigator.share({
              title: 'Points Table',
              files: [file]
            });
            setIsExporting(false);
            return;
          } catch (e: any) {
            console.log("Native share canceled or failed", e);
            if (e.name === 'AbortError') {
               setIsExporting(false);
               return; // User cancelled, don't show modal
            }
          }
        }
        
        // Show modal fallback
        setExportedImage(dataUrl);
        setIsExporting(false);
        return;
      }

      // Desktop: Fallback to standard anchor download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `FF_Points_Table_${Date.now()}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);"""

content = content.replace(old_code, new_code)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

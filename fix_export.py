import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Replace htmlToImage import with html2canvas (might already be done but just in case)
content = content.replace("import * as htmlToImage from 'html-to-image';", "import html2canvas from 'html2canvas';")

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
        allowTaint: true,
        logging: false
      });
      
      // Restore scale
      posterRef.current.style.transform = originalTransform;
      
      const dataUrl = canvas.toDataURL('image/png');
      
      // Convert base64 Data URL to Blob for better mobile browser support
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Try native share sheet first on mobile
      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], `FF_Points_Table_${Date.now()}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'Points Table',
            files: [file]
          });
          setIsExporting(false);
          return;
        } catch (e) {
          console.log("Native share canceled or failed, falling back to download...", e);
        }
      }

      // Fallback to standard anchor download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `FF_Points_Table_${Date.now()}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Failed to export poster', err);
      
      // Fallback UI for very strict mobile browsers (like Instagram In-App Browser) that block everything
      alert('Failed to automatically download. Please screenshot the preview instead, or open in Safari/Chrome.');
    } finally {
      setIsExporting(false);
    }
  };"""

content = re.sub(old_export_function_pattern, new_export_logic, content, flags=re.DOTALL)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


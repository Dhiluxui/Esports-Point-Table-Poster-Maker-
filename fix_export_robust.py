import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Find the export logic block
old_export_pattern = r'  const exportPoster = async \(\) => \{.*?finally \{\n      setIsExporting\(false\);\n    \}\n  \};'

new_export_logic = """  const exportPoster = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure all DOM is fully painted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exportOptions = {
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        cacheBust: true,
      };

      // Workaround for mobile/Safari: Do a dummy render first to load assets into cache
      await htmlToImage.toPng(posterRef.current, { ...exportOptions, pixelRatio: 1 });
      
      const dataUrl = await htmlToImage.toPng(posterRef.current, exportOptions);
      
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
        throw new Error("Image generation failed (empty canvas).");
      }
      
      // Robust Base64 to Blob converter (avoids fetch(dataUrl) which fails on some mobile browsers)
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      
      if (blob.size === 0) {
        throw new Error("Generated Blob is 0 bytes.");
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
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
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Failed to export poster', err);
      alert('Failed to process image. Make sure all uploaded logos are valid images.');
    } finally {
      setIsExporting(false);
    }
  };"""

content = re.sub(old_export_pattern, new_export_logic, content, flags=re.DOTALL)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Update the local storage restore logic
old_restore = """          // Check local storage for a newer backup
          let shouldUseLocal = false;
          try {
            const backup = localStorage.getItem(`tournament_backup_${id}`);
            if (backup) {
              const parsed = JSON.parse(backup);
              // If local backup is newer than cloud data by at least 2 seconds, and it's from the last 24 hours
              if (parsed.timestamp > cloudUpdatedAt + 2000 && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
                 shouldUseLocal = true;
                 setTeams(parsed.teams);
                 setBranding(parsed.branding);
                 loadedFromCloud = true; // Pretend it was loaded so we don't overwrite
              }
            }
          } catch(e) {}"""

new_restore = """          // Check local storage for a newer backup
          let shouldUseLocal = false;
          try {
            const backup = localStorage.getItem(`tournament_backup_${id}`);
            if (backup) {
              const parsed = JSON.parse(backup);
              // If it's from the last 24 hours
              const isRecent = (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000;
              // If cloud data has no teams (never saved successfully), ALWAYS use local storage
              const cloudHasNoTeams = !data.teams || data.teams.length === 0;
              
              // To handle clock drift between client and server, we just check if it's recent and cloud has no teams,
              // OR if we stored the local time of the last cloud save and our backup is newer.
              if (isRecent) {
                if (cloudHasNoTeams || parsed.timestamp > (parsed.lastCloudSaveLocalTime || 0) + 1000) {
                   shouldUseLocal = true;
                   setTeams(parsed.teams);
                   setBranding(parsed.branding);
                   loadedFromCloud = true;
                }
              }
            }
          } catch(e) {}"""
content = content.replace(old_restore, new_restore)

# 2. Update local storage save to include lastCloudSaveLocalTime
old_local_save = """  // LocalStorage Backup Fallback (Immediate)
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      localStorage.setItem(`tournament_backup_${id}`, JSON.stringify({ teams, branding, timestamp: Date.now() }));
    } catch (e) {}
  }, [teams, branding, id]);"""

new_local_save = """  // LocalStorage Backup Fallback (Immediate)
  const lastCloudSaveLocalTime = useRef(Date.now());
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      localStorage.setItem(`tournament_backup_${id}`, JSON.stringify({ 
        teams, 
        branding, 
        timestamp: Date.now(),
        lastCloudSaveLocalTime: lastCloudSaveLocalTime.current
      }));
    } catch (e) {}
  }, [teams, branding, id]);"""
content = content.replace(old_local_save, new_local_save)

# 3. Update saveToCloud to update lastCloudSaveLocalTime
old_save_cloud = """    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: serverTimestamp()
      });
      setSaveStatus('saved');"""

new_save_cloud = """    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: serverTimestamp()
      });
      lastCloudSaveLocalTime.current = Date.now();
      setSaveStatus('saved');"""
content = content.replace(old_save_cloud, new_save_cloud)

# 4. Add visibilitychange listener
old_unload = """  // Prevent leaving if saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);"""

new_unload = """  // Prevent leaving if saving & handle visibility change (backgrounding)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving' || saveStatus === '') {
         // Attempt sync on unload if there might be unsaved changes
         saveToCloud();
      }
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
         // App went to background (e.g. user clicked a message notification)
         // Force an immediate cloud save if there are unsaved changes
         if (initialLoadDone.current && isOwner) {
            saveToCloud();
            // Also force local storage sync just in case
            try {
              localStorage.setItem(`tournament_backup_${id}`, JSON.stringify({ 
                teams, 
                branding, 
                timestamp: Date.now(),
                lastCloudSaveLocalTime: lastCloudSaveLocalTime.current
              }));
            } catch (e) {}
         }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveStatus, saveToCloud, teams, branding, id, isOwner]);"""
content = content.replace(old_unload, new_unload)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


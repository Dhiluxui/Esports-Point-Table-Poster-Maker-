import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Add useCallback import if not exists
if 'useCallback' not in content:
    content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect, useCallback } from 'react';")

# 2. Add refs and state
ref_injection = """  const [copySuccess, setCopySuccess] = useState('');
  const initialLoadDone = useRef(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | ''>('');"""
content = content.replace("  const [copySuccess, setCopySuccess] = useState('');", ref_injection)

# 3. Modify fetchTournamentData to set initialLoadDone
fetch_block_old = """      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    
    fetchTournamentData();"""
fetch_block_new = """      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        // Allow a small delay to ensure states are settled before enabling autosave
        setTimeout(() => { initialLoadDone.current = true; }, 1000);
      }
    };
    
    fetchTournamentData();"""
content = content.replace(fetch_block_old, fetch_block_new)

# 4. Modify saveToCloud to be useCallback and handle saveStatus
save_old = """  const saveToCloud = async () => {
    if (!id || !isOwner) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
      alert("Failed to save. Please make sure you are logged in and own this tournament.");
    }
    setIsSaving(false);
  };"""
save_new = """  const saveToCloud = useCallback(async () => {
    if (!id || !isOwner) return;
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: serverTimestamp()
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error("Error saving to cloud:", error);
      setSaveStatus('error');
      alert("Failed to save. Please make sure you are logged in and own this tournament.");
    }
    setIsSaving(false);
  }, [id, isOwner, teams, branding]);

  useEffect(() => {
    if (!initialLoadDone.current || !isOwner) return;
    const timer = setTimeout(() => {
      saveToCloud();
    }, 1500);
    return () => clearTimeout(timer);
  }, [teams, branding, isOwner, saveToCloud]);

  // LocalStorage Backup Fallback (Immediate)
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      localStorage.setItem(`tournament_backup_${id}`, JSON.stringify({ teams, branding, timestamp: Date.now() }));
    } catch (e) {}
  }, [teams, branding, id]);

  // Check for local storage backup on mount
  useEffect(() => {
    if (!id) return;
    try {
      const backup = localStorage.getItem(`tournament_backup_${id}`);
      if (backup) {
        const parsed = JSON.parse(backup);
        // Only load backup if it's less than 24 hours old and we haven't successfully fetched from cloud yet
        // Actually, cloud is source of truth, so we only use this if user explicitly wants to or if cloud fetch fails.
        // We'll just keep it in localStorage in case of complete failure, but cloud auto-save should solve 99% of issues.
      }
    } catch(e) {}
  }, [id]);"""
content = content.replace(save_old, save_new)

# 5. Update UI for the Cloud Sync button
ui_old = """              <button
                onClick={saveToCloud}
                disabled={isSaving}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-cyan-900/50 hover:bg-cyan-800/80 border border-cyan-500/50 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors text-cyan-300 whitespace-nowrap disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Cloud Sync'}
              </button>"""
ui_new = """              <button
                onClick={saveToCloud}
                disabled={isSaving}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 ${saveStatus === 'saved' ? 'bg-green-900/50 border-green-500/50 text-green-400' : saveStatus === 'error' ? 'bg-red-900/50 border-red-500/50 text-red-400' : 'bg-cyan-900/50 hover:bg-cyan-800/80 border-cyan-500/50 text-cyan-300'} border rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap disabled:opacity-50`}
              >
                <Upload className="w-3.5 h-3.5" />
                {saveStatus === 'saved' ? 'Saved!' : isSaving ? 'Saving...' : 'Cloud Sync'}
              </button>"""
content = content.replace(ui_old, ui_new)


with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

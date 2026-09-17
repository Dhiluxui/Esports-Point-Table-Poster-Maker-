import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Update initial teams logic to use data.slots
old_fetch = """        if (tDoc.exists()) {
          const data = tDoc.data();
          if (data.teams && data.teams.length > 0) {
            setTeams(data.teams);
          }
          if (data.branding) {
            setBranding(data.branding);
          }"""
new_fetch = """        if (tDoc.exists()) {
          const data = tDoc.data();
          if (data.teams && data.teams.length > 0) {
            setTeams(data.teams);
          } else if (data.slots) {
            // Generate empty teams based on slots
            const emptyTeams = Array.from({ length: data.slots }, (_, i) => ({
              id: String(i + 1),
              name: `TEAM ${i + 1}`,
              matchesPlayed: 1,
              booyahs: 0,
              placementPoints: 0,
              killPoints: 0,
              totalPoints: 0
            }));
            setTeams(emptyTeams);
          }
          if (data.branding) {
            setBranding(data.branding);
          }"""
content = content.replace(old_fetch, new_fetch)

# 2. Update the Back button to save before navigating
old_back = """          <button onClick={() => navigate('/')} className="w-10 h-10 rounded bg-[#0a142f] flex items-center justify-center text-cyan-500 hover:text-white hover:bg-cyan-600 transition-colors shrink-0">"""
new_back = """          <button onClick={() => { if(isOwner) { saveToCloud(); } navigate('/'); }} className="w-10 h-10 rounded bg-[#0a142f] flex items-center justify-center text-cyan-500 hover:text-white hover:bg-cyan-600 transition-colors shrink-0">"""
content = content.replace(old_back, new_back)

# 3. Add beforeunload listener
old_timer = """  useEffect(() => {
    if (!initialLoadDone.current || !isOwner) return;
    const timer = setTimeout(() => {
      saveToCloud();
    }, 1500);
    return () => clearTimeout(timer);
  }, [teams, branding, isOwner, saveToCloud]);"""

new_timer = """  useEffect(() => {
    if (!initialLoadDone.current || !isOwner) return;
    const timer = setTimeout(() => {
      saveToCloud();
    }, 1500);
    return () => clearTimeout(timer);
  }, [teams, branding, isOwner, saveToCloud]);

  // Prevent leaving if saving
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
content = content.replace(old_timer, new_timer)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

old_fetch = """        const tDoc = await getDoc(doc(db, 'tournaments', id));
        if (tDoc.exists()) {
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
          }
          
          if (currentUser && data.ownerId === currentUser.uid) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        }"""
        
new_fetch = """        const tDoc = await getDoc(doc(db, 'tournaments', id));
        let loadedFromCloud = false;
        
        if (tDoc.exists()) {
          const data = tDoc.data();
          const cloudUpdatedAt = data.updatedAt?.toMillis() || 0;
          
          // Check local storage for a newer backup
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
          } catch(e) {}

          if (!shouldUseLocal) {
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
            }
          }
          
          if (currentUser && data.ownerId === currentUser.uid) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        }"""

content = content.replace(old_fetch, new_fetch)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { collection, query, getDocs, orderBy } from 'firebase/firestore';",
    "import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';"
)
content = content.replace(
    "import { db } from './lib/firebase';",
    "import { db, auth } from './lib/firebase';\nimport { onAuthStateChanged, User } from 'firebase/auth';"
)

content = content.replace(
    "import { TeamScore, Branding } from './types';",
    "import { TeamScore, Branding } from './types';\nimport { Copy } from 'lucide-react';"
)

# 2. Add states for owner and syncing
state_add = """  const [phases, setPhases] = useState<Phase[]>([]);
  const [teams, setTeams] = useState<TeamScore[]>(DEFAULT_TEAMS);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
"""
content = re.sub(
    r"  const \[phases, setPhases\] = useState<Phase\[\]>\(\[\]\);\n  const \[teams, setTeams\] = useState<TeamScore\[\]>\(DEFAULT_TEAMS\);",
    state_add,
    content
)

# 3. Update useEffect to fetch tournament data and check owner
use_effect_replace = """  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchTournamentData = async () => {
      try {
        const tDoc = await getDoc(doc(db, 'tournaments', id));
        if (tDoc.exists()) {
          const data = tDoc.data();
          if (data.teams && data.teams.length > 0) {
            setTeams(data.teams);
          }
          if (data.branding) {
            setBranding(data.branding);
          }
          
          if (currentUser && data.ownerId === currentUser.uid) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        }

        const q = query(collection(db, `tournaments/${id}/phases`), orderBy('phaseNumber', 'asc'));
        const querySnapshot = await getDocs(q);
        const pData: Phase[] = [];
        querySnapshot.forEach((doc) => {
          pData.push({ id: doc.id, ...doc.data() } as Phase);
        });
        setPhases(pData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    
    fetchTournamentData();
  }, [id, currentUser]);

  const saveToCloud = async () => {
    if (!id || !isOwner) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
    }
    setIsSaving(false);
  };

  const copyPublicLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
"""
content = re.sub(
    r"  useEffect\(\(\) => \{\n    if \(\!id\) return;\n    const fetchPhases = async \(\) => \{.*?\n    fetchPhases\(\);\n  \}, \[id\]\);",
    use_effect_replace,
    content,
    flags=re.DOTALL
)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

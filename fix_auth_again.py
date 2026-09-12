import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_app_content = """import { signInAnonymously } from 'firebase/auth';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous auth failed", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user || { uid: 'anonymous', displayName: 'Local User' } as any} />} />
      <Route path="/tournament/:id" element={<PointsTableEditor />} />
    </Routes>
  );
}"""

content = re.sub(r'function AppContent\(\) \{.*?(?=export default function App\(\) \{)', new_app_content + '\n\n', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

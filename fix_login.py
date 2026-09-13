import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add new imports
if "createUserWithEmailAndPassword" not in content:
    content = content.replace("from 'firebase/auth';", "from 'firebase/auth';\nimport { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';")

# Extract LoginScreen out of AppContent
# First, remove it from inside AppContent
login_screen_pattern = r'  const LoginScreen = \(\) => \((.*?)\n  \);'
match = re.search(login_screen_pattern, content, flags=re.DOTALL)

if match:
    content = content.replace(match.group(0), "")
    
    new_login_screen = """
const LoginScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center font-rajdhani p-4 selection:bg-cyan-500/30">
      <div className="bg-[#0a142f]/80 backdrop-blur-md border border-cyan-900/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,204,255,0.15)] max-w-md w-full text-center">
        <div className="bg-cyan-500 w-16 h-16 rounded-2xl shadow-[0_0_20px_rgba(0,204,255,0.4)] flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-oswald font-black text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 mb-2">
          Tournament Hub
        </h1>
        <p className="text-cyan-400/60 mb-6 font-medium">Sign in to manage your esports tournaments and generate HD points tables.</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-[#030712]/50 border border-cyan-900/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#030712]/50 border border-cyan-900/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,204,255,0.3)] disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Log In')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-cyan-900/50 flex-1"></div>
          <span className="text-sm text-cyan-400/60 uppercase tracking-widest font-bold">OR</span>
          <div className="h-px bg-cyan-900/50 flex-1"></div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-lg mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-cyan-400/60 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 font-bold hover:underline"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
"""
    content = content.replace("function AppContent() {", new_login_screen + "\nfunction AppContent() {")

    with open('src/App.tsx', 'w') as f:
        f.write(content)


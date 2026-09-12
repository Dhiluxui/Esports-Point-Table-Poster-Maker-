import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle, signOut, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Trophy, Plus, ChevronRight, X } from 'lucide-react';
import PointsTableEditor from './PointsTableEditor';

// Components
import Dashboard from './components/Dashboard';



function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <div className="text-cyan-500 font-rajdhani font-bold tracking-widest uppercase">Loading Workspace...</div>
      </div>
    );
  }

  const LoginScreen = () => (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center font-rajdhani p-4 selection:bg-cyan-500/30">
      <div className="bg-[#0a142f]/80 backdrop-blur-md border border-cyan-900/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,204,255,0.15)] max-w-md w-full text-center">
        <div className="bg-cyan-500 w-16 h-16 rounded-2xl shadow-[0_0_20px_rgba(0,204,255,0.4)] flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-oswald font-black text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 mb-2">
          Tournament Hub
        </h1>
        <p className="text-cyan-400/60 mb-8 font-medium">Sign in to manage your esports tournaments and generate HD points tables.</p>
        
        <button
          onClick={signInWithGoogle}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard user={user} /> : <LoginScreen />} />
      <Route path="/tournament/:id" element={<PointsTableEditor />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

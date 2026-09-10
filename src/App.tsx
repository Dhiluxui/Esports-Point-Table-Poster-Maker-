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
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center font-rajdhani relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#030712] to-[#030712] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
          <Trophy className="w-20 h-20 text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(0,204,255,0.5)]" />
          <h1 className="text-4xl font-oswald font-black uppercase tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">Tournament Hub</h1>
          <p className="text-cyan-200/60 mb-10 text-lg">Manage your Esports Tournaments and Points Tables.</p>
          
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} />} />
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

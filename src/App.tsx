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
  // Pass a dummy user object to Dashboard for compatibility
  const dummyUser = { uid: 'anonymous', displayName: 'Local User' } as any;

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={dummyUser} />} />
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

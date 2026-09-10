import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { signOut, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Trophy, Plus, LogOut, Loader2, ChevronRight, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

interface Tournament {
  id: string;
  name: string;
  slots: number;
}

export default function Dashboard({ user }: DashboardProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, [user]);

  const fetchTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), where('ownerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data: Tournament[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Tournament);
      });
      // Sort in client since we don't have composite index for createdAt descending
      data.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setTournaments(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'tournaments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-rajdhani">
      <header className="border-b border-cyan-900/30 bg-[#0a142f]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-2 rounded-lg shadow-[0_0_15px_rgba(0,204,255,0.4)]">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-oswald font-black text-xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">Tournament Hub</h1>
            <p className="text-xs text-cyan-400/70 font-semibold tracking-widest uppercase">{user.displayName || 'Organizer'}</p>
          </div>
        </div>
        <button onClick={signOut} className="text-cyan-400/60 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-oswald font-black uppercase tracking-wider mb-2">Your Tournaments</h2>
            <p className="text-cyan-400/60">Manage your active tournaments and points tables.</p>
          </div>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,204,255,0.3)] hover:shadow-[0_0_25px_rgba(0,204,255,0.5)] transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> Create Tournament
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="border border-dashed border-cyan-800/50 bg-[#0a142f]/30 rounded-2xl p-16 text-center">
            <Trophy className="w-16 h-16 text-cyan-800 mx-auto mb-4" />
            <h3 className="text-2xl font-oswald font-black uppercase text-cyan-400/80 mb-2">No Tournaments Yet</h3>
            <p className="text-cyan-400/50 max-w-md mx-auto mb-6">Create your first tournament to start managing teams, groups, and calculating points.</p>
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="bg-cyan-900/50 hover:bg-cyan-800/80 text-cyan-300 border border-cyan-500/30 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
            >
              Start Registration
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(t => (
              <div key={t.id} onClick={() => navigate(`/tournament/${t.id}`)} className="bg-[#0a142f] border border-cyan-900/50 rounded-xl p-6 cursor-pointer hover:border-cyan-400/50 hover:bg-[#0d1d42] transition-all group shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-cyan-950 p-2.5 rounded-lg border border-cyan-800/50 group-hover:border-cyan-400/50 transition-colors">
                    <Trophy className="w-6 h-6 text-cyan-500" />
                  </div>
                  <span className="text-xs font-bold text-cyan-400/50 uppercase tracking-widest bg-cyan-950 px-2 py-1 rounded border border-cyan-900/50">{t.slots} Slots</span>
                </div>
                <h3 className="text-xl font-oswald font-bold uppercase tracking-wide mb-1 text-white group-hover:text-cyan-300 transition-colors">{t.name}</h3>
                <p className="text-sm text-cyan-400/60 mb-6 line-clamp-1">Manage Points Table & Leaderboard</p>
                <div className="flex items-center text-cyan-500 text-sm font-bold uppercase tracking-widest">
                  Open Editor <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isWizardOpen && (
        <TournamentWizard 
          onClose={() => setIsWizardOpen(false)} 
          user={user} 
          onSuccess={(id) => {
            setIsWizardOpen(false);
            fetchTournaments();
          }} 
        />
      )}
    </div>
  );
}

function TournamentWizard({ onClose, user, onSuccess }: { onClose: () => void, user: User, onSuccess: (id: string) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [slots, setSlots] = useState<number>(48);
  const [phases, setPhases] = useState([{
    name: 'Group Stage',
    groupsCount: 4,
    matchesPerGroup: 6,
    qualifiedPerGroup: 6,
    nextStageTarget: 'Semi Finals'
  }]);

  const handleAddPhase = () => {
    setPhases([...phases, {
      name: `Phase ${phases.length + 1}`,
      groupsCount: 2,
      matchesPerGroup: 6,
      qualifiedPerGroup: 6,
      nextStageTarget: 'Grand Finals'
    }]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      // 1. Create Tournament
      const tRef = await addDoc(collection(db, 'tournaments'), {
        ownerId: user.uid,
        name,
        slots,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Create Phases Subcollections
      for (let i = 0; i < phases.length; i++) {
        const p = phases[i];
        const isFinal = i === phases.length - 1;
        
        await addDoc(collection(db, `tournaments/${tRef.id}/phases`), {
          tournamentId: tRef.id,
          phaseNumber: i + 1,
          name: p.name,
          groupsCount: p.groupsCount,
          matchesPerGroup: p.matchesPerGroup,
          qualifiedPerGroup: isFinal ? 0 : p.qualifiedPerGroup, // Finals usually have 1 overall winner, not 'qualified'
          isFinal: isFinal,
          championRushEnabled: isFinal, // By default turn it on for Finals
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      onSuccess(tRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tournaments');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#050b1a] border border-cyan-800/50 rounded-2xl w-full max-w-3xl shadow-[0_0_50px_rgba(0,150,255,0.15)] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0a142f] border-b border-cyan-900/50 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <h2 className="font-oswald font-bold text-xl uppercase tracking-wider">Tournament Registration</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-oswald font-black uppercase text-cyan-300 mb-6">Basic Info</h3>
              
              <div>
                <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Tournament Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. MS Esports Championship 2026"
                  className="w-full bg-[#0a142f] border border-cyan-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Total Number of Slots</label>
                <div className="flex gap-4">
                  {[24, 48, 72, 96, 144].map(num => (
                    <button 
                      key={num}
                      onClick={() => setSlots(num)}
                      className={`flex-1 py-3 rounded-xl border font-bold text-lg transition-all ${slots === num ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,204,255,0.4)]' : 'bg-[#0a142f] border-cyan-900/50 text-cyan-400/50 hover:border-cyan-500/50 hover:text-cyan-300'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-cyan-400/50 uppercase font-semibold">Custom:</span>
                  <input 
                    type="number" 
                    value={slots}
                    onChange={e => setSlots(parseInt(e.target.value) || 0)}
                    className="bg-[#0a142f] border border-cyan-900/50 rounded-lg px-4 py-2 w-24 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 px-8 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Setup Phases <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-oswald font-black uppercase text-cyan-300">Format & Phases</h3>
                <button onClick={handleAddPhase} className="text-xs bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 px-3 py-1.5 rounded flex items-center gap-1 border border-cyan-700/50 font-bold uppercase tracking-widest transition-colors">
                  <Plus className="w-3 h-3" /> Add Phase
                </button>
              </div>

              <div className="space-y-4">
                {phases.map((phase, idx) => (
                  <div key={idx} className="bg-[#0a142f] border border-cyan-900/50 rounded-xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1.5">Phase Name</label>
                        <input 
                          type="text" 
                          value={phase.name}
                          onChange={e => {
                            const newPhases = [...phases];
                            newPhases[idx].name = e.target.value;
                            setPhases(newPhases);
                          }}
                          className="w-full bg-[#050b1a] border border-cyan-900/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1.5">Groups</label>
                        <input 
                          type="number" 
                          value={phase.groupsCount}
                          onChange={e => {
                            const newPhases = [...phases];
                            newPhases[idx].groupsCount = parseInt(e.target.value) || 0;
                            setPhases(newPhases);
                          }}
                          className="w-full bg-[#050b1a] border border-cyan-900/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1.5">Matches</label>
                        <input 
                          type="number" 
                          value={phase.matchesPerGroup}
                          onChange={e => {
                            const newPhases = [...phases];
                            newPhases[idx].matchesPerGroup = parseInt(e.target.value) || 0;
                            setPhases(newPhases);
                          }}
                          className="w-full bg-[#050b1a] border border-cyan-900/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    
                    {idx < phases.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-cyan-900/30 flex flex-col md:flex-row gap-4 items-center bg-cyan-950/20 p-3 rounded-lg">
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider whitespace-nowrap">Top</span>
                          <input 
                            type="number" 
                            value={phase.qualifiedPerGroup}
                            onChange={e => {
                              const newPhases = [...phases];
                              newPhases[idx].qualifiedPerGroup = parseInt(e.target.value) || 0;
                              setPhases(newPhases);
                            }}
                            className="bg-[#050b1a] border border-cyan-800/50 rounded w-16 px-2 py-1 text-white text-center focus:outline-none focus:border-cyan-400"
                          />
                          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Qualify for</span>
                          <input 
                            type="text" 
                            value={phase.nextStageTarget}
                            onChange={e => {
                              const newPhases = [...phases];
                              newPhases[idx].nextStageTarget = e.target.value;
                              setPhases(newPhases);
                            }}
                            className="flex-1 bg-[#050b1a] border border-cyan-800/50 rounded px-3 py-1 text-white text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    )}

                    {idx === phases.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-cyan-900/30 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Final Phase - Champion Rush Mode will be available</span>
                      </div>
                    )}
                    
                    {phases.length > 1 && (
                      <button 
                        onClick={() => {
                          const newPhases = [...phases];
                          newPhases.splice(idx, 1);
                          setPhases(newPhases);
                        }}
                        className="absolute top-2 right-2 text-red-500/50 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t border-cyan-900/50">
                <button 
                  onClick={() => setStep(1)}
                  className="text-cyan-400/70 hover:text-cyan-300 font-bold uppercase tracking-wider text-sm transition-colors"
                >
                  Back
                </button>
                <button 
                  disabled={loading}
                  onClick={handleSave}
                  className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 px-8 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                  Create Tournament
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

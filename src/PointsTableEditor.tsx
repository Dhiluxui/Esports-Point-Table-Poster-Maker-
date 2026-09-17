import React, { useState, useRef, useEffect, useCallback } from 'react';
import { domToPng } from 'modern-screenshot';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { TemplateClassic } from './components/templates/TemplateClassic';
import { TemplateCleanMinimal } from './components/templates/TemplateCleanMinimal';
import { TemplateModernGlass } from './components/templates/TemplateModernGlass';

import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Trophy, 
  Download, 
  Settings, 
  Target,
  Image as ImageIcon,
  Calculator,
  Search,
  Plus,
  Shield,
  Upload,
  Instagram,
  Youtube,
  Trash2,
  Video,
  MessageSquare,
  X,
  Crown,
  ArrowLeft,
  Flame
} from 'lucide-react';
import GoogleFormsImport from './components/GoogleFormsImport';
import { TeamScore, Branding } from './types';
import { Copy } from 'lucide-react';

const PLACEMENT_POINTS: Record<number, number> = {
  1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5,
  7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0,
};

const DEFAULT_TEAMS: TeamScore[] = [
  { id: '1', name: 'TEAM 1', matchesPlayed: 1, booyahs: 1, placementPoints: 12, killPoints: 8, totalPoints: 20 },
  { id: '2', name: 'TEAM 2', matchesPlayed: 1, booyahs: 0, placementPoints: 9, killPoints: 6, totalPoints: 15 },
  { id: '3', name: 'TEAM 3', matchesPlayed: 1, booyahs: 0, placementPoints: 8, killPoints: 5, totalPoints: 13 },
  { id: '4', name: 'TEAM 4', matchesPlayed: 1, booyahs: 0, placementPoints: 7, killPoints: 4, totalPoints: 11 },
  { id: '5', name: 'TEAM 5', matchesPlayed: 1, booyahs: 0, placementPoints: 6, killPoints: 4, totalPoints: 10 },
  { id: '6', name: 'TEAM 6', matchesPlayed: 1, booyahs: 0, placementPoints: 5, killPoints: 3, totalPoints: 8 },
  { id: '7', name: 'TEAM 7', matchesPlayed: 1, booyahs: 0, placementPoints: 4, killPoints: 3, totalPoints: 7 },
  { id: '8', name: 'TEAM 8', matchesPlayed: 1, booyahs: 0, placementPoints: 3, killPoints: 2, totalPoints: 5 },
  { id: '9', name: 'TEAM 9', matchesPlayed: 1, booyahs: 0, placementPoints: 2, killPoints: 2, totalPoints: 4 },
  { id: '10', name: 'TEAM 10', matchesPlayed: 1, booyahs: 0, placementPoints: 1, killPoints: 1, totalPoints: 2 },
  { id: '11', name: 'TEAM 11', matchesPlayed: 1, booyahs: 0, placementPoints: 0, killPoints: 1, totalPoints: 1 },
  { id: '12', name: 'TEAM 12', matchesPlayed: 1, booyahs: 0, placementPoints: 0, killPoints: 0, totalPoints: 0 },
];

interface Phase {
  id: string;
  name: string;
  isFinal: boolean;
  championRushEnabled: boolean;
  qualifiedPerGroup: number;
}

export default function PointsTableEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [teams, setTeams] = useState<TeamScore[]>(DEFAULT_TEAMS);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const initialLoadDone = useRef(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | ''>('');

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [matchImage, setMatchImage] = useState<string | null>(null);
  const [branding, setBranding] = useState<Branding>({
    backgroundImage: '/assets/default-bg.jpg',
    tournamentLogo: '/assets/default-logo.png',
    topLeftLogo: '/assets/default-tl.png',
    topRightLogo: '/assets/default-tr.png',
    instagramHandle: '@magadh_striker',
    youtubeHandle: 'Magadh Striker',
    discordHandle: 'Magadh Striker',
    tagline: 'TURNING UNDERDOG TO CHAMPIONSHIP',
    organizationName: 'ORGANIZED BY :- MAGADH STRIKER',
    title: 'OVERALL\nSTANDINGS',
    subtitle: 'DAY 01 | SEMIFINAL G1',
    stageName: '',
    footerText: 'MAGADH STRIKER 2026',
    sponsorLogo: '/assets/default-sponsor.png',
    collegeLogo: '/assets/default-college.png',
    sponsorName: 'Deathwish',
    showTeamLogos: true,
    showQualification: true,
    showMatches: true,
    qualificationThreshold: 6,
  });
  
  // Calculator State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamScore | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [kills, setKills] = useState<number>(0);
  const [position, setPosition] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const [exportedImage, setExportedImage] = useState<string | null>(null);

  const posterRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
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
              // If it's from the last 24 hours
              const isRecent = (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000;
              // If cloud data has no teams (never saved successfully), ALWAYS use local storage
              const cloudHasNoTeams = !data.teams || data.teams.length === 0;
              
              // To handle clock drift between client and server, we just check if it's recent and cloud has no teams,
              // OR if we stored the local time of the last cloud save and our backup is newer.
              if (isRecent) {
                if (cloudHasNoTeams || parsed.timestamp > (parsed.lastCloudSaveLocalTime || 0) + 1000) {
                   shouldUseLocal = true;
                   setTeams(parsed.teams);
                   setBranding(parsed.branding);
                   loadedFromCloud = true;
                }
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
      } finally {
        // Allow a small delay to ensure states are settled before enabling autosave
        setTimeout(() => { initialLoadDone.current = true; }, 1000);
      }
    };
    
    fetchTournamentData();
  }, [id, currentUser]);

  const saveToCloud = useCallback(async () => {
    if (!id || !isOwner) return;
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: serverTimestamp()
      });
      lastCloudSaveLocalTime.current = Date.now();
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

  // Prevent leaving if saving & handle visibility change (backgrounding)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving' || saveStatus === '') {
         // Attempt sync on unload if there might be unsaved changes
         saveToCloud();
      }
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
         // App went to background (e.g. user clicked a message notification)
         // Force an immediate cloud save if there are unsaved changes
         if (initialLoadDone.current && isOwner) {
            saveToCloud();
            // Also force local storage sync just in case
            try {
              localStorage.setItem(`tournament_backup_${id}`, JSON.stringify({ 
                teams, 
                branding, 
                timestamp: Date.now(),
                lastCloudSaveLocalTime: lastCloudSaveLocalTime.current
              }));
            } catch (e) {}
         }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveStatus, saveToCloud, teams, branding, id, isOwner]);

  // LocalStorage Backup Fallback (Immediate)
  const lastCloudSaveLocalTime = useRef(Date.now());
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      localStorage.setItem(`tournament_backup_${id}`, JSON.stringify({ 
        teams, 
        branding, 
        timestamp: Date.now(),
        lastCloudSaveLocalTime: lastCloudSaveLocalTime.current
      }));
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
  }, [id]);

  const copyPublicLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };


  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const padding = window.innerWidth >= 1024 ? 64 : 32;
        const containerWidth = previewContainerRef.current.clientWidth - padding;
        const containerHeight = previewContainerRef.current.clientHeight - padding;
        
        const scaleByWidth = containerWidth / 800;
        const scaleByHeight = containerHeight / 1000;
        
        if (window.innerWidth >= 1024) {
           // Desktop: try to fit entire poster in viewport
           setPreviewScale(Math.min(scaleByWidth, scaleByHeight, 1));
        } else {
           // Mobile: just fit horizontally, let it scroll vertically
           setPreviewScale(scaleByWidth > 0 ? Math.min(scaleByWidth, 1) : 1);
        }
      }
    };

    updateScale();
    
    let observer: ResizeObserver;
    if (previewContainerRef.current) {
      observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(previewContainerRef.current);
    }
    
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      if (observer) observer.disconnect();
    };
  }, [mobileTab]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'match' | 'background' | 'tournament' | 'topLeft' | 'topRight' | 'sponsor' | 'college' | 'caster'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'match') {
        setMatchImage(dataUrl);
      } else if (target === 'background') {
        setBranding((prev) => ({ ...prev, backgroundImage: dataUrl }));
      } else {
        setBranding((prev) => ({ ...prev, [`${target}Logo`]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input so the same file can be uploaded again
  };

  const calculateAndSave = () => {
    if (!selectedTeam) return;

    const pp = PLACEMENT_POINTS[position] || 0;
    const kp = kills;
    const tp = pp + kp;

    setTeams((prev) => {
      const updated = prev.map((t) => {
        if (t.id === selectedTeam.id) {
          return {
            ...t,
            matchesPlayed: t.matchesPlayed + 1,
            booyahs: t.booyahs + (position === 1 ? 1 : 0),
            placementPoints: t.placementPoints + pp,
            killPoints: t.killPoints + kp,
            totalPoints: t.totalPoints + tp,
          };
        }
        return t;
      });
      return updated.sort((a, b) => b.totalPoints - a.totalPoints || b.placementPoints - a.placementPoints);
    });

    // Reset calc form
    setSelectedTeam(null);
    setSearchQuery('');
    setKills(0);
    setPosition(1);
  };

  const addNewTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: TeamScore = {
      id: Date.now().toString(),
      name: newTeamName.toUpperCase(),
      matchesPlayed: 0,
      booyahs: 0,
      placementPoints: 0,
      killPoints: 0,
      totalPoints: 0,
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setSelectedTeam(newTeam);
    setSearchQuery(newTeam.name);
  };

  const exportPoster = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure all DOM is fully painted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const exportOptions = {
        width: 800,
        height: 1000,
        scale: isMobile ? 1.5 : 2, // Slightly lower scale on mobile prevents RAM crash on Xiaomi/budget devices
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '800px',
          height: '1000px'
        },
        fetch: {
          bypassingCache: true
        }
      };

      // modern-screenshot is specifically built to fix iOS Safari empty canvas bugs
      // and it supports modern CSS like oklab because it uses native foreignObject
      let dataUrl = '';
      
      try {
        dataUrl = await domToPng(posterRef.current, exportOptions);
      } catch (e) {
        console.warn("First render pass failed, retrying...", e);
        // Sometimes mobile browsers need a second pass
        await new Promise(resolve => setTimeout(resolve, 800));
        dataUrl = await domToPng(posterRef.current, exportOptions);
      }
      
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
        throw new Error("Image generation failed (empty canvas returned by browser).");
      }
      
      // Robust Base64 to Blob converter (avoids fetch(dataUrl) which fails on some mobile browsers)
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      
      if (blob.size === 0) {
        throw new Error("Generated Blob is 0 bytes.");
      }

      // Desktop & Mobile: Force standard anchor download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `FF_Points_Table_${Date.now()}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Failed to export poster', err);
alert('Please try again. Your browser blocked the download.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pad = (num: number) => num.toString().padStart(2, '0');

  const isShowQualification = branding.showQualification !== false && !branding.championRushEnabled;
  const hasStatusColumn = isShowQualification || branding.championRushEnabled;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-rajdhani selection:bg-cyan-500/30">
      <header className={`border-b border-white/5 bg-[#0b132b]/80 backdrop-blur-md px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 `}>
        <div className="flex items-center gap-3">
          <button onClick={() => { if(isOwner) { saveToCloud(); } navigate('/'); }} className="w-10 h-10 rounded bg-[#0a142f] flex items-center justify-center text-cyan-500 hover:text-white hover:bg-cyan-600 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-teko text-2xl md:text-3xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold uppercase tracking-wider flex items-center gap-2">
              FF Max Point Table
              <span className="text-[10px] md:text-xs bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-rajdhani tracking-widest align-middle mt-1">v1.3.0</span>
            </h1>
            <p className="text-[10px] md:text-xs text-cyan-200/60 font-medium uppercase tracking-widest mt-0.5">Esports Calculator & Generator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {isOwner && (
            <>
              <button
                onClick={() => setIsManagerOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-[#0a142f] hover:bg-[#0f1d40] border border-cyan-500/30 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors text-cyan-400 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" />
                Manage
              </button>
              
              <button
                onClick={saveToCloud}
                disabled={isSaving}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 ${saveStatus === 'saved' ? 'bg-green-900/50 border-green-500/50 text-green-400' : saveStatus === 'error' ? 'bg-red-900/50 border-red-500/50 text-red-400' : 'bg-cyan-900/50 hover:bg-cyan-800/80 border-cyan-500/50 text-cyan-300'} border rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap disabled:opacity-50`}
              >
                <Upload className="w-3.5 h-3.5" />
                {saveStatus === 'saved' ? 'Saved!' : isSaving ? 'Saving...' : 'Cloud Sync'}
              </button>


            </>
          )}
          

          
          <button
            onClick={exportPoster}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          >
            <Download className="w-4 h-4 hidden md:block" />
            {isExporting ? 'Saving...' : 'Save to Device'}
          </button>
        </div>
      </header>

      <main className={`flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-130px)] md:h-[calc(100vh-73px)] lg:overflow-hidden `}>
        
        {/* LEFT PANEL: CONTROLS */}
        {isOwner && (
        <div className={`w-full lg:w-[450px] flex-shrink-0 border-r-0 lg:border-r border-cyan-900/30 bg-[#070f22] lg:overflow-y-auto hidden-scrollbar ${mobileTab === 'editor' ? '' : 'hidden lg:flex'}  flex-col pb-20 lg:pb-0`} >
          
          {/* Reference Image Section */}
          <div className="p-6 border-b border-cyan-900/30 bg-[#040915]">
            <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <Video className="w-5 h-5" />
              <h2 className="font-oswald text-lg font-semibold uppercase tracking-wider">Match Reference</h2>
            </div>
            
            {matchImage ? (
              <div className="relative rounded-lg overflow-hidden border border-cyan-500/20 group">
                <img src={matchImage} alt="Match Screenshot" className="w-full h-auto object-contain" />
                <button 
                  onClick={() => setMatchImage(null)}
                  className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-red-600 rounded text-white backdrop-blur transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-xs text-cyan-300 uppercase tracking-wider font-semibold border border-cyan-500/20">
                  Reference Uploaded
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cyan-500/20 rounded-lg hover:border-cyan-400/50 hover:bg-cyan-900/20 transition-colors cursor-pointer group">
                <ImageIcon className="w-8 h-8 text-cyan-800 mb-3 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm text-cyan-100 font-medium">Click to upload screenshot</span>
                <span className="text-xs text-cyan-600 mt-1">Read scores directly from game SS</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'match')} />
              </label>
            )}
          </div>

          {/* Calculator Section */}
          <div className="p-6 border-b border-cyan-900/30">
            <div className="flex items-center gap-2 mb-5 text-cyan-400">
              <Calculator className="w-5 h-5" />
              <h2 className="font-oswald text-lg font-semibold uppercase tracking-wider">Calculator</h2>
            </div>

            <div className="space-y-5">
              {/* Search & Select */}
              <div>
                <label className="block text-xs font-semibold text-cyan-400/70 uppercase tracking-widest mb-2">Target Team</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedTeam && selectedTeam.name !== e.target.value) setSelectedTeam(null);
                    }}
                    className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-md py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold uppercase"
                    placeholder="SEARCH REGISTERED TEAMS..."
                  />
                </div>
                
                {/* Team Quick Select Chips */}
                {!selectedTeam && searchQuery && (
                  <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {filteredTeams.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTeam(t);
                          setSearchQuery(t.name);
                        }}
                        className="px-3 py-1.5 bg-[#0f1d40] border border-cyan-500/10 rounded text-xs font-semibold hover:bg-[#1a2f60] hover:border-cyan-400/50 transition-colors uppercase whitespace-nowrap text-cyan-100"
                      >
                        {t.name}
                      </button>
                    ))}
                    {filteredTeams.length === 0 && (
                      <div className="w-full flex items-center gap-2">
                        <input 
                          type="text" 
                          value={newTeamName} 
                          onChange={(e)=>setNewTeamName(e.target.value)}
                          placeholder="NEW TEAM NAME"
                          className="flex-1 bg-[#0a142f] border border-cyan-500/20 rounded py-1.5 px-3 text-xs uppercase"
                        />
                        <button onClick={addNewTeam} className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 rounded text-xs font-bold border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-colors flex items-center gap-1 uppercase">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cyan-400/70 uppercase tracking-widest mb-2">Rank (Pos)</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-md p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-semibold appearance-none"
                  >
                    {Object.keys(PLACEMENT_POINTS).map(p => (
                      <option key={p} value={p}>#{p} ({PLACEMENT_POINTS[Number(p)]} PP)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cyan-400/70 uppercase tracking-widest mb-2">Total Kills</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <input
                      type="number"
                      min="0"
                      value={kills}
                      onChange={(e) => setKills(Number(e.target.value) || 0)}
                      className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-md py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-cyan-400 font-semibold text-xl"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={calculateAndSave}
                disabled={!selectedTeam}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:grayscale transition-all disabled:pointer-events-none"
              >
                Save Points
              </button>
            </div>
          </div>

          {/* Custom Branding Settings */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5 text-cyan-100">
              <Settings className="w-5 h-5" />
              <h2 className="font-oswald text-lg font-semibold uppercase tracking-wider">Custom Design</h2>
            </div>
            
            <div className="space-y-6">
              
              
              {/* --- Section: Template Style --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Template Style
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <select 
                        value={branding.templateStyle || 'classic'} 
                        onChange={e => setBranding(p => ({...p, templateStyle: e.target.value}))} 
                        className="w-full bg-[#0a142f] border border-cyan-500/20 text-cyan-50 rounded px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 uppercase tracking-wider font-semibold"
                      >
                        <option value="classic">Classic Pro</option>
                        <option value="clean_minimal">Clean Minimal</option>
                        <option value="modern_glass">Modern Glass</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Section: Theme & Colors --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Theme & Colors
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Primary Color</label>
                      <div className="flex gap-2 items-center bg-[#0a142f] border border-cyan-500/20 rounded p-1">
                        <input type="color" value={branding.theme?.primaryColor || '#0055ff'} onChange={e => setBranding(p => ({...p, theme: {...p.theme, primaryColor: e.target.value}}))} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
                        <input type="text" value={branding.theme?.primaryColor || '#0055ff'} onChange={e => setBranding(p => ({...p, theme: {...p.theme, primaryColor: e.target.value}}))} className="w-full bg-transparent text-xs text-cyan-50 focus:outline-none uppercase" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Accent Color</label>
                      <div className="flex gap-2 items-center bg-[#0a142f] border border-cyan-500/20 rounded p-1">
                        <input type="color" value={branding.theme?.accentColor || '#00ccff'} onChange={e => setBranding(p => ({...p, theme: {...p.theme, accentColor: e.target.value}}))} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
                        <input type="text" value={branding.theme?.accentColor || '#00ccff'} onChange={e => setBranding(p => ({...p, theme: {...p.theme, accentColor: e.target.value}}))} className="w-full bg-transparent text-xs text-cyan-50 focus:outline-none uppercase" />
                      </div>
                    </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Background Accent</label>
                      <div className="flex gap-2 items-center bg-[#0a142f] border border-cyan-500/20 rounded p-1">
                        <input type="color" value={branding.theme?.textColor || '#0f1b3d'} onChange={e => setBranding(p => ({...p, theme: {...p.theme, textColor: e.target.value}}))} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
                        <input type="text" value={branding.theme?.textColor || '#0f1b3d'} onChange={e => setBranding(p => ({...p, theme: {...p.theme, textColor: e.target.value}}))} className="w-full bg-transparent text-xs text-cyan-50 focus:outline-none uppercase" />
                      </div>
                  </div>
                </div>
              </div>

              {/* --- Section: Graphics & Logos --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> Graphics & Logos
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Background Image</label>
                    <label className="flex items-center justify-center p-3 border border-dashed border-cyan-500/30 rounded-lg bg-[#0a142f] hover:bg-[#0f1d40] transition-colors cursor-pointer text-sm text-cyan-100 font-medium text-center">
                        <Upload className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" /> 
                        {branding.backgroundImage === '/assets/default-bg.jpg' ? 'Replace Default BG' : 'Change Background'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} />
                    </label>
                    {branding.backgroundImage && branding.backgroundImage !== '/assets/default-bg.jpg' && (
                      <button onClick={() => setBranding(p => ({...p, backgroundImage: '/assets/default-bg.jpg'}))} className="mt-2 text-[10px] text-red-400 hover:text-red-300 uppercase font-semibold flex items-center justify-center w-full bg-red-950/20 py-1.5 rounded">Remove Custom Background</button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Center Shield</label>
                      <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        <img src={branding.tournamentLogo || "/assets/default-logo.png"} alt="Center" className="h-6 object-contain opacity-70 hover:opacity-100 transition-all" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'tournament')} />
                      </label>
                      {branding.tournamentLogo && branding.tournamentLogo !== '/assets/default-logo.png' && (
                        <button onClick={() => setBranding(p => ({...p, tournamentLogo: '/assets/default-logo.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Top Left</label>
                      <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.topLeftLogo ? <img src={branding.topLeftLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'topLeft')} />
                      </label>
                      {branding.topLeftLogo && branding.topLeftLogo !== '/assets/default-tl.png' && (
                        <button onClick={() => setBranding(p => ({...p, topLeftLogo: '/assets/default-tl.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Top Right</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.topRightLogo ? <img src={branding.topRightLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'topRight')} />
                      </label>
                      {branding.topRightLogo && branding.topRightLogo !== '/assets/default-tr.png' && (
                        <button onClick={() => setBranding(p => ({...p, topRightLogo: '/assets/default-tr.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Sponsor</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.sponsorLogo ? <img src={branding.sponsorLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sponsor')} />
                      </label>
                      {branding.sponsorLogo && branding.sponsorLogo !== '/assets/default-sponsor.png' && (
                        <button onClick={() => setBranding(p => ({...p, sponsorLogo: '/assets/default-sponsor.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">College</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.collegeLogo ? <img src={branding.collegeLogo} className="h-6 object-contain opacity-70 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'college')} />
                      </label>
                      {branding.collegeLogo && (
                        <button onClick={() => setBranding(p => ({...p, collegeLogo: branding.collegeLogo === '/assets/default-college.png' ? null : '/assets/default-college.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">
                          {branding.collegeLogo === '/assets/default-college.png' ? 'Remove' : 'Reset'}
                        </button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Caster</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.casterLogo ? <img src={branding.casterLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'caster')} />
                      </label>
                      {branding.casterLogo && (
                        <button onClick={() => setBranding(p => ({...p, casterLogo: null}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Section: Social Handles --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Social Handles
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 focus-within:border-cyan-400 transition-colors">
                    <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <input type="text" value={branding.instagramHandle} onChange={e=>setBranding(p=>({...p, instagramHandle: e.target.value}))} className="w-full bg-transparent py-2.5 pl-3 text-sm focus:outline-none text-cyan-50" placeholder="Instagram Handle" />
                  </div>
                  <div className="flex items-center bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 focus-within:border-cyan-400 transition-colors">
                    <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <input type="text" value={branding.youtubeHandle} onChange={e=>setBranding(p=>({...p, youtubeHandle: e.target.value}))} className="w-full bg-transparent py-2.5 pl-3 text-sm focus:outline-none text-cyan-50" placeholder="YouTube Handle" />
                  </div>
                  <div className="flex items-center bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 focus-within:border-cyan-400 transition-colors">
                    <MessageSquare className="w-4 h-4 text-[#5865F2] flex-shrink-0" />
                    <input type="text" value={branding.discordHandle || ''} onChange={e=>setBranding(p=>({...p, discordHandle: e.target.value}))} className="w-full bg-transparent py-2.5 pl-3 text-sm focus:outline-none text-cyan-50" placeholder="Discord Handle" />
                  </div>
                </div>
              </div>
              
              {/* --- Section: Titles & Text --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Titles & Text
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Tagline</label>
                    <input type="text" value={branding.tagline || ''} onChange={e=>setBranding(p=>({...p, tagline: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Organization Name</label>
                    <input type="text" value={branding.organizationName} onChange={e=>setBranding(p=>({...p, organizationName: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Title (Newlines for breaks)</label>
                    <textarea value={branding.title} onChange={e=>setBranding(p=>({...p, title: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 h-[70px] resize-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Stage name</label>
                      <select 
                        value={branding.stageName || ''} 
                        onChange={e => {
                          const phaseName = e.target.value;
                          const selectedPhase = phases.find(p => p.name === phaseName);
                          if (selectedPhase) {
                            setBranding(p => ({
                              ...p, 
                              stageName: phaseName,
                              championRushEnabled: selectedPhase.championRushEnabled,
                              qualificationThreshold: selectedPhase.qualifiedPerGroup > 0 ? selectedPhase.qualifiedPerGroup : p.qualificationThreshold,
                              showQualification: !selectedPhase.isFinal
                            }));
                          } else {
                            setBranding(p => ({...p, stageName: phaseName}));
                          }
                        }} 
                        className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors"
                      >
                        <option value="">None</option>
                        {phases.length > 0 ? (
                          phases.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))
                        ) : (
                          <>
                            <option value="QUALIFIER">QUALIFIER</option>
                            <option value="SEMI-FINAL">SEMI-FINAL</option>
                            <option value="FINAL">FINAL</option>
                            <option value="GRAND-FINAL">GRAND-FINAL</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Subtitle</label>
                      <input type="text" value={branding.subtitle} onChange={e=>setBranding(p=>({...p, subtitle: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Sponsor Name</label>
                    <input type="text" value={branding.sponsorName || ''} onChange={e=>setBranding(p=>({...p, sponsorName: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Footer Text</label>
                    <input type="text" value={branding.footerText} onChange={e=>setBranding(p=>({...p, footerText: e.target.value}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                  </div>
                </div>
              </div>

              {/* --- Section: Tournament Phase / Format --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Tournament Phase / Format
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-cyan-100 uppercase tracking-widest">Show Phase Strip</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.phaseDetails?.enabled || false} onChange={e=>setBranding(p=>({...p, phaseDetails: { ...(p.phaseDetails || {}), enabled: e.target.checked }}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.phaseDetails?.enabled ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>
                  
                  {branding.phaseDetails?.enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">No. of Groups</label>
                          <input type="text" placeholder="e.g. 4" value={branding.phaseDetails?.groupCount || ''} onChange={e=>setBranding(p=>({...p, phaseDetails: { ...(p.phaseDetails || {enabled: true}), groupCount: e.target.value }}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">No. of Matches</label>
                          <input type="text" placeholder="e.g. 6 or CHAMPION RUSH" value={branding.phaseDetails?.matchCount || ''} onChange={e=>setBranding(p=>({...p, phaseDetails: { ...(p.phaseDetails || {enabled: true}), matchCount: e.target.value }}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Qualification Details</label>
                        <input type="text" placeholder="e.g. TOP 6 QUALIFIED directly FOR LAN PHASE" value={branding.phaseDetails?.qualificationInfo || ''} onChange={e=>setBranding(p=>({...p, phaseDetails: { ...(p.phaseDetails || {enabled: true}), qualificationInfo: e.target.value }}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-1.5">Extra Info (e.g. Next Stage)</label>
                        <input type="text" placeholder="e.g. Next Stage: FINAL" value={branding.phaseDetails?.extraInfo || ''} onChange={e=>setBranding(p=>({...p, phaseDetails: { ...(p.phaseDetails || {enabled: true}), extraInfo: e.target.value }}))} className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-cyan-50 transition-colors" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* --- Section: Table Configuration --- */}
              <div className="bg-[#050b1a] rounded-lg border border-cyan-900/50 overflow-hidden shadow-sm">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-900/50">
                  <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Table Configuration
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-cyan-100 uppercase tracking-widest">Show Team Logos</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.showTeamLogos !== false} onChange={e=>setBranding(p=>({...p, showTeamLogos: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.showTeamLogos !== false ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-cyan-900/30">
                    <label className={`block text-[11px] font-semibold uppercase tracking-widest ${branding.championRushEnabled ? 'text-cyan-400/30' : 'text-cyan-100'}`}>Show (Q/E) Status</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" disabled={branding.championRushEnabled === true} checked={isShowQualification} onChange={e=>setBranding(p=>({...p, showQualification: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500 disabled:opacity-50" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${isShowQualification ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'} ${branding.championRushEnabled ? 'opacity-50' : ''}`}></label>
                    </div>
                  </div>
                  
                  {isShowQualification && (
                    <div className="pl-3 pr-3 py-3 bg-[#0a142f]/50 rounded-lg border border-cyan-900/30">
                      <label className="flex justify-between text-[10px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-3">
                        <span>Qualified Teams Threshold</span>
                        <span className="text-cyan-400 font-bold text-xs bg-cyan-900/40 px-2 py-0.5 rounded">{branding.qualificationThreshold ?? 9}</span>
                      </label>
                      <input type="range" min="0" max="12" value={branding.qualificationThreshold ?? 9} onChange={e=>setBranding(p=>({...p, qualificationThreshold: parseInt(e.target.value, 10)}))} className="w-full h-1.5 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-cyan-900/30">
                    <label className="block text-[11px] font-semibold text-cyan-100 uppercase tracking-widest">Show Matches Col</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.showMatches !== false} onChange={e=>setBranding(p=>({...p, showMatches: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-cyan-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.showMatches !== false ? 'bg-cyan-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cyan-900/30">
                    <label className="block text-[11px] font-semibold text-amber-400/90 uppercase tracking-[0.05em]">Champion Rush Mode</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" checked={branding.championRushEnabled === true} onChange={e=>setBranding(p=>({...p, championRushEnabled: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0a142f] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-amber-500" style={{ top: '2px', left: '2px' }} />
                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${branding.championRushEnabled === true ? 'bg-amber-500' : 'bg-[#0a142f] border border-cyan-500/20'}`}></label>
                    </div>
                  </div>

                  {branding.championRushEnabled === true && (
                    <div className="pl-3 pr-3 py-3 bg-amber-950/20 rounded-lg border border-amber-900/30">
                      <label className="block text-[10px] font-semibold text-amber-400/70 uppercase tracking-widest mb-2">Champion Rush Threshold (pts)</label>
                      <input type="number" min="0" value={branding.championRushThreshold ?? 80} onChange={e=>setBranding(p=>({...p, championRushThreshold: parseInt(e.target.value, 10) || 0}))} className="w-full bg-[#0a142f] border border-amber-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 text-amber-50 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* RIGHT PANEL: POSTER PREVIEW */}
        <div ref={previewContainerRef} className={`flex-1 bg-[#010815] p-2 lg:p-4 overflow-auto items-center justify-center relative pb-24 lg:pb-0 ${(!isOwner || mobileTab === 'preview') ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`} style={{ backgroundImage: 'radial-gradient(circle at center, #021a30 0%, #010815 100%)' }}>
          {/* THE SCALED CANVAS WRAPPER */}
          <div style={{ width: 800 * previewScale, height: 1000 * previewScale }} className="relative flex-shrink-0 transition-transform duration-200">
            <div 
              style={{ transform: `scale(${previewScale})` }}
              className="origin-top-left absolute top-0 left-0"
            >
              <div 
                ref={posterRef}
                className="relative w-[800px] h-[1000px] bg-gradient-to-br from-[#060e22] via-[#091535] to-[#040b1c] overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col mx-auto"
                style={{
                  backgroundImage: branding.backgroundImage ? `url("${branding.backgroundImage}")` : '',
                  backgroundSize: branding.backgroundImage ? '100% 100%' : '',
                  backgroundPosition: 'center',
                  '--theme-primary': branding.theme?.primaryColor || '#0055ff',
                  '--theme-accent': branding.theme?.accentColor || '#00ccff',
                  '--theme-bg-accent': branding.theme?.textColor || '#0f1b3d',
                } as React.CSSProperties}
              >
              
              {/* Background Overlay (if no user BG) */}
              {!branding.backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent)]/20 via-[color-mix(in_srgb,var(--theme-bg-accent)_80%,#000)] to-[color-mix(in_srgb,var(--theme-bg-accent)_95%,#000)] pointer-events-none z-0" />
              )}
              
              {/* Top Corner Logos */}
              {branding.topLeftLogo && (
                <div className="absolute top-1 left-2 z-30 h-16 max-w-[200px]">
                  <img src={branding.topLeftLogo} className="h-full w-full object-contain object-left drop-shadow-md" alt="Partner Left" />
                </div>
              )}
              {branding.topRightLogo && (
                <div className="absolute top-1 right-2 z-30 h-16 max-w-[200px]">
                  <img src={branding.topRightLogo} className="h-full w-full object-contain object-right drop-shadow-md" alt="Partner Right" />
                </div>
              )}
              
              {/* Internal Poster Structure */}
              {branding.templateStyle === 'clean_minimal' ? (
                <TemplateCleanMinimal branding={branding} teams={teams} />
              ) : branding.templateStyle === 'modern_glass' ? (
                <TemplateModernGlass branding={branding} teams={teams} />
              ) : (
                <TemplateClassic branding={branding} teams={teams} />
              )}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-cyan-600 font-medium uppercase tracking-widest mt-4 pb-16 lg:pb-0">Live Preview (Aspect Ratio 4:5 - Ideal for Instagram & WhatsApp)</p>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isOwner && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070f22] border-t border-cyan-900/50 flex z-50">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors ${mobileTab === 'editor' ? 'text-cyan-400 bg-cyan-950/20' : 'text-cyan-400/50 hover:text-cyan-400/80'}`}
        >
          <Settings className="w-5 h-5" />
          Editor
        </button>
        <div className="w-[1px] bg-cyan-900/50 h-full" />
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors ${mobileTab === 'preview' ? 'text-cyan-400 bg-cyan-950/20' : 'text-cyan-400/50 hover:text-cyan-400/80'}`}
        >
          <ImageIcon className="w-5 h-5" />
          Preview
        </button>
      </div>
      )}

      {/* TEAMS MANAGER MODAL */}
      {isManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b132b] border border-cyan-500/30 rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-5xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col md:max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-oswald text-xl md:text-2xl font-semibold uppercase tracking-wider text-cyan-50">Manage Teams & Scores</h2>
                  <p className="text-[10px] md:text-xs text-cyan-400/60 uppercase tracking-widest font-medium">Direct Editor for Overalls (1-6 Matches)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsManagerOpen(false)}
                className="p-2 bg-black/40 hover:bg-red-500/20 text-cyan-400 hover:text-red-400 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
               <div className="p-4 md:p-6 border-b border-cyan-500/20">
                  <GoogleFormsImport 
                    onImport={(newTeams) => setTeams(prev => [...prev, ...newTeams])} 
                    existingTeamsCount={teams.length} 
                  />
               </div>
               <div className="min-w-[800px] pb-4">
                 {/* Table Header */}
                 <div className="sticky top-0 bg-[#070f22] grid grid-cols-12 gap-2 text-[11px] font-bold text-cyan-400/70 uppercase tracking-widest p-4 border-b border-cyan-500/20 shadow-md z-10 text-center items-center">
                    <div className="col-span-3 text-left pl-2">Team Name</div>
                    <div className="col-span-2">Matches Played</div>
                    <div className="col-span-1">Booyahs</div>
                    <div className="col-span-2">Placement Pts</div>
                    <div className="col-span-2">Kill Pts</div>
                    <div className="col-span-1">Total Pts</div>
                    <div className="col-span-1">Action</div>
                 </div>
                 
                 {/* Teams Rows */}
                 <div className="p-4 space-y-2">
                   {teams.map((team, idx) => (
                      <div key={team.id} className="grid grid-cols-12 gap-2 text-sm text-cyan-50 items-center bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
                        <div className="col-span-3 flex items-center gap-2 font-oswald text-lg">
                          <span className="text-cyan-600 font-bold w-6 text-center">{idx + 1}</span>
                          <label className="w-8 h-8 flex-shrink-0 rounded bg-black/40 border border-cyan-500/20 flex items-center justify-center cursor-pointer hover:border-cyan-400 overflow-hidden relative group">
                            {team.logo ? (
                               <img src={team.logo} className="w-full h-full object-contain" />
                            ) : (
                               <Shield className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-400" />
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  const result = e.target?.result as string;
                                  setTeams(prev => prev.map(t => t.id === team.id ? { ...t, logo: result } : t));
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <input 
                            type="text" 
                            value={team.name} 
                            onChange={(e) => {
                              const v = e.target.value.toUpperCase();
                              setTeams(prev => prev.map(t => t.id === team.id ? { ...t, name: v } : t));
                            }} 
                            className="w-full bg-black/40 border border-cyan-500/20 rounded px-3 py-1.5 focus:border-cyan-400 focus:outline-none" 
                          />
                        </div>
                        <div className="col-span-2 px-4">
                          <input 
                            type="number" min="0" value={team.matchesPlayed} 
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              setTeams(prev => prev.map(t => t.id === team.id ? { ...t, matchesPlayed: v } : t));
                            }} 
                            className="w-full bg-black/40 border border-cyan-500/20 rounded px-2 py-1.5 focus:border-cyan-400 focus:outline-none text-center" 
                          />
                        </div>
                        <div className="col-span-1 px-1">
                          <input 
                            type="number" min="0" value={team.booyahs} 
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              setTeams(prev => prev.map(t => t.id === team.id ? { ...t, booyahs: v } : t));
                            }} 
                            className="w-full bg-black/40 border border-cyan-500/20 rounded px-2 py-1.5 focus:border-cyan-400 focus:outline-none text-center font-bold text-[#10b981]" 
                          />
                        </div>
                        <div className="col-span-2 px-4">
                           <input 
                            type="number" min="0" value={team.placementPoints} 
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              setTeams(prev => prev.map(t => t.id === team.id ? { ...t, placementPoints: v, totalPoints: v + t.killPoints } : t));
                            }} 
                            className="w-full bg-black/40 border border-cyan-500/20 rounded px-2 py-1.5 focus:border-cyan-400 focus:outline-none text-center" 
                          />
                        </div>
                        <div className="col-span-2 px-4">
                          <input 
                            type="number" min="0" value={team.killPoints} 
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              setTeams(prev => prev.map(t => t.id === team.id ? { ...t, killPoints: v, totalPoints: t.placementPoints + v } : t));
                            }} 
                            className="w-full bg-black/40 border border-cyan-500/20 rounded px-2 py-1.5 focus:border-cyan-400 focus:outline-none text-center" 
                          />
                        </div>
                        <div className="col-span-1 text-center font-black font-rajdhani text-xl tracking-wider text-cyan-400">
                          {team.totalPoints}
                        </div>
                        <div className="col-span-1 flex justify-center gap-1">
                          {branding.championRushEnabled && team.totalPoints >= (branding.championRushThreshold ?? 80) && (
                            <button 
                              onClick={() => {
                                setTeams(prev => prev.map(t => t.id === team.id ? { ...t, isChampion: !t.isChampion } : t));
                              }}
                              className={`p-2 rounded transition-colors ${team.isChampion ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-amber-500/20 text-cyan-400 hover:text-amber-400'}`}
                              title="Mark as Champion"
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm('Remove team?')) {
                                setTeams(prev => prev.filter(t => t.id !== team.id));
                              }
                            }}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                   ))}
                 </div>
               </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-cyan-500/20 bg-gradient-to-t from-black/40 to-transparent flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button 
                onClick={() => {
                  const newTeam: TeamScore = {
                    id: Date.now().toString(),
                    name: `TEAM ${teams.length + 1}`,
                    matchesPlayed: 0,
                    booyahs: 0,
                    placementPoints: 0,
                    killPoints: 0,
                    totalPoints: 0,
                  };
                  setTeams([...teams, newTeam]);
                }}
                className="w-full sm:w-auto justify-center px-6 py-2 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 rounded font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
              
              <div className="flex w-full sm:w-auto gap-3 sm:gap-4 flex-col sm:flex-row">
                <button 
                  onClick={() => {
                    const sorted = [...teams].sort((a,b) => b.totalPoints - a.totalPoints || b.placementPoints - a.placementPoints || b.booyahs - a.booyahs);
                    setTeams(sorted);
                  }}
                  className="w-full sm:w-auto px-6 py-2 bg-[#0f1d40] text-cyan-400 hover:bg-cyan-900 border border-cyan-500/40 rounded font-bold uppercase tracking-wider text-sm transition-colors"
                >
                  Sort Table
                </button>
                <button 
                  onClick={() => setIsManagerOpen(false)}
                  className="w-full sm:w-auto px-8 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-bold uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT FALLBACK MODAL FOR MOBILE */}
      {exportedImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setExportedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="bg-[#0b132b] border border-cyan-500/30 p-4 rounded-xl max-w-sm w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
              <Download className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-oswald font-bold text-white mb-2 uppercase tracking-wider">Image Ready!</h3>
            <p className="text-cyan-400/80 mb-6 text-sm font-medium">
              Press and hold the image below to save it to your Photos.
            </p>
            
            <div className="w-full max-h-[50vh] overflow-hidden rounded-lg border border-cyan-500/50 relative shadow-[0_0_30px_rgba(0,204,255,0.2)]">
              <img src={exportedImage} className="w-full h-auto object-contain" alt="Exported Points Table" />
            </div>
            
            <button 
              onClick={() => setExportedImage(null)}
              className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold tracking-wider uppercase transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}


      

    </div>
  );
}

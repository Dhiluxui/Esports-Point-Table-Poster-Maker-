import React, { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
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
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [matchImage, setMatchImage] = useState<string | null>(null);
  const [branding, setBranding] = useState<Branding>({
    backgroundImage: 'https://i.ibb.co/jtBpNKy/ff3296e8-d09a-4995-841a-c67ae36fc17d.jpg',
    tournamentLogo: 'https://i.ibb.co/Q7wZKMNy/edited-photo.png',
    topLeftLogo: 'https://i.ibb.co/LzVwR5w6/i-need-only-logo-now-202606011213-removebg-preview.png',
    topRightLogo: 'https://i.ibb.co/6cdfW7yW/Whats-App-Image-2026-05-04-at-5-47-10-PM-1-removebg-preview.png',
    instagramHandle: '@magadh_striker',
    youtubeHandle: 'Magadh Striker',
    discordHandle: 'Magadh Striker',
    tagline: 'TURNING UNDERDOG TO CHAMPIONSHIP',
    organizationName: 'ORGANIZED BY :- MAGADH STRIKER',
    title: 'OVERALL\nSTANDINGS',
    subtitle: 'DAY 01 | SEMIFINAL G1',
    stageName: '',
    footerText: 'MAGADH STRIKER 2026',
    sponsorLogo: 'https://i.ibb.co/LLBfHtC/IMG-3269-2.png',
    collegeLogo: 'https://i.ibb.co/3m3JZCY0/edited-photo-1.png',
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

  const posterRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (!id) return;
    const fetchPhases = async () => {
      try {
        const q = query(collection(db, `tournaments/${id}/phases`), orderBy('phaseNumber', 'asc'));
        const querySnapshot = await getDocs(q);
        const data: Phase[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Phase);
        });
        setPhases(data);
      } catch (error) {
        console.error("Error fetching phases: ", error);
      }
    };
    fetchPhases();
  }, [id]);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const padding = window.innerWidth >= 1024 ? 64 : 32;
        const containerWidth = previewContainerRef.current.clientWidth - padding;
        const containerHeight = previewContainerRef.current.clientHeight - padding;
        
        const scaleByWidth = containerWidth / 800;
        const scaleByHeight = containerHeight / 1100;
        
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
      const dataUrl = await htmlToImage.toPng(posterRef.current, {
        pixelRatio: 2, // High quality export but safe for mobile memory limits
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      // Convert base64 Data URL to Blob for better mobile browser support
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `FF_Points_Table_${new Date().getTime()}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Failed to export poster', err);
      alert('Failed to export poster. Please try again.');
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
      <header className="border-b border-white/5 bg-[#0b132b]/80 backdrop-blur-md px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded bg-[#0a142f] flex items-center justify-center text-cyan-500 hover:text-white hover:bg-cyan-600 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-teko text-2xl md:text-3xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold uppercase tracking-wider">
              FF Max Point Table
            </h1>
            <p className="text-[10px] md:text-xs text-cyan-200/60 font-medium uppercase tracking-widest mt-0.5">Esports Calculator & Generator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsManagerOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-6 py-2.5 bg-[#0a142f] hover:bg-[#0f1d40] border border-cyan-500/30 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-colors text-cyan-400 text-center"
          >
            <Settings className="w-4 h-4" />
            Manage Teams Data
          </button>
          
          <button
            onClick={exportPoster}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none text-center"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export HD Poster'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-130px)] md:h-[calc(100vh-73px)] lg:overflow-hidden">
        
        {/* LEFT PANEL: CONTROLS */}
        <div className={`w-full lg:w-[450px] flex-shrink-0 border-r-0 lg:border-r border-cyan-900/30 bg-[#070f22] lg:overflow-y-auto hidden-scrollbar ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'} flex-col pb-20 lg:pb-0`}>
          
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
                        {branding.backgroundImage === 'https://i.ibb.co/jtBpNKy/ff3296e8-d09a-4995-841a-c67ae36fc17d.jpg' ? 'Replace Default BG' : 'Change Background'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} />
                    </label>
                    {branding.backgroundImage && branding.backgroundImage !== 'https://i.ibb.co/jtBpNKy/ff3296e8-d09a-4995-841a-c67ae36fc17d.jpg' && (
                      <button onClick={() => setBranding(p => ({...p, backgroundImage: 'https://i.ibb.co/jtBpNKy/ff3296e8-d09a-4995-841a-c67ae36fc17d.jpg'}))} className="mt-2 text-[10px] text-red-400 hover:text-red-300 uppercase font-semibold flex items-center justify-center w-full bg-red-950/20 py-1.5 rounded">Remove Custom Background</button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Center Shield</label>
                      <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        <img src={branding.tournamentLogo || "https://i.ibb.co/Q7wZKMNy/edited-photo.png"} alt="Center" className="h-6 object-contain opacity-70 hover:opacity-100 transition-all" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'tournament')} />
                      </label>
                      {branding.tournamentLogo && branding.tournamentLogo !== 'https://i.ibb.co/Q7wZKMNy/edited-photo.png' && (
                        <button onClick={() => setBranding(p => ({...p, tournamentLogo: 'https://i.ibb.co/Q7wZKMNy/edited-photo.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Top Left</label>
                      <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.topLeftLogo ? <img src={branding.topLeftLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'topLeft')} />
                      </label>
                      {branding.topLeftLogo && branding.topLeftLogo !== 'https://i.ibb.co/LzVwR5w6/i-need-only-logo-now-202606011213-removebg-preview.png' && (
                        <button onClick={() => setBranding(p => ({...p, topLeftLogo: 'https://i.ibb.co/LzVwR5w6/i-need-only-logo-now-202606011213-removebg-preview.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">Top Right</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.topRightLogo ? <img src={branding.topRightLogo} className="h-6 object-contain grayscale blend-screen opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'topRight')} />
                      </label>
                      {branding.topRightLogo && branding.topRightLogo !== 'https://i.ibb.co/6cdfW7yW/Whats-App-Image-2026-05-04-at-5-47-10-PM-1-removebg-preview.png' && (
                        <button onClick={() => setBranding(p => ({...p, topRightLogo: 'https://i.ibb.co/6cdfW7yW/Whats-App-Image-2026-05-04-at-5-47-10-PM-1-removebg-preview.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
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
                      {branding.sponsorLogo && branding.sponsorLogo !== 'https://i.ibb.co/LLBfHtC/IMG-3269-2.png' && (
                        <button onClick={() => setBranding(p => ({...p, sponsorLogo: 'https://i.ibb.co/LLBfHtC/IMG-3269-2.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">Reset</button>
                      )}
                    </div>
                    <div className="bg-[#0a142f] p-2 rounded-lg border border-cyan-500/10 flex flex-col">
                      <label className="block text-[9px] font-semibold text-cyan-400/70 uppercase tracking-widest mb-2 text-center">College</label>
                       <label className="flex-1 flex justify-center items-center p-2 border border-dashed border-cyan-500/20 rounded hover:bg-[#0f1d40] cursor-pointer bg-[#050b1a]/50">
                        {branding.collegeLogo ? <img src={branding.collegeLogo} className="h-6 object-contain opacity-70 hover:opacity-100 transition-all" /> : <Shield className="h-6 w-6 text-cyan-800 hover:text-cyan-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'college')} />
                      </label>
                      {branding.collegeLogo && (
                        <button onClick={() => setBranding(p => ({...p, collegeLogo: branding.collegeLogo === 'https://i.ibb.co/3m3JZCY0/edited-photo-1.png' ? null : 'https://i.ibb.co/3m3JZCY0/edited-photo-1.png'}))} className="mt-2 w-full text-[9px] text-red-400 hover:text-red-300 uppercase font-bold text-center">
                          {branding.collegeLogo === 'https://i.ibb.co/3m3JZCY0/edited-photo-1.png' ? 'Remove' : 'Reset'}
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

        {/* RIGHT PANEL: POSTER PREVIEW */}
        <div ref={previewContainerRef} className={`flex-1 bg-[#010815] p-2 lg:p-4 overflow-auto items-center justify-start lg:justify-center relative pb-24 lg:pb-0 ${mobileTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`} style={{ backgroundImage: 'radial-gradient(circle at center, #021a30 0%, #010815 100%)' }}>
          
          {/* THE SCALED CANVAS WRAPPER */}
          <div style={{ width: 800 * previewScale, height: 1100 * previewScale }} className="relative flex-shrink-0 transition-transform duration-200">
            <div 
              style={{ transform: `scale(${previewScale})` }}
              className="origin-top-left absolute top-0 left-0"
            >
              <div 
                ref={posterRef}
                className="relative w-[800px] h-[1100px] bg-gradient-to-br from-[#060e22] via-[#091535] to-[#040b1c] overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col mx-auto"
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
              <div className="relative z-10 flex flex-col h-full mt-4">
                
                {/* 1. Tagline */}
                {branding.tagline ? (
                  <div className="flex justify-center items-center mb-6 mt-2 w-full px-12">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--theme-primary)]/50"></div>
                    <div className="bg-gradient-to-b from-[var(--theme-bg-accent)] to-[#050b1a] border border-[var(--theme-accent)]/30 rounded-sm px-8 py-1.5 shadow-[0_0_20px_color-mix(in_srgb,var(--theme-accent)_20%,transparent),inset_0_0_10px_color-mix(in_srgb,var(--theme-accent)_10%,transparent)] relative overflow-hidden flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[var(--theme-accent)] rotate-45 shadow-[0_0_8px_var(--theme-accent)]"></div>
                      <span className="font-rajdhani text-[17px] font-bold tracking-[0.25em] text-white drop-shadow-[0_0_8px_color-mix(in_srgb,var(--theme-accent)_80%,transparent)] relative z-10 uppercase">
                        {branding.tagline}
                      </span>
                      <div className="w-1.5 h-1.5 bg-[var(--theme-accent)] rotate-45 shadow-[0_0_8px_var(--theme-accent)]"></div>
                    </div>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--theme-primary)]/50"></div>
                  </div>
                ) : (
                  <div className="h-[35px] mb-6 mt-2"></div>
                )}

                {/* 2. Top Header (30/70 Split) */}
                <div className="relative z-10 w-[88%] mx-auto flex items-center mb-10 overflow-visible">
                   {/* 30% Width for Logo */}
                   <div className="w-[30%] flex justify-center items-center relative h-[155px]">
                       {branding.tournamentLogo ? (
                         <img src={branding.tournamentLogo} className="h-[95%] w-[95%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] relative z-20 scale-125" alt="Tournament Logo" />
                       ) : (
                         <div className="w-[130px] h-[155px] bg-gradient-to-b from-[var(--theme-bg-accent)]/90 to-[#040b1c] rounded-b-[50px] rounded-t-[16px] border-[3px] border-[var(--theme-primary)]/50 border-t-[var(--theme-accent)]/30 flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_4px_15px_color-mix(in_srgb,var(--theme-accent)_20%,transparent)] relative overflow-hidden z-20">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--theme-accent)]/20 via-transparent to-transparent"></div>
                            <Shield className="w-16 h-16 text-[var(--theme-accent)] relative z-10 drop-shadow-[0_0_15px_color-mix(in_srgb,var(--theme-accent)_50%,transparent)]" />
                         </div>
                       )}
                   </div>

                    {/* Divider & 70% Width for Title */}
                   <div className="w-[70%] flex flex-col justify-center border-l-[4px] border-[var(--theme-accent)] pl-6 ml-8 relative before:absolute before:inset-y-0 before:-left-[4px] before:w-[4px] before:shadow-[0_0_15px_color-mix(in_srgb,var(--theme-accent)_90%,transparent)]">
                     {branding.organizationName && (
                        <div className="text-[15px] font-rajdhani font-bold text-[var(--theme-accent)] uppercase tracking-[0.35em] mb-1 drop-shadow-[0_0_8px_color-mix(in_srgb,var(--theme-accent)_50%,transparent)]">
                          {branding.organizationName}
                        </div>
                     )}
                      <h1 className="font-oswald uppercase flex flex-col mb-4">
                        {branding.title?.split('\n').map((line, i) => (
                          <div 
                            key={i} 
                            className={`block leading-[0.9] ${
                              i === 0 
                                ? 'text-[65px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#cbd5e1] drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)] tracking-wide' 
                                : 'text-[72px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--theme-accent)] to-[var(--theme-primary)] drop-shadow-[0_4px_15px_color-mix(in_srgb,var(--theme-primary)_60%,transparent)] tracking-wider -mt-2'
                            }`}
                            style={{ WebkitTextStroke: i === 0 ? '1px rgba(255,255,255,0.2)' : '2px rgba(0,30,150,0.3)' }}
                          >
                            {line}
                          </div>
                        ))}
                      </h1>
                      <div className="flex flex-wrap items-stretch self-start gap-3 relative mt-1">
                        {branding.stageName && (
                          <div className="text-white font-oswald font-black text-[20px] tracking-wider flex items-center bg-[var(--theme-primary)] px-6 py-1 skew-x-[-12deg] shadow-[5px_0_15px_rgba(0,0,0,0.3)] z-10 border border-[var(--theme-accent)]/30">
                            <span className="relative z-10 drop-shadow-md skew-x-[12deg]">{branding.stageName}</span>
                          </div>
                        )}
                        {branding.subtitle && (
                          <div className="text-white font-rajdhani font-bold text-[17px] tracking-[0.1em] flex items-center px-6 py-1 bg-white/10 skew-x-[-12deg] shadow-[5px_0_15px_rgba(0,0,0,0.3)] border border-white/20">
                             {branding.subtitle?.split('|').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                  <span className="relative z-10 drop-shadow-sm skew-x-[12deg]">{part.trim()}</span>
                                  {i < arr.length - 1 && <span className="mx-3 text-[var(--theme-accent)]/60 font-black relative z-10 skew-x-[12deg]">|</span>}
                                </React.Fragment>
                             ))}
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                {/* --- Phase Details Strip --- */}
                {branding.phaseDetails?.enabled && (
                  <div className="relative z-20 w-[86%] mx-auto flex flex-wrap items-center justify-between bg-black/70 backdrop-blur-md border-l-4 border-l-[var(--theme-accent)] border-y border-r border-[var(--theme-accent)]/20 text-white font-rajdhani font-bold tracking-widest px-4 py-1.5 mb-2 rounded-r-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[14px]">
                      {branding.phaseDetails.groupCount && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--theme-accent)] text-[12px]">NO OF GROUP :</span>
                          <span className="text-[16px] drop-shadow-md">{branding.phaseDetails.groupCount}</span>
                        </div>
                      )}
                      {branding.phaseDetails.matchCount && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--theme-accent)] text-[12px]">MATCHES :</span>
                          <span className="text-[16px] drop-shadow-md text-yellow-400">{branding.phaseDetails.matchCount}</span>
                        </div>
                      )}
                      {branding.phaseDetails.extraInfo && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--theme-accent)] text-[12px]">NEXT :</span>
                          <span className="text-[15px] text-white/90">{branding.phaseDetails.extraInfo}</span>
                        </div>
                      )}
                    </div>
                    {branding.phaseDetails.qualificationInfo && (
                      <div className="text-[13px] text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-sm border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                         <Target className="w-3.5 h-3.5" />
                         {branding.phaseDetails.qualificationInfo}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Main Data Table */}
                <div className="relative z-20 w-[86%] mx-auto flex flex-col bg-transparent">
                             {/* Table Header */}
                  <div className="h-[38px] bg-[var(--theme-primary)] text-white flex items-center px-4 rounded-t-sm shadow-[0_5px_15px_rgba(0,0,0,0.4)] mb-[3px] border-b-[3px] border-[var(--theme-accent)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-full w-[30%] bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                    <div className="flex-1 flex px-2 font-rajdhani font-bold text-[14px] tracking-wider uppercase items-center relative z-10">
                       {hasStatusColumn && <div className="w-[5%] shrink-0"></div>} {/* Q/E */}
                       <div className="w-[8%] shrink-0 text-center drop-shadow-md">RANK</div> {/* Rank */}
                       <div style={{ width: `${100 - 8 - 8 - 14 - 8 - 12 - (hasStatusColumn ? 5 : 0) - (branding.showMatches !== false ? 8 : 0)}%` }} className="pl-4 drop-shadow-md shrink-0">TEAM</div> {/* Name Area */}
                       
                       {branding.showMatches !== false && <div className="w-[8%] shrink-0 text-center drop-shadow-md text-[13px] text-white/90">Mtchs</div>}
                       <div className="w-[8%] shrink-0 text-center drop-shadow-md text-[13px] text-white/90">Booyah</div>
                       <div className="w-[14%] shrink-0 text-center drop-shadow-md text-[13px] text-[var(--theme-accent)]">Place Pts</div>
                       <div className="w-[8%] shrink-0 text-center drop-shadow-md text-[13px] text-white">Elims</div>
                       <div className="w-[12%] shrink-0 text-center drop-shadow-md text-[14px]">Total</div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col gap-[3px]">
                     {teams.slice(0, 12).map((team, index) => {
                        const isRank1 = index === 0;
                        const isQualified = index < (branding.qualificationThreshold ?? 9);
                        const isChampionRush = branding.championRushEnabled && !team.isChampion && team.totalPoints >= (branding.championRushThreshold ?? 80);
                        
                        let bgColor = '';
                        if (index === 0) {
                          bgColor = isChampionRush ? 'bg-gradient-to-r from-[#ff8800] via-[#cc5500] to-[#0a142f] shadow-[0_10px_25px_rgba(255,136,0,0.4)] z-20 relative [clip-path:polygon(0_0,100%_0,97%_100%,0_100%)] border-l-[3px] border-l-white' : 'bg-gradient-to-r from-[#ffffff] via-[color-mix(in_srgb,var(--theme-accent)_15%,#fff)] to-[color-mix(in_srgb,var(--theme-accent)_30%,#fff)] shadow-[0_10px_25px_color-mix(in_srgb,var(--theme-primary)_40%,transparent)] z-20 relative [clip-path:polygon(0_0,100%_0,97%_100%,0_100%)] border-l-[3px] border-l-[var(--theme-accent)]';
                        } else if (index === 1) {
                          bgColor = isChampionRush ? 'bg-gradient-to-r from-[#4a2800] via-[#112d59] to-[#0d2145] shadow-[inset_4px_0_0_0_rgba(255,136,0,0.6),0_4px_15px_rgba(0,0,0,0.4)] z-10 relative' : 'bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_80%,var(--theme-primary))] to-[var(--theme-primary)] shadow-[0_4px_15px_color-mix(in_srgb,var(--theme-accent)_30%,transparent)] z-10 relative border-l-[3px] border-l-white/70';
                        } else if (index === 2) {
                          bgColor = isChampionRush ? 'bg-gradient-to-r from-[#4a2800] via-[#0a1e42] to-[#081836] shadow-[inset_4px_0_0_0_rgba(255,136,0,0.6),0_4px_15px_rgba(0,0,0,0.3)] z-10 relative' : 'bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary)] to-[color-mix(in_srgb,var(--theme-primary)_70%,#000)] shadow-[0_4px_15px_rgba(0,119,204,0.3)] z-10 relative border-l-[3px] border-l-white/50';
                        } else if (isChampionRush) {
                          bgColor = 'bg-gradient-to-r from-[#4a2800] via-[var(--theme-bg-accent)] to-[#0a142f] shadow-[inset_4px_0_0_0_rgba(255,136,0,0.6)] z-10 relative';
                        } else {
                          bgColor = index % 2 === 0 ? 'bg-[#0b1633] border-l-[2px] border-[var(--theme-accent)]/30' : 'bg-[#060d21] border-l-[2px] border-transparent';
                        }
                        
                        const textColor = index === 0 && !isChampionRush ? 'text-[#0a142f]' : 'text-white';
                        const secTextColor = index === 0 && !isChampionRush ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-accent)]';
                        
                        const rowClass = `h-[40px] flex items-center px-4 ${bgColor} ${textColor} rounded-sm shadow-sm relative overflow-hidden transition-all duration-300`;

                        return (
                          <div key={team.id} className={rowClass} style={isRank1 ? { filter: 'drop-shadow(0px 8px 15px rgba(0,0,0,0.7))' } : {}}>
                            {index < 3 && (
                              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                                 {/* Abstract geometric shapes for Top 3 */}
                                 <svg className="absolute top-0 right-0 h-full w-[60%]" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points="30,0 100,0 100,100 10,100" fill={isRank1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'} />
                                    <polygon points="50,0 100,0 100,100 30,100" fill={isRank1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'} />
                                    <polygon points="70,0 100,0 100,100 50,100" fill={isRank1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'} />
                                 </svg>
                              </div>
                            )}
                            <div className="flex-1 flex items-center px-2 h-full w-full relative z-10">
                              
                              {/* Q/E Indicator or Champion Rush */}
                              {hasStatusColumn && (
                                <div className="w-[5%] shrink-0 flex justify-center items-center">
                                  {isShowQualification ? (
                                    <div className={`w-[22px] h-[22px] rounded flex items-center justify-center text-[11px] font-bold ${isQualified ? 'bg-[#10b981] text-white shadow-sm' : 'bg-[#ef4444] text-white shadow-sm'}`}>
                                      {isQualified ? 'Q' : 'E'}
                                    </div>
                                  ) : (branding.championRushEnabled && team.totalPoints >= (branding.championRushThreshold ?? 80)) ? (
                                    <div className="flex items-center justify-center filter drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">
                                      <svg className="w-[28px] h-[28px]" viewBox="0 0 24 24" fill="none" stroke="#ffc800" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="matrix(-1, 0, 0, 1, 0, 0) rotate(45)">
                                        <path d="M6.3375 19C5.815 19 5.33219 18.7141 5.07094 18.25C4.80969 17.7859 4.80969 17.2141 5.07094 16.75C5.33219 16.2859 5.815 16 6.3375 16H17.0625C17.8702 16 18.525 16.6716 18.525 17.5C18.525 18.3284 17.8702 19 17.0625 19H6.3375Z" />
                                        <path d="M4.875 8C6.10837 10.228 8.83837 13.569 11.7 8C14.5616 13.569 17.2916 10.228 18.525 8L17.16 16H6.24L4.875 8Z" />
                                        <path d="M11.7 8C10.8923 8 10.2375 7.32843 10.2375 6.5C10.2375 5.67157 10.8923 5 11.7 5C12.5078 5 13.1625 5.67157 13.1625 6.5C13.1625 6.89782 13.0085 7.27936 12.7342 7.56066C12.4599 7.84196 12.0879 8 11.7 8Z" />
                                        <path d="M18.525 8C17.9866 8 17.55 7.55228 17.55 7C17.55 6.44772 17.9866 6 18.525 6C19.0635 6 19.5 6.44772 19.5 7C19.5 7.26522 19.3973 7.51957 19.2145 7.70711C19.0316 7.89464 18.7836 8 18.525 8Z" />
                                        <path d="M4.87502 8C4.33655 8 3.90002 7.55228 3.90002 7C3.90002 6.44772 4.33655 6 4.87502 6C5.4135 6 5.85002 6.44772 5.85002 7C5.85002 7.26522 5.7473 7.51957 5.56445 7.70711C5.38161 7.89464 5.13361 8 4.87502 8Z" />
                                      </svg>
                                    </div>
                                  ) : null}
                                </div>
                              )}

                              {/* Rank Number */}
                              <div className={`w-[8%] shrink-0 flex justify-center items-center font-oswald text-[20px] pb-0.5 ${isRank1 ? 'font-black drop-shadow-sm' : 'font-normal opacity-90'}`}>
                                {branding.championRushEnabled && team.isChampion ? (
                                  <Crown className={`w-5 h-5 ${isRank1 ? 'text-amber-600 drop-shadow-md' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`} />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              {/* Team Name */}
                              <div style={{ width: `${100 - 8 - 8 - 14 - 8 - 12 - (hasStatusColumn ? 5 : 0) - (branding.showMatches !== false ? 8 : 0)}%` }} className={`${branding.showTeamLogos !== false ? 'pl-1' : 'pl-4'} shrink-0 flex items-center gap-2 font-oswald text-[20px] ${isRank1 ? 'font-bold' : 'font-medium'} tracking-wide uppercase truncate drop-shadow-sm overflow-visible`}>
                                {(branding.showTeamLogos !== false) && (
                                  <label className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all ${isRank1 ? 'bg-black/10' : 'bg-black/20'}`}>
                                     {team.logo ? <img src={team.logo} className="w-full h-full object-contain" /> : <Shield className={`w-5 h-5 ${isRank1 ? 'text-white/80' : 'text-[var(--theme-accent)]/50'}`} />}
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
                                         e.target.value = '';
                                       }}
                                     />
                                  </label>
                                )}
                                <span className="truncate">{team.name}</span>
                                {branding.championRushEnabled && team.isChampion && (
                                   <div className={`ml-1 flex-shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 border ${isRank1 ? 'bg-amber-500/20 text-amber-700 border-amber-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'}`}>
                                      <Crown className="w-3 h-3" /> CHAMPION
                                   </div>
                                )}
                              </div>

                               {/* Stats */}
                               {branding.showMatches !== false && <div className={`w-[8%] shrink-0 text-center font-rajdhani text-[20px] font-semibold ${isRank1 ? 'text-[var(--theme-primary)]' : 'text-white/80'}`}>{team.matchesPlayed}</div>}
                              <div className={`w-[8%] shrink-0 text-center font-rajdhani text-[20px] font-semibold ${isRank1 ? 'text-[var(--theme-primary)]' : 'text-white/90'}`}>{team.booyahs}</div>
                              <div className={`w-[14%] shrink-0 text-center font-rajdhani text-[19px] font-bold ${isRank1 ? 'text-[#0a142f]' : index < 3 ? 'text-white drop-shadow-sm' : 'text-[var(--theme-accent)]'}`}>{team.placementPoints}</div>
                              <div className={`w-[8%] shrink-0 text-center font-rajdhani text-[19px] font-bold ${isRank1 ? 'text-[var(--theme-primary)]' : 'text-white'}`}>{team.killPoints}</div>
                              <div className={`w-[12%] shrink-0 text-center font-rajdhani text-[24px] font-black pb-0.5 ${isRank1 ? 'drop-shadow-md text-[#0a142f]' : 'drop-shadow-md text-white'}`}>
                                {team.totalPoints}
                              </div>
                            </div>
                          </div>
                        )
                     })}
                  </div>

                </div>
                
                <div className="flex-1 flex flex-col justify-end px-10 pb-6">
                  {/* Venue Row */}
                  <div className="flex items-center justify-center gap-3 w-full mb-4">
                    <span className="text-white font-rajdhani font-bold text-[26px] tracking-wide drop-shadow-md">Venue -</span>
                    <div className="w-[80px] min-h-[50px] flex items-center justify-center">
                       {branding.collegeLogo ? (
                         <img src={branding.collegeLogo} className="h-10 w-auto object-contain" alt="Venue" />
                       ) : (
                         <span className="text-white/60 font-bold text-[12px] uppercase border border-dashed border-white/30 px-4 py-2 rounded">Upload Logo</span>
                       )}
                    </div>
                  </div>

                  {/* Socials & Sponsor Row */}
                  <div className="w-[98%] mx-auto drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] mt-2">
                    <div 
                      className="bg-gradient-to-r from-[#030816] via-[#091b40] to-[#030816] py-5 px-6 flex justify-around items-center"
                      style={{ clipPath: 'polygon(25px 0, 20% 0, 21% 10px, 26% 10px, 27% 0, 80% 0, 81% 12px, 100% 12px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 60% 100%, 59% calc(100% - 10px), 51% calc(100% - 10px), 50% 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)' }}
                    >
                      {/* YouTube */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[var(--theme-accent)] to-[color-mix(in_srgb,var(--theme-accent)_80%,var(--theme-primary))] flex items-center justify-center shrink-0 shadow-inner">
                          <svg className="w-6 h-6 text-[#040b1c]" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" /></svg>
                        </div>
                        <div className="flex flex-col font-rajdhani">
                          <span className="text-white font-bold text-[18px] leading-tight drop-shadow-md">Youtube</span>
                          <span className="text-white font-medium text-[15px] leading-tight">{branding.youtubeHandle}</span>
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[var(--theme-accent)] to-[color-mix(in_srgb,var(--theme-accent)_80%,var(--theme-primary))] flex items-center justify-center shrink-0 shadow-inner">
                           <svg className="w-6 h-6 text-[#040b1c]" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2.163c3.204,0,3.584,0.012,4.85,0.07c1.366,0.062,2.633,0.342,3.608,1.317c0.975,0.975,1.255,2.242,1.317,3.608 c0.058,1.266,0.07,1.646,0.07,4.85s-0.012,3.584-0.07,4.85c-0.062,1.366-0.342,2.633-1.317,3.608 c-0.975,0.975-2.242,1.255-3.608,1.317c-1.266,0.058-1.646,0.07-4.85,0.07s-3.584-0.012-4.85-0.07 c-1.366-0.062-2.633-0.342-3.608-1.317c-0.975-0.975-1.255-2.242-1.317-3.608c-0.058-1.266-0.07-1.646-0.07-4.85 s0.012-3.584,0.07-4.85c0.062-1.366,0.342-2.633,1.317-3.608c0.975-0.975,2.242-1.255,3.608-1.317 C8.416,2.175,8.796,2.163,12,2.163 M12,0C8.741,0,8.333,0.014,7.053,0.072C5.775,0.13,4.902,0.333,4.14,0.63 c-0.789,0.306-1.459,0.717-2.126,1.384C1.347,2.681,0.935,3.351,0.63,4.14C0.333,4.902,0.13,5.775,0.072,7.053 C0.014,8.333,0,8.741,0,12s0.014,3.667,0.072,4.947c0.058,1.278,0.261,2.151,0.558,2.913c0.306,0.789,0.717,1.459,1.384,2.126 c0.667,0.666,1.336,1.079,2.126,1.384c0.762,0.297,1.635,0.5,2.913,0.558C8.333,23.986,8.741,24,12,24s3.667-0.014,4.947-0.072 c1.278-0.058,2.151-0.261,2.913-0.558c0.789-0.306,1.459-0.717,2.126-1.384c0.666-0.667,1.079-1.336,1.384-2.126 c0.297-0.762,0.5-1.635,0.558-2.913C23.986,15.667,24,15.259,24,12s-0.014-3.667-0.072-4.947c-0.058-1.278-0.261-2.151-0.558-2.913 c-0.306-0.789-0.717-1.459-1.384-2.126C21.319,1.347,20.651,0.935,19.86,0.63c-0.762-0.297-1.635-0.5-2.913-0.558 C15.667,0.014,15.259,0,12,0L12,0z M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162 c3.403,0,6.162-2.759,6.162-6.162C18.162,8.597,15.403,5.838,12,5.838L12,5.838z M12,16.035c-2.228,0-4.035-1.807-4.035-4.035 c0-2.228,1.807-4.035,4.035-4.035c2.228,0,4.035,1.807,4.035,4.035C16.035,14.228,14.228,16.035,12,16.035L12,16.035z M18.406,4.155 c-0.796,0-1.44,0.645-1.44,1.44c0,0.795,0.644,1.439,1.44,1.439c0.795,0,1.439-0.644,1.439-1.439 C19.845,4.8,19.201,4.155,18.406,4.155L18.406,4.155z" /></svg>
                        </div>
                        <div className="flex flex-col font-rajdhani">
                          <span className="text-white font-bold text-[18px] leading-tight drop-shadow-md">Instagram</span>
                          <span className="text-white font-medium text-[15px] leading-tight">{branding.instagramHandle}</span>
                        </div>
                      </div>

                      {/* Sponsor */}
                      {branding.sponsorLogo && (
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer relative group">
                            <img src={branding.sponsorLogo} className="w-12 h-12 rounded-full object-cover bg-black/50 shadow-inner border border-white/20 group-hover:opacity-80 transition-opacity" alt="Sponsor" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sponsor')} />
                          </label>
                          <div className="flex flex-col font-rajdhani">
                            <span className="text-white font-bold text-[18px] leading-tight drop-shadow-md">Sponsored by</span>
                            <span className="text-white font-medium text-[15px] leading-tight">{branding.sponsorName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          <p className="text-center text-xs text-cyan-600 font-medium uppercase tracking-widest mt-4 pb-16 lg:pb-0">Live Preview (Aspect Ratio 4:5 - Ideal for Instagram & WhatsApp)</p>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070f22] border-t border-cyan-900/50 flex">
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
    </div>
  );
}

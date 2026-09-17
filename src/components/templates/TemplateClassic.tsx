import React from 'react';
import { Target, Crown, Shield } from 'lucide-react';
import { Branding, TeamScore } from '../../types';

interface Props {
  branding: Branding;
  teams: TeamScore[];
}

export function TemplateClassic({ branding, teams }: Props) {
  const isShowQualification = branding.showQualification !== false && !branding.championRushEnabled;
  const hasStatusColumn = isShowQualification || branding.championRushEnabled;

  return (
    <>
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
                  <div className="flex justify-center items-center mb-3 mt-2 w-full px-12">
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
                  <div className="h-[35px] mb-3 mt-2"></div>
                )}

                {/* 2. Top Header (30/70 Split) */}
                <div className="relative z-10 w-[88%] mx-auto flex items-center mb-4 overflow-visible">
                   {/* 30% Width for Logo */}
                   <div className="w-[30%] flex justify-center items-center relative h-[135px]">
                       {branding.tournamentLogo ? (
                         <img src={branding.tournamentLogo} className="h-[95%] w-[95%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] relative z-20 scale-125" alt="Tournament Logo" />
                       ) : (
                         <div className="w-[130px] h-[135px] bg-gradient-to-b from-[var(--theme-bg-accent)]/90 to-[#040b1c] rounded-b-[50px] rounded-t-[16px] border-[3px] border-[var(--theme-primary)]/50 border-t-[var(--theme-accent)]/30 flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_4px_15px_color-mix(in_srgb,var(--theme-accent)_20%,transparent)] relative overflow-hidden z-20">
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
                                ? 'text-[62px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#cbd5e1] drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)] tracking-wide' 
                                : 'text-[68px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--theme-accent)] to-[var(--theme-primary)] drop-shadow-[0_4px_15px_color-mix(in_srgb,var(--theme-primary)_60%,transparent)] tracking-wider -mt-2'
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
                  <div className="relative z-20 w-[86%] mx-auto flex flex-wrap items-center justify-between bg-black/70 backdrop-blur-md border-l-4 border-l-[var(--theme-accent)] border-y border-r border-[var(--theme-accent)]/20 text-white font-rajdhani font-bold tracking-widest px-4 py-1.5 mb-1.5 rounded-r-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
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
                  <div className="h-[34px] bg-[var(--theme-primary)] text-white flex items-center px-4 rounded-t-sm shadow-[0_5px_15px_rgba(0,0,0,0.4)] mb-[3px] border-b-[3px] border-[var(--theme-accent)] relative overflow-hidden">
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
                  <div className="flex flex-col gap-[2px]">
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
                        
                        const rowClass = `h-[37px] flex items-center px-4 ${bgColor} ${textColor} rounded-sm shadow-sm relative overflow-hidden transition-all duration-300`;

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
                               {branding.showMatches !== false && <div className={`w-[8%] shrink-0 text-center font-rajdhani text-[18px] font-semibold ${isRank1 ? 'text-[var(--theme-primary)]' : 'text-white/80'}`}>{team.matchesPlayed}</div>}
                              <div className={`w-[8%] shrink-0 text-center font-rajdhani text-[18px] font-semibold ${isRank1 ? 'text-[var(--theme-primary)]' : 'text-white/90'}`}>{team.booyahs}</div>
                              <div className={`w-[14%] shrink-0 text-center font-rajdhani text-[17px] font-bold ${isRank1 ? 'text-[#0a142f]' : index < 3 ? 'text-white drop-shadow-sm' : 'text-[var(--theme-accent)]'}`}>{team.placementPoints}</div>
                              <div className={`w-[8%] shrink-0 text-center font-rajdhani text-[17px] font-bold ${isRank1 ? 'text-[var(--theme-primary)]' : 'text-white'}`}>{team.killPoints}</div>
                              <div className={`w-[12%] shrink-0 text-center font-rajdhani text-[22px] font-black pb-0.5 ${isRank1 ? 'drop-shadow-md text-[#0a142f]' : 'drop-shadow-md text-white'}`}>
                                {team.totalPoints}
                              </div>
                            </div>
                          </div>
                        )
                     })}
                  </div>

                </div>
                
                <div className="flex-1 flex flex-col justify-end px-10 pb-4">
                  {/* Venue Row */}
                  <div className="flex items-center justify-center gap-3 w-full mb-2">
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
    </>
  );
}

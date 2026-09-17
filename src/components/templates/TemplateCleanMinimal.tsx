import React from 'react';
import { Target, Crown, Shield } from 'lucide-react';
import { Branding, TeamScore } from '../../types';

interface Props {
  branding: Branding;
  teams: TeamScore[];
}

export function TemplateCleanMinimal({ branding, teams }: Props) {
  const isShowQualification = branding.showQualification !== false && !branding.championRushEnabled;
  const hasStatusColumn = isShowQualification || branding.championRushEnabled;

  return (
    <div className="relative z-10 flex flex-col h-full mt-4">
      {/* 1. Tagline */}
      {branding.tagline ? (
        <div className="flex justify-center items-center mb-4 mt-2 w-full px-12">
          <div className="h-[1px] flex-1 bg-white/20"></div>
          <span className="font-rajdhani text-[15px] font-bold tracking-[0.3em] text-white/70 mx-6 uppercase">
            {branding.tagline}
          </span>
          <div className="h-[1px] flex-1 bg-white/20"></div>
        </div>
      ) : (
        <div className="h-[35px] mb-3 mt-2"></div>
      )}

      {/* 2. Top Header */}
      <div className="relative z-10 w-[88%] mx-auto flex flex-col items-center mb-6 overflow-visible">
        {branding.organizationName && (
          <div className="text-[16px] font-rajdhani font-semibold text-white/60 uppercase tracking-[0.4em] mb-2">
            {branding.organizationName}
          </div>
        )}
        <h1 className="font-oswald uppercase flex flex-col items-center mb-3 text-center" style={{ lineHeight: '1' }}>
          {branding.title?.split('\n').map((line, i) => (
            <div 
              key={i} 
              className="block text-[65px] font-medium text-white tracking-wider"
            >
              {line}
            </div>
          ))}
        </h1>
        {branding.subtitle && (
          <div className="text-white font-rajdhani font-medium text-[16px] tracking-[0.2em] border border-white/20 rounded-full px-8 py-1.5 backdrop-blur-sm">
             {branding.subtitle}
          </div>
        )}
      </div>

      {/* 3. Main Data Table */}
      <div className="relative z-20 w-[90%] mx-auto flex flex-col bg-transparent">
        {/* Table Header */}
        <div className="h-[34px] flex items-center px-4 mb-2 border-b border-white/30">
          <div className="flex-1 flex px-2 font-rajdhani font-medium text-[14px] text-white/50 tracking-widest uppercase items-center relative z-10">
             <div className="w-[8%] shrink-0 text-left pl-2">RANK</div>
             <div style={{ width: `${100 - 8 - 10 - 14 - 10 - 14 - (branding.showMatches !== false ? 8 : 0) - (hasStatusColumn ? 6 : 0)}%` }} className="pl-6 shrink-0 text-left">TEAM</div>
             {hasStatusColumn && <div className="w-[6%] shrink-0 text-center">STS</div>}
             {branding.showMatches !== false && <div className="w-[8%] shrink-0 text-center">MAT</div>}
             <div className="w-[10%] shrink-0 text-center">WWCD</div>
             <div className="w-[14%] shrink-0 text-center">PLACE</div>
             <div className="w-[10%] shrink-0 text-center">KILLS</div>
             <div className="w-[14%] shrink-0 text-right pr-4">PTS</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
           {teams.slice(0, 12).map((team, index) => {
              const isRank1 = index === 0;
              return (
                <div key={team.id} className={`flex h-[42px] w-full items-center text-white border-b border-white/10 ${isRank1 ? 'bg-white/10 backdrop-blur-md' : 'hover:bg-white/5'}`}>
                  <div className="flex-1 flex h-full items-center relative px-2">
                    <div className="w-[8%] shrink-0 flex items-center font-rajdhani text-[18px] font-medium text-white/70 pl-2">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div style={{ width: `${100 - 8 - 10 - 14 - 10 - 14 - (branding.showMatches !== false ? 8 : 0) - (hasStatusColumn ? 6 : 0)}%` }} className={`pl-4 shrink-0 flex items-center gap-3 font-rajdhani text-[20px] font-medium tracking-wider uppercase truncate`}>
                      {branding.showTeamLogos !== false && (
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                          {team.logo ? <img src={team.logo} className="w-full h-full object-contain" /> : <Shield className="w-4 h-4 text-white/30" />}
                        </div>
                      )}
                      <span className={`truncate leading-none ${isRank1 ? 'text-white' : 'text-white/90'}`}>{team.name}</span>
                    </div>

                    {hasStatusColumn && (
                        <div className="w-[6%] shrink-0 flex items-center justify-center">
                          {branding.championRushEnabled ? (
                            team.totalPoints >= (branding.championRushThreshold || 70) ? (
                              <Target className={`w-4 h-4 ${isRank1 ? 'text-amber-400' : 'text-amber-500/80'}`} />
                            ) : null
                          ) : (
                            index < (branding.qualificationThreshold || 4) && (
                              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                            )
                          )}
                        </div>
                    )}

                    {branding.showMatches !== false && (
                      <div className="w-[8%] shrink-0 text-center font-rajdhani text-[18px] text-white/50">{team.matchesPlayed}</div>
                    )}
                    <div className="w-[10%] shrink-0 text-center font-rajdhani text-[18px] text-white/70">{String(team.booyahs).padStart(2, '0')}</div>
                    <div className="w-[14%] shrink-0 text-center font-rajdhani text-[18px] text-white/70">{team.placementPoints}</div>
                    <div className="w-[10%] shrink-0 text-center font-rajdhani text-[18px] text-white/70">{team.killPoints}</div>
                    <div className={`w-[14%] shrink-0 text-right pr-4 font-rajdhani text-[22px] font-bold ${isRank1 ? 'text-white' : 'text-white/90'}`}>
                      {team.totalPoints}
                    </div>
                  </div>
                </div>
              )
           })}
        </div>
      </div>
      
      {/* Bottom Footer Section */}
      <div className="flex-1 flex flex-col justify-end px-10 pb-8">
        <div className="flex items-center justify-between w-full border-t border-white/20 pt-4">
          <div className="flex gap-8">
            {branding.youtubeHandle && (
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-rajdhani font-semibold text-[13px] uppercase tracking-widest">YT</span>
                <span className="text-white/80 font-rajdhani font-medium text-[16px] tracking-wider">{branding.youtubeHandle}</span>
              </div>
            )}
            {branding.instagramHandle && (
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-rajdhani font-semibold text-[13px] uppercase tracking-widest">IG</span>
                <span className="text-white/80 font-rajdhani font-medium text-[16px] tracking-wider">{branding.instagramHandle}</span>
              </div>
            )}
          </div>
          {branding.sponsorName && (
             <div className="flex items-center gap-3">
               <span className="text-white/40 font-rajdhani font-semibold text-[13px] uppercase tracking-widest">SPONSORED BY</span>
               {branding.sponsorLogo && <img src={branding.sponsorLogo} className="h-6 w-auto object-contain grayscale opacity-70" alt="Sponsor" />}
               <span className="text-white/80 font-rajdhani font-medium text-[16px] tracking-wider">{branding.sponsorName}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

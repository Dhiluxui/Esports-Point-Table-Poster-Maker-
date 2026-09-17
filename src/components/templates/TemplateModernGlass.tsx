import React from 'react';
import { Target, Crown, Shield } from 'lucide-react';
import { Branding, TeamScore } from '../../types';

interface Props {
  branding: Branding;
  teams: TeamScore[];
}

export function TemplateModernGlass({ branding, teams }: Props) {
  const isShowQualification = branding.showQualification !== false && !branding.championRushEnabled;
  const hasStatusColumn = isShowQualification || branding.championRushEnabled;

  return (
    <div className="relative z-10 flex flex-col h-full mt-4">
      {/* 1. Tagline */}
      {branding.tagline ? (
        <div className="flex justify-center items-center mb-3 mt-2 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-1 border border-white/20">
            <span className="font-rajdhani text-[14px] font-bold tracking-[0.3em] text-white uppercase">
              {branding.tagline}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-[30px] mb-3 mt-2"></div>
      )}

      {/* 2. Top Header */}
      <div className="relative z-10 w-[90%] mx-auto flex flex-col items-center mb-6">
        <h1 className="font-oswald uppercase flex flex-col items-center text-center" style={{ lineHeight: '1.1' }}>
          {branding.title?.split('\n').map((line, i) => (
            <div 
              key={i} 
              className="block text-[60px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-wide drop-shadow-sm"
            >
              {line}
            </div>
          ))}
        </h1>
        {(branding.organizationName || branding.subtitle) && (
          <div className="flex items-center gap-4 mt-2">
            {branding.organizationName && (
              <span className="text-[16px] font-rajdhani font-semibold text-white/80 uppercase tracking-widest">
                {branding.organizationName}
              </span>
            )}
            {branding.organizationName && branding.subtitle && (
              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            )}
            {branding.subtitle && (
              <span className="text-[16px] font-rajdhani font-medium text-white/60 uppercase tracking-widest">
                {branding.subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Main Data Table */}
      <div className="relative z-20 w-[92%] mx-auto flex flex-col">
        {/* Table Header */}
        <div className="flex items-center px-6 mb-3">
          <div className="flex-1 flex font-rajdhani font-bold text-[14px] text-white/50 tracking-widest uppercase items-center">
             <div className="w-[8%] shrink-0 text-center">#</div>
             <div style={{ width: `${100 - 8 - 12 - 14 - 10 - 14 - (branding.showMatches !== false ? 8 : 0) - (hasStatusColumn ? 6 : 0)}%` }} className="pl-4 shrink-0 text-left">TEAM</div>
             {hasStatusColumn && <div className="w-[6%] shrink-0 text-center">ST</div>}
             {branding.showMatches !== false && <div className="w-[8%] shrink-0 text-center">M</div>}
             <div className="w-[12%] shrink-0 text-center">WWCD</div>
             <div className="w-[14%] shrink-0 text-center">PLACE</div>
             <div className="w-[10%] shrink-0 text-center">KILL</div>
             <div className="w-[14%] shrink-0 text-center">TOTAL</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-2">
           {teams.slice(0, 12).map((team, index) => {
              const isRank1 = index === 0;
              return (
                <div key={team.id} className={`flex h-[40px] w-full items-center text-white rounded-xl backdrop-blur-md border ${isRank1 ? 'bg-white/20 border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  <div className="flex-1 flex h-full items-center px-6">
                    <div className="w-[8%] shrink-0 flex items-center justify-center font-rajdhani text-[18px] font-bold text-white/70">
                      {index + 1}
                    </div>

                    <div style={{ width: `${100 - 8 - 12 - 14 - 10 - 14 - (branding.showMatches !== false ? 8 : 0) - (hasStatusColumn ? 6 : 0)}%` }} className={`pl-2 shrink-0 flex items-center gap-3 font-rajdhani text-[19px] font-bold tracking-wide uppercase truncate`}>
                      {branding.showTeamLogos !== false && (
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 overflow-hidden bg-black/20">
                          {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : <Shield className="w-3.5 h-3.5 text-white/40" />}
                        </div>
                      )}
                      <span className={`truncate leading-none ${isRank1 ? 'text-white' : 'text-white/90'}`}>{team.name}</span>
                    </div>

                    {hasStatusColumn && (
                        <div className="w-[6%] shrink-0 flex items-center justify-center">
                          {branding.championRushEnabled ? (
                            team.totalPoints >= (branding.championRushThreshold || 70) ? (
                              <Crown className={`w-4 h-4 ${isRank1 ? 'text-white' : 'text-white/60'}`} />
                            ) : null
                          ) : (
                            index < (branding.qualificationThreshold || 4) && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isRank1 ? 'bg-white' : 'bg-white/50'}`}></div>
                            )
                          )}
                        </div>
                    )}

                    {branding.showMatches !== false && (
                      <div className="w-[8%] shrink-0 text-center font-rajdhani font-semibold text-[17px] text-white/60">{team.matchesPlayed}</div>
                    )}
                    <div className="w-[12%] shrink-0 text-center font-rajdhani font-semibold text-[17px] text-white/80">{team.booyahs}</div>
                    <div className="w-[14%] shrink-0 text-center font-rajdhani font-semibold text-[17px] text-white/80">{team.placementPoints}</div>
                    <div className="w-[10%] shrink-0 text-center font-rajdhani font-semibold text-[17px] text-white/80">{team.killPoints}</div>
                    <div className={`w-[14%] shrink-0 text-center font-rajdhani text-[20px] font-black ${isRank1 ? 'text-white' : 'text-white'}`}>
                      {team.totalPoints}
                    </div>
                  </div>
                </div>
              )
           })}
        </div>
      </div>
      
      {/* Bottom Footer Section */}
      <div className="flex-1 flex flex-col justify-end px-12 pb-6">
        <div className="flex items-center justify-between w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex gap-6">
            {branding.youtubeHandle && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" /></svg>
                </div>
                <span className="text-white font-rajdhani font-semibold text-[15px] tracking-wider">{branding.youtubeHandle}</span>
              </div>
            )}
            {branding.instagramHandle && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2.163c3.204,0,3.584,0.012,4.85,0.07c1.366,0.062,2.633,0.342,3.608,1.317c0.975,0.975,1.255,2.242,1.317,3.608 c0.058,1.266,0.07,1.646,0.07,4.85s-0.012,3.584-0.07,4.85c-0.062,1.366-0.342,2.633-1.317,3.608 c-0.975,0.975-2.242,1.255-3.608,1.317c-1.266,0.058-1.646,0.07-4.85,0.07s-3.584-0.012-4.85-0.07 c-1.366-0.062-2.633-0.342-3.608-1.317c-0.975-0.975-1.255-2.242-1.317-3.608c-0.058-1.266-0.07-1.646-0.07-4.85 s0.012-3.584,0.07-4.85c0.062-1.366,0.342-2.633,1.317-3.608c0.975-0.975,2.242-1.255,3.608-1.317 C8.416,2.175,8.796,2.163,12,2.163 M12,0C8.741,0,8.333,0.014,7.053,0.072C5.775,0.13,4.902,0.333,4.14,0.63 c-0.789,0.306-1.459,0.717-2.126,1.384C1.347,2.681,0.935,3.351,0.63,4.14C0.333,4.902,0.13,5.775,0.072,7.053 C0.014,8.333,0,8.741,0,12s0.014,3.667,0.072,4.947c0.058,1.278,0.261,2.151,0.558,2.913c0.306,0.789,0.717,1.459,1.384,2.126 c0.667,0.666,1.336,1.079,2.126,1.384c0.762,0.297,1.635,0.5,2.913,0.558C8.333,23.986,8.741,24,12,24s3.667-0.014,4.947-0.072 c1.278-0.058,2.151-0.261,2.913-0.558c0.789-0.306,1.459-0.717,2.126-1.384c0.666-0.667,1.079-1.336,1.384-2.126 c0.297-0.762,0.5-1.635,0.558-2.913C23.986,15.667,24,15.259,24,12s-0.014-3.667-0.072-4.947c-0.058-1.278-0.261-2.151-0.558-2.913 c-0.306-0.789-0.717-1.459-1.384-2.126C21.319,1.347,20.651,0.935,19.86,0.63c-0.762-0.297-1.635-0.5-2.913-0.558 C15.667,0.014,15.259,0,12,0L12,0z M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162 c3.403,0,6.162-2.759,6.162-6.162C18.162,8.597,15.403,5.838,12,5.838L12,5.838z M12,16.035c-2.228,0-4.035-1.807-4.035-4.035 c0-2.228,1.807-4.035,4.035-4.035c2.228,0,4.035,1.807,4.035,4.035C16.035,14.228,14.228,16.035,12,16.035L12,16.035z M18.406,4.155 c-0.796,0-1.44,0.645-1.44,1.44c0,0.795,0.644,1.439,1.44,1.439c0.795,0,1.439-0.644,1.439-1.439 C19.845,4.8,19.201,4.155,18.406,4.155L18.406,4.155z" /></svg>
                </div>
                <span className="text-white font-rajdhani font-semibold text-[15px] tracking-wider">{branding.instagramHandle}</span>
              </div>
            )}
          </div>
          {branding.sponsorName && (
             <div className="flex items-center gap-3 pr-2">
               <span className="text-white/40 font-rajdhani font-semibold text-[12px] uppercase tracking-widest">Sponsored By</span>
               {branding.sponsorLogo && <img src={branding.sponsorLogo} className="h-6 w-auto object-contain drop-shadow-sm" alt="Sponsor" />}
               <span className="text-white font-rajdhani font-semibold text-[16px] tracking-wide">{branding.sponsorName}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

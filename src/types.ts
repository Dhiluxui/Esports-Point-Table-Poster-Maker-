export interface TeamScore {
  id: string;
  name: string;
  logo?: string;
  matchesPlayed: number;
  booyahs: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  isChampion?: boolean;
}

export interface Branding {
  backgroundImage: string | null;
  tournamentLogo: string | null;
  topLeftLogo: string | null;
  topRightLogo: string | null;
  sponsorLogo?: string | null;
  collegeLogo?: string | null;
  casterLogo?: string | null;
  instagramHandle: string;
  youtubeHandle: string;
  discordHandle?: string;
  tagline?: string;
  title?: string;
  subtitle?: string;
  footerText?: string;
  organizationName?: string;
  showTeamLogos?: boolean;
  showQualification?: boolean;
  showMatches?: boolean;
  qualificationThreshold?: number;
  stageName?: string;
  championRushEnabled?: boolean;
  championRushThreshold?: number;
  phaseDetails?: {
    enabled: boolean;
    groupCount?: string;
    matchCount?: string;
    qualificationInfo?: string;
    extraInfo?: string;
  };
  sponsorName?: string;
  templateStyle?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    textColor?: string;
  };
}

import re

with open('classic_snippet.txt', 'r') as f:
    snippet = f.read()

template_code = """import React from 'react';
import { Target, Crown } from 'lucide-react';
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
""" + snippet + """
    </>
  );
}
"""

with open('src/components/templates/TemplateClassic.tsx', 'w') as f:
    f.write(template_code)


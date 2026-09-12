import React, { useState } from 'react';
import { getAccessToken, signInWithGoogle } from '../lib/firebase';
import { Download, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { TeamScore } from '../types';

interface GoogleFormsImportProps {
  onImport: (teams: TeamScore[]) => void;
  existingTeamsCount: number;
}

export default function GoogleFormsImport({ onImport, existingTeamsCount }: GoogleFormsImportProps) {
  const [formUrl, setFormUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [previewTeams, setPreviewTeams] = useState<string[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [formQuestions, setFormQuestions] = useState<{ id: string; title: string }[]>([]);

  const extractFormId = (url: string) => {
    try {
      const match = url.match(/\/d\/(.*?)\/|\/d\/(.*?)$/);
      if (match) return match[1] || match[2];
      return url; // Might already be just the ID
    } catch {
      return url;
    }
  };

  const handleFetchForm = async () => {
    if (!formUrl.trim()) {
      setError('Please enter a Google Form URL or ID');
      return;
    }

    setLoading(true);
    setError(null);
    setFormQuestions([]);
    setPreviewTeams([]);

    try {
      let token = await getAccessToken();
      if (!token) {
        const user = await signInWithGoogle();
        if (!user) {
           setError('Authentication required to access Google Forms.');
           setLoading(false);
           return;
        }
        token = await getAccessToken();
        if (!token) throw new Error('Failed to get access token');
      }

      const formId = extractFormId(formUrl);
      
      // Fetch Form Definition
      const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Permission denied. Please ensure you have access to this form.');
        } else {
          setError(`Failed to fetch form details (Error ${response.status})`);
        }
        setLoading(false);
        return;
      }

      const formData = await response.json();
      
      const textQuestions = formData.items
        ?.filter((item: any) => item.questionItem && item.questionItem.question.textQuestion)
        .map((item: any) => ({
          id: item.questionItem.question.questionId,
          title: item.title
        })) || [];

      if (textQuestions.length === 0) {
        setError('No text questions found in this form. Make sure there is a question for the Team Name.');
        setLoading(false);
        return;
      }

      setFormQuestions(textQuestions);
      // Auto-select the most likely "Team Name" question
      const teamNameQ = textQuestions.find((q: any) => q.title.toLowerCase().includes('team name'));
      if (teamNameQ) {
         setSelectedQuestionId(teamNameQ.id);
         await fetchResponses(formId, token, teamNameQ.id);
      } else {
         setSelectedQuestionId(textQuestions[0].id);
         await fetchResponses(formId, token, textQuestions[0].id);
      }

    } catch (err: any) {
      if (err?.code === 'auth/cancelled-popup-request' || err?.message?.includes('cancelled-popup-request')) {
         setError('Sign-in popup was closed or blocked. Please try again and allow the popup.');
      } else {
         setError(err.message || 'An error occurred while fetching the form');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (formId: string, token: string, questionId: string) => {
    try {
      const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
         throw new Error('Failed to fetch form responses');
      }

      const responseData = await response.json();
      const teams = responseData.responses?.map((r: any) => {
        const answer = r.answers?.[questionId]?.textAnswers?.answers?.[0]?.value;
        return answer?.trim();
      }).filter(Boolean) || [];

      // Remove duplicates
      setPreviewTeams([...new Set<string>(teams)]);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch responses');
    }
  };

  const handleConfirmImport = async () => {
     if (previewTeams.length === 0) return;

     const confirmed = window.confirm(
       `Import ${previewTeams.length} teams to the tournament? This will add to existing teams.`
     );

     if (!confirmed) return;

     const newTeams: TeamScore[] = previewTeams.map((name, idx) => ({
        id: `form_imp_${Date.now()}_${idx}`,
        name: name.toUpperCase(),
        matchesPlayed: 0,
        booyahs: 0,
        placementPoints: 0,
        killPoints: 0,
        totalPoints: 0,
     }));

     onImport(newTeams);
     
     // Reset
     setFormUrl('');
     setPreviewTeams([]);
     setFormQuestions([]);
  };

  const handleQuestionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qId = e.target.value;
    setSelectedQuestionId(qId);
    
    setLoading(true);
    const token = await getAccessToken();
    if (token) {
        await fetchResponses(extractFormId(formUrl), token, qId);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#050b1a] border border-cyan-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-cyan-500/10 p-1.5 rounded">
           <Download className="w-4 h-4 text-cyan-400" />
        </div>
        <h3 className="text-sm font-bold text-cyan-100 uppercase tracking-widest">Import from Google Forms</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
            <input 
              type="text" 
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="Google Form ID or Edit URL" 
              className="w-full bg-[#0a142f] border border-cyan-500/20 rounded-lg py-2 pl-9 pr-3 text-sm text-cyan-50 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <button 
            onClick={handleFetchForm}
            disabled={loading || !formUrl.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full md:w-auto md:min-w-[100px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Data'}
          </button>
        </div>
        <p className="text-[10px] text-cyan-600 font-semibold italic">Note: Use the Form ID or the "Edit" URL of the form, not the published "viewform" link.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {formQuestions.length > 0 && (
          <div className="bg-[#0a142f]/50 border border-cyan-900/30 rounded-lg p-3 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1.5">Select question for Team Name</label>
              <select 
                value={selectedQuestionId || ''} 
                onChange={handleQuestionChange}
                className="w-full bg-[#050b1a] border border-cyan-500/20 rounded py-1.5 px-2 text-xs text-cyan-50 focus:outline-none focus:border-cyan-400"
              >
                {formQuestions.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>
            
            {previewTeams.length > 0 ? (
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Found {previewTeams.length} Teams</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-[#050b1a] border border-cyan-500/10 rounded p-2 flex flex-wrap gap-1">
                    {previewTeams.map((t, i) => (
                      <span key={i} className="text-[10px] bg-cyan-900/40 text-cyan-100 px-2 py-0.5 rounded border border-cyan-700/50">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={handleConfirmImport}
                    className="w-full mt-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-bold uppercase tracking-wider text-xs py-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Confirm Import ({previewTeams.length})
                  </button>
               </div>
            ) : (
               <p className="text-xs text-cyan-400/50 italic text-center py-2">No responses found for this question.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

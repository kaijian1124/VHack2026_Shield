import patterns from '../data/patterns.json';

/**
 * Detects language of transcript (simple heuristic for demo)
 */
export function detectLanguage(transcript) {
  const text = transcript.toLowerCase();
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const malayWords = ['polis', 'wang', 'segera', 'akaun', 'bayaran', 'saya', 'anda', 'bank'];
  const malayCount = malayWords.filter(w => text.includes(w)).length;

  if (chineseChars > 5) return 'zh';
  if (malayCount >= 2) return 'ms';
  return 'en';
}

/**
 * Matches a single pattern against transcript
 * Returns { patternId, patternName, matchCount, matchedKeywords, score }
 */
function matchPattern(pattern, transcript, language) {
  const text = transcript.toLowerCase();
  const keywords = pattern.keywords[language] || pattern.keywords['en'];
  const matched = [];

  keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  });

  const matchCount = matched.length;
  const cappedCount = Math.min(matchCount, 3); // cap at 3
  const rawScore = pattern.weight * (cappedCount / 3);
  const score = Math.round(Math.min(rawScore, 100));

  return {
    patternId: pattern.id,
    patternName: pattern.name,
    matchCount,
    matchedKeywords: matched,
    score,
    triggered: matchCount > 0,
  };
}

/**
 * Full analysis of transcript
 * Returns { language, patternResults, triggeredPatterns, overallScore, riskLevel }
 */
export function analyzeTranscript(transcript) {
  const language = detectLanguage(transcript);
  const patternResults = patterns.map(p => matchPattern(p, transcript, language));
  const triggeredPatterns = patternResults.filter(r => r.triggered);

  // Overall score = weighted average of triggered patterns
  let overallScore = 0;
  if (triggeredPatterns.length > 0) {
    const totalScore = triggeredPatterns.reduce((sum, p) => sum + p.score, 0);
    overallScore = Math.round(totalScore / triggeredPatterns.length);

    // Bonus: multiple patterns triggered = higher risk
    const multiPatternBonus = Math.min((triggeredPatterns.length - 1) * 10, 20);
    overallScore = Math.min(overallScore + multiPatternBonus, 100);
  }

  const riskLevel = overallScore <= 30 ? 'Low' : overallScore <= 60 ? 'Medium' : 'High';

  return {
    language,
    patternResults,
    triggeredPatterns,
    overallScore,
    riskLevel,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Risk level config for UI
 */
export const RISK_CONFIG = {
  Low:    { color: '#4CAF50', bg: '#E8F5E9', label: 'Low Risk',    emoji: '✅' },
  Medium: { color: '#FF9800', bg: '#FFF3E0', label: 'Medium Risk', emoji: '⚠️' },
  High:   { color: '#F44336', bg: '#FFEBEE', label: 'High Risk',   emoji: '🚨' },
};

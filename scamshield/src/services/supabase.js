import { createClient } from '@supabase/supabase-js';

// ⚠️ 等 Supabase 设置好后再填入
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hashPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return '***' + digits.slice(-4);
}

export async function uploadCallLog({ callId, callerNumber, callStart, callEnd, overallScore, riskLevel, triggeredPatterns, deviceModel = 'Android', appVersion = '1.0.0' }) {
  try {
    const { data, error } = await supabase.from('call_logs').insert([{
      id: callId,
      caller_number: callerNumber ? hashPhone(callerNumber) : null,
      call_start: callStart,
      call_end: callEnd,
      overall_score: overallScore,
      risk_level: riskLevel.toLowerCase(),
      patterns: triggeredPatterns.map(p => ({ id: p.patternId, score: p.score })),
      device_model: deviceModel,
      app_version: appVersion,
      uploaded: true,
    }]);
    if (error) return { success: false, error };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e };
  }
}

export async function fetchCallHistory(limit = 50) {
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}
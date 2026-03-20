import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RISK_CONFIG } from '../engines/patternEngine';
import allPatterns from '../data/patterns.json';

const RISK_CONFIG_LOCAL = {
  Low:    { color: '#6FAF4F', bg: '#F0F7EB', emoji: '✅', label: 'Low Risk' },
  Medium: { color: '#D4870A', bg: '#FDF3E3', emoji: '⚠️', label: 'Medium Risk' },
  High:   { color: '#C44A3A', bg: '#FAEDEB', emoji: '🚨', label: 'High Risk' },
};

function buildPatternResults(call) {
  // If patternResults already exists and is populated, use it
  if (call.patternResults && call.patternResults.length > 0) return call.patternResults;

  // Otherwise build from patterns_detected (array of name strings from Supabase)
  const detected = call.patterns_detected || call.triggeredPatterns?.map(p => p.patternName) || [];
  const triggeredNames = detected.map(n => n.toLowerCase().replace(/ /g, '_'));

  return allPatterns.map(p => {
    const isTriggered = triggeredNames.some(n =>
      n === p.name ||
      n === p.name.replace(/_/g, ' ') ||
      p.name.includes(n) ||
      n.includes(p.name)
    );
    return {
      patternId: p.id,
      patternName: p.name,
      weight: p.weight,
      score: isTriggered ? p.weight : 0,
      triggered: isTriggered,
      matchedKeywords: [],
    };
  });
}

export default function DetailScreen({ route }) {
  const { call } = route.params;
  const risk = RISK_CONFIG_LOCAL[call.riskLevel] || RISK_CONFIG_LOCAL['Low'];
  const patternResults = buildPatternResults(call);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Risk Hero Badge */}
      <View style={[styles.riskHero, { backgroundColor: risk.bg }]}>
        <Text style={styles.riskEmoji}>{risk.emoji}</Text>
        <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
        <Text style={[styles.riskScore, { color: risk.color }]}>{call.overallScore} / 100</Text>
      </View>

      {/* Meta Info Bento */}
      <View style={styles.bentoCard}>
        <Text style={styles.cardHeader}>Call Details</Text>
        <MetaRow label="Caller" value={call.callerNumber || 'Unknown'} />
        <MetaRow label="Language" value={{ en: 'English', ms: 'Bahasa Melayu', zh: 'Mandarin' }[call.language] || call.language || 'English'} last />
        <MetaRow label="Patterns Triggered" value={`${call.triggeredPatterns?.length || 0} detected`} />
      </View>

      {/* Reasons */}
      {call.reasons?.length > 0 && (
        <View style={styles.bentoCard}>
          <Text style={styles.cardHeader}>📝  Analysis Reasons</Text>
          {call.reasons.map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <View style={styles.reasonDot} />
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pattern Breakdown */}
      <View style={styles.bentoCard}>
        <Text style={styles.cardHeader}>🔍  Pattern Breakdown</Text>
        {patternResults.map((p, i) => {
          const pRisk = p.score > 60 ? 'High' : p.score > 30 ? 'Medium' : 'Low';
          const pColor = p.triggered ? RISK_CONFIG_LOCAL[pRisk].color : '#CED4DA';
          const isLast = i === patternResults.length - 1;
          return (
            <View key={p.patternId} style={[styles.patternRow, !isLast && styles.patternRowBorder]}>
              <View style={styles.patternMeta}>
                <Text style={styles.patternId}>{p.patternId}</Text>
                <Text style={[styles.patternName, { color: p.triggered ? '#212529' : '#ADB5BD' }]}>
                  {p.patternName.replace(/_/g, ' ')}
                </Text>
              </View>
              {p.triggered ? (
                <View style={styles.patternScoreCol}>
                  <Text style={[styles.patternScore, { color: pColor }]}>{p.score}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${p.score}%`, backgroundColor: pColor }]} />
                  </View>
                </View>
              ) : (
                <Text style={styles.patternDash}>—</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Recommendation */}
      {call.recommendation && (
        <View style={[styles.bentoCard, { backgroundColor: '#F0F7EB' }]}>
          <Text style={styles.cardHeader}>💡  Recommendation</Text>
          <Text style={styles.bodyText}>{call.recommendation}</Text>
        </View>
      )}

      {/* High Risk Actions */}
      {call.riskLevel === 'High' && (
        <View style={[styles.bentoCard, { backgroundColor: '#FAEDEB' }]}>
          <Text style={[styles.cardHeader, { color: '#C44A3A' }]}>🚨  Immediate Actions</Text>
          {[
            'Block the caller number immediately',
            'Call NSRC Hotline: 997',
            'File a report at polis.com.my or nearest station',
            'Do NOT transfer any money',
          ].map((action, i) => (
            <View key={i} style={styles.actionRow}>
              <Text style={styles.actionNum}>{i + 1}</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Privacy */}
      <View style={styles.privacyBox}>
        <Text style={styles.privacyText}>🔒  Transcript was processed and deleted. Only this summary is stored.</Text>
      </View>

    </ScrollView>
  );
}

function MetaRow({ label, value, last }) {
  return (
    <View style={[styles.metaRow, !last && styles.metaRowBorder]}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEFF1' },
  content: { padding: 20, paddingBottom: 48 },

  riskHero: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 2,
  },
  riskEmoji: { fontSize: 52 },
  riskLabel: { fontSize: 28, fontWeight: '800', marginTop: 10, letterSpacing: -0.5 },
  riskScore: { fontSize: 16, fontWeight: '600', marginTop: 6, opacity: 0.8 },

  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 2,
  },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 16 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  metaRowBorder: { backgroundColor: 'transparent' },
  metaLabel: { fontSize: 14, color: '#6C757D', fontWeight: '500' },
  metaValue: { fontSize: 14, fontWeight: '700', color: '#212529' },

  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  reasonDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#212529', marginTop: 6, marginRight: 10 },
  reasonText: { flex: 1, fontSize: 14, color: '#495057', lineHeight: 21 },

  patternRow: { paddingVertical: 14 },
  patternRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F6' },
  patternMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  patternId: { fontSize: 11, fontWeight: '700', color: '#ADB5BD', width: 44, textTransform: 'uppercase' },
  patternName: { flex: 1, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  patternScoreCol: { },
  patternScore: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: 6 },
  patternDash: { fontSize: 18, color: '#CED4DA', textAlign: 'right' },
  barBg: { height: 6, backgroundColor: '#F1F4F6', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },

  bodyText: { fontSize: 14, color: '#495057', lineHeight: 22 },

  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  actionNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#C44A3A',
    color: '#fff', fontSize: 13, fontWeight: '800',
    textAlign: 'center', lineHeight: 26, marginRight: 12,
  },
  actionText: { fontSize: 14, color: '#212529', fontWeight: '500', flex: 1 },

  privacyBox: { backgroundColor: '#F1F4F6', borderRadius: 16, padding: 14, alignItems: 'center' },
  privacyText: { fontSize: 12, color: '#6C757D', textAlign: 'center', fontWeight: '500' },
});
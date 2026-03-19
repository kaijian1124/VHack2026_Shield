import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RISK_CONFIG } from '../engines/patternEngine';

export default function DetailScreen({ route }) {
  const { call } = route.params;
  const risk = RISK_CONFIG[call.riskLevel] || RISK_CONFIG['Low'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={[styles.riskHeader, { backgroundColor: risk.bg }]}>
        <Text style={styles.riskEmoji}>{risk.emoji}</Text>
        <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
        <Text style={[styles.riskScore, { color: risk.color }]}>Overall Score: {call.overallScore}/100</Text>
      </View>

      <View style={styles.metaBox}>
        <MetaRow label="Caller" value={call.callerNumber || 'Unknown'} />
        <MetaRow label="Language" value={{ en: 'English', ms: 'Bahasa Melayu', zh: 'Mandarin' }[call.language] || call.language || 'English'} />
        <MetaRow label="Patterns Triggered" value={`${call.triggeredPatterns?.length || 0} of 6`} />
        {call.reasons?.length > 0 && (
          <MetaRow label="Key Reasons" value={call.reasons.length} />
        )}
      </View>

      {call.reasons?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Analysis Reasons</Text>
          {call.reasons.map((r, i) => (
            <Text key={i} style={styles.reasonItem}>• {r}</Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>🔍 Pattern Breakdown</Text>
      {call.patternResults?.map(p => {
        const pRisk = p.score > 60 ? 'High' : p.score > 30 ? 'Medium' : 'Low';
        const pColor = p.triggered ? RISK_CONFIG[pRisk].color : '#CCC';
        return (
          <View key={p.patternId} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternId}>{p.patternId}</Text>
              <Text style={[styles.patternName, { color: p.triggered ? '#333' : '#CCC' }]}>
                {p.patternName.replace(/_/g, ' ')}
              </Text>
              <Text style={[styles.patternScore, { color: pColor }]}>
                {p.triggered ? p.score : '—'}
              </Text>
            </View>
            {p.triggered && (
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${p.score}%`, backgroundColor: pColor }]} />
              </View>
            )}
          </View>
        );
      })}

      {call.recommendation && (
        <View style={styles.recommendationBox}>
          <Text style={styles.sectionTitle}>💡 Recommendation</Text>
          <Text style={styles.recommendationText}>{call.recommendation}</Text>
        </View>
      )}

      <View style={styles.privacyBox}>
        <Text style={styles.privacyText}>🔒 Transcript was processed on-device and has been deleted. Only this summary is stored.</Text>
      </View>

      {call.riskLevel === 'High' && (
        <View style={styles.actionBox}>
          <Text style={styles.actionTitle}>🚨 Recommended Actions</Text>
          <Text style={styles.actionItem}>1. Block the caller number immediately</Text>
          <Text style={styles.actionItem}>2. Call NSRC Hotline: <Text style={styles.hotline}>997</Text></Text>
          <Text style={styles.actionItem}>3. File a report at polis.com.my or nearest station</Text>
          <Text style={styles.actionItem}>4. Do NOT transfer any money</Text>
        </View>
      )}
    </ScrollView>
  );
}

function MetaRow({ label, value }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  riskHeader: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  riskEmoji: { fontSize: 48, marginBottom: 8 },
  riskLabel: { fontSize: 24, fontWeight: '800' },
  riskScore: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  metaBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  metaLabel: { fontSize: 14, color: '#888' },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  reasonItem: { fontSize: 14, color: '#333', marginBottom: 6, lineHeight: 20 },
  patternCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  patternHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  patternId: { fontSize: 12, fontWeight: '700', color: '#888', width: 40 },
  patternName: { flex: 1, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  patternScore: { fontSize: 16, fontWeight: '800' },
  barBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: 8, borderRadius: 4 },
  recommendationBox: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 16, marginBottom: 16 },
  recommendationText: { fontSize: 14, color: '#333', lineHeight: 22 },
  privacyBox: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, marginBottom: 12 },
  privacyText: { fontSize: 12, color: '#5C6BC0', textAlign: 'center' },
  actionBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#E65100', marginBottom: 8 },
  actionItem: { fontSize: 14, color: '#333', marginBottom: 6 },
  hotline: { fontWeight: '800', color: '#F44336' },
});

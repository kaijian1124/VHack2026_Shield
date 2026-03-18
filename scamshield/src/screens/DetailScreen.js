import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RISK_CONFIG } from '../engines/patternEngine';

export default function DetailScreen({ route }) {
  const { call } = route.params;
  const risk = RISK_CONFIG[call.riskLevel];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={[styles.riskHeader, { backgroundColor: risk.bg }]}>
        <Text style={styles.riskEmoji}>{risk.emoji}</Text>
        <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
        <Text style={[styles.riskScore, { color: risk.color }]}>Overall Score: {call.overallScore}/100</Text>
      </View>

      <View style={styles.metaBox}>
        <MetaRow label="Caller" value={call.callerNumber || 'Unknown'} />
        <MetaRow label="Language" value={{ en: 'English', ms: 'Bahasa Melayu', zh: 'Mandarin' }[call.language] || call.language} />
        <MetaRow label="Patterns Triggered" value={`${call.triggeredPatterns?.length || 0} of 6`} />
      </View>

      <Text style={styles.sectionTitle}>Pattern Breakdown</Text>
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
              <>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${p.score}%`, backgroundColor: pColor }]} />
                </View>
                <Text style={styles.matchedKw}>Keywords: {p.matchedKeywords.join(', ')}</Text>
              </>
            )}
          </View>
        );
      })}

      <View style={styles.privacyBox}>
        <Text style={styles.privacyText}>🔒 Transcript was processed on-device and has been deleted. Only this summary is stored.</Text>
      </View>

      {call.riskLevel === 'High' && (
        <View style={styles.actionBox}>
          <Text style={styles.actionTitle}>🚨 Recommended Actions</Text>
          <Text style={styles.actionItem}>• Block the caller number immediately</Text>
          <Text style={styles.actionItem}>• Call NSRC Hotline: <Text style={styles.hotline}>997</Text></Text>
          <Text style={styles.actionItem}>• File a report at polis.com.my or nearest station</Text>
          <Text style={styles.actionItem}>• Do NOT transfer any money</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  patternCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  patternHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  patternId: { fontSize: 12, fontWeight: '700', color: '#888', width: 40 },
  patternName: { flex: 1, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  patternScore: { fontSize: 16, fontWeight: '800' },
  barBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: 8, borderRadius: 4 },
  matchedKw: { fontSize: 11, color: '#888' },
  privacyBox: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 12 },
  privacyText: { fontSize: 12, color: '#5C6BC0', textAlign: 'center' },
  actionBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#E65100', marginBottom: 8 },
  actionItem: { fontSize: 14, color: '#333', marginBottom: 6 },
  hotline: { fontWeight: '800', color: '#F44336' },
});
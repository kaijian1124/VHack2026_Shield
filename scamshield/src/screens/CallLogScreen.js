import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { RISK_CONFIG } from '../engines/patternEngine';

export default function CallLogScreen({ route, navigation }) {
  const callLog = route.params?.callLog || [];

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' });
  }

  function duration(start, end) {
    if (!start || !end) return '--';
    const secs = Math.round((new Date(end) - new Date(start)) / 1000);
    return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Call Log</Text>
      {callLog.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No calls recorded yet.</Text>
          <Text style={styles.emptySubtext}>Start a demo call on the Home screen.</Text>
        </View>
      ) : (
        <FlatList
          data={callLog}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const risk = RISK_CONFIG[item.riskLevel];
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Detail', { call: item })}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.emoji}>{risk.emoji}</Text>
                </View>
                <View style={styles.cardMid}>
                  <Text style={styles.caller}>{item.callerNumber || 'Unknown'}</Text>
                  <Text style={styles.time}>{formatTime(item.callStart)} · {duration(item.callStart, item.callEnd)}</Text>
                  <Text style={styles.patterns}>{item.triggeredPatterns?.length || 0} pattern(s) detected</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: risk.bg }]}>
                  <Text style={[styles.scoreText, { color: risk.color }]}>{item.overallScore}</Text>
                  <Text style={[styles.riskText, { color: risk.color }]}>{item.riskLevel}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  title: { fontSize: 22, fontWeight: '800', color: '#1A237E', padding: 20, paddingBottom: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#888', fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#AAA', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardLeft: { marginRight: 12 },
  emoji: { fontSize: 28 },
  cardMid: { flex: 1 },
  caller: { fontSize: 15, fontWeight: '700', color: '#333' },
  time: { fontSize: 12, color: '#888', marginTop: 2 },
  patterns: { fontSize: 12, color: '#888', marginTop: 2 },
  scoreBadge: { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 60 },
  scoreText: { fontSize: 22, fontWeight: '800' },
  riskText: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
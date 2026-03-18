import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchHistory } from '../services/api';

const RISK_CONFIG = {
  low:    { color: '#4CAF50', bg: '#E8F5E9', emoji: '✅', label: 'Low' },
  medium: { color: '#FF9800', bg: '#FFF3E0', emoji: '⚠️', label: 'Medium' },
  high:   { color: '#F44336', bg: '#FFEBEE', emoji: '🚨', label: 'High' },
};

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setError(null);
      const data = await fetchHistory();
      setLogs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadHistory();
  }

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Analysis History</Text>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}
      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No analysis history yet.</Text>
          <Text style={styles.emptySubtext}>Analyze a call transcript to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const risk = RISK_CONFIG[item.risk_level] || RISK_CONFIG['low'];
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.scoreBadge, { backgroundColor: risk.bg }]}>
                    <Text style={styles.scoreEmoji}>{risk.emoji}</Text>
                    <Text style={[styles.scoreText, { color: risk.color }]}>{item.score}</Text>
                    <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.caller}>{item.caller_number || 'Unknown caller'}</Text>
                    <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                    <Text style={styles.patterns}>
                      {item.patterns_detected?.length || 0} pattern(s) detected
                    </Text>
                  </View>
                </View>
                {item.recommendation && (
                  <Text style={styles.recommendation} numberOfLines={2}>
                    💡 {item.recommendation}
                  </Text>
                )}
              </View>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A237E', padding: 20, paddingBottom: 8 },
  errorBox: { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 12, margin: 16 },
  errorText: { color: '#F44336', fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#888', fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#AAA', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreBadge: { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 60, marginRight: 12 },
  scoreEmoji: { fontSize: 20 },
  scoreText: { fontSize: 20, fontWeight: '800' },
  riskText: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  cardInfo: { flex: 1 },
  caller: { fontSize: 15, fontWeight: '700', color: '#333' },
  time: { fontSize: 12, color: '#888', marginTop: 2 },
  patterns: { fontSize: 12, color: '#888', marginTop: 2 },
  recommendation: { fontSize: 13, color: '#555', fontStyle: 'italic', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8 },
});
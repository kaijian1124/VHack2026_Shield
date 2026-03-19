import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchCallHistory } from '../services/supabase';
import patterns from '../data/patterns.json';

const RISK_CONFIG = {
  low:    { color: '#4CAF50', bg: '#E8F5E9', emoji: '✅', label: 'Low' },
  medium: { color: '#FF9800', bg: '#FFF3E0', emoji: '⚠️', label: 'Medium' },
  high:   { color: '#F44336', bg: '#FFEBEE', emoji: '🚨', label: 'High' },
};

const FILTERS = ['All', 'High', 'Medium', 'Low'];

function enrichPatterns(patternNames, allPatterns) {
  return patternNames.map(name => {
    const normalizedName = name.toLowerCase().replace(/ /g, '_');
    const pattern = allPatterns.find(p => 
      p.name === normalizedName || 
      p.name.toLowerCase() === name.toLowerCase() ||
      p.name.replace(/_/g, ' ').toLowerCase() === name.toLowerCase()
    );
    if (pattern) {
      return {
        patternId: pattern.id,
        patternName: pattern.name,
        weight: pattern.weight,
        score: pattern.weight,
        triggered: true,
        matchedKeywords: [],
      };
    }
    return {
      patternId: 'P000',
      patternName: name.replace(/_/g, ' '),
      weight: 0,
      score: 0,
      triggered: true,
      matchedKeywords: [],
    };
  });
}

function normalizeItem(item, allPatterns) {
  const riskLevel = item.risk_level ? item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1) : 'Low';
  const enrichedPatterns = item.patterns_detected
    ? enrichPatterns(item.patterns_detected, allPatterns)
    : [];

  const allPatternResults = allPatterns.map(p => {
    const found = enrichedPatterns.find(ep => ep.patternId === p.id);
    return found || {
      patternId: p.id,
      patternName: p.name,
      weight: p.weight,
      score: 0,
      triggered: false,
      matchedKeywords: [],
    };
  });

  return {
    id: item.id,
    callerNumber: item.caller_number || 'Unknown',
    callStart: item.call_start || item.created_at,
    callEnd: item.call_end || null,
    language: 'en',
    overallScore: item.overall_score || item.score || 0,
    riskLevel: riskLevel,
    triggeredPatterns: enrichedPatterns,
    patternResults: allPatternResults,
    recommendation: item.recommendation || '',
    reasons: item.reasons || [],
  };
}

export default function HistoryScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCallHistory(50);
      setLogs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function onRefresh() {
    setRefreshing(true);
    loadHistory();
  }

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' });
  }

  const enrichedLogs = logs.map(item => normalizeItem(item, patterns));

  const filteredLogs = filter === 'All'
    ? enrichedLogs
    : enrichedLogs.filter(item => item.riskLevel === filter);

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
      <View style={styles.filterContainer}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {filteredLogs.length === 0 && !error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No analysis history yet.</Text>
          <Text style={styles.emptySubtext}>Analyze a call transcript to get started.</Text>
          <TouchableOpacity
            style={styles.goToAnalyze}
            onPress={() => navigation.navigate('AnalyzeTab')}
          >
            <Text style={styles.goToAnalyzeText}>Go to Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : filteredLogs.length === 0 && error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Could not load history.</Text>
          <Text style={styles.emptySubtext}>Please check your Supabase configuration.</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRefresh}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      
      {filteredLogs.length > 0 && (
        <FlatList
          data={filteredLogs}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const risk = RISK_CONFIG[item.riskLevel.toLowerCase()] || RISK_CONFIG['low'];
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Detail', { call: item })}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.scoreBadge, { backgroundColor: risk.bg }]}>
                    <Text style={styles.scoreEmoji}>{risk.emoji}</Text>
                    <Text style={[styles.scoreText, { color: risk.color }]}>{item.overallScore}</Text>
                    <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.caller}>{item.callerNumber || 'Unknown caller'}</Text>
                    <Text style={styles.time}>{formatTime(item.callStart)}</Text>
                    <Text style={styles.patterns}>
                      {item.triggeredPatterns?.length || 0} pattern(s) detected
                    </Text>
                  </View>
                </View>
                {item.recommendation && (
                  <Text style={styles.recommendation} numberOfLines={2}>
                    💡 {item.recommendation}
                  </Text>
                )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  filterContainer: { flexDirection: 'row', padding: 12, gap: 8 },
  filterBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  filterBtnActive: { backgroundColor: '#3F51B5', borderColor: '#3F51B5' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  errorBox: { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 12, margin: 16 },
  errorText: { color: '#F44336', fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#888', fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#AAA', marginTop: 8 },
  goToAnalyze: { marginTop: 20, backgroundColor: '#3F51B5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  goToAnalyzeText: { color: '#fff', fontWeight: '600' },
  retryBtn: { marginTop: 16, backgroundColor: '#FF9800', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
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

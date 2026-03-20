import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchCallHistory } from '../services/supabase';
import patterns from '../data/patterns.json';

const RISK_CONFIG = {
  low:    { color: '#6FAF4F', bg: '#F0F7EB', emoji: '✅', label: 'Low' },
  medium: { color: '#D4870A', bg: '#FDF3E3', emoji: '⚠️', label: 'Medium' },
  high:   { color: '#C44A3A', bg: '#FAEDEB', emoji: '🚨', label: 'High' },
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
      return { patternId: pattern.id, patternName: pattern.name, weight: pattern.weight, score: pattern.weight, triggered: true, matchedKeywords: [] };
    }
    return { patternId: 'P000', patternName: name.replace(/_/g, ' '), weight: 0, score: 0, triggered: true, matchedKeywords: [] };
  });
}

function normalizeItem(item, allPatterns) {
  const riskLevel = item.risk_level ? item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1) : 'Low';
  const enrichedPatterns = item.patterns_detected ? enrichPatterns(item.patterns_detected, allPatterns) : [];
  const allPatternResults = allPatterns.map(p => {
    const found = enrichedPatterns.find(ep => ep.patternId === p.id);
    return found || { patternId: p.id, patternName: p.name, weight: p.weight, score: 0, triggered: false, matchedKeywords: [] };
  });
  return {
    id: item.id,
    callerNumber: item.caller_number || 'Unknown',
    callStart: item.call_start || item.created_at,
    callEnd: item.call_end || null,
    language: 'en',
    overallScore: item.overall_score || item.score || 0,
    riskLevel,
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

  useEffect(() => { loadHistory(); }, [loadHistory]);

  function onRefresh() { setRefreshing(true); loadHistory(); }

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
        <ActivityIndicator size="large" color="#212529" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌  {error}</Text>
        </View>
      )}

      {/* Empty States */}
      {filteredLogs.length === 0 && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛡️</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySubtitle}>Analyze a call transcript to get started.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('AnalyzeTab')}>
            <Text style={styles.ctaBtnText}>Go to Analysis</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredLogs.length === 0 && error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Could not load history</Text>
          <Text style={styles.emptySubtitle}>Please check your connection and try again.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={onRefresh}>
            <Text style={styles.ctaBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {filteredLogs.length > 0 && (
        <FlatList
          data={filteredLogs}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#212529" />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const risk = RISK_CONFIG[item.riskLevel.toLowerCase()] || RISK_CONFIG['low'];
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Detail', { call: item })}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  {/* Score Badge */}
                  <View style={[styles.scoreBadge, { backgroundColor: risk.bg }]}>
                    <Text style={styles.scoreEmoji}>{risk.emoji}</Text>
                    <Text style={[styles.scoreNum, { color: risk.color }]}>{item.overallScore}</Text>
                    <Text style={[styles.scoreRisk, { color: risk.color }]}>{risk.label}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.cardInfo}>
                    <Text style={styles.callerText}>{item.callerNumber || 'Unknown Caller'}</Text>
                    <Text style={styles.timeText}>{formatTime(item.callStart)}</Text>
                    <View style={styles.patternPill}>
                      <Text style={styles.patternPillText}>
                        {item.triggeredPatterns?.length || 0} pattern{item.triggeredPatterns?.length !== 1 ? 's' : ''} detected
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </View>

                {item.recommendation ? (
                  <View style={styles.recommendationRow}>
                    <Text style={styles.recommendationText} numberOfLines={2}>
                      {item.recommendation}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEFF1' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EAEFF1' },
  loadingText: { marginTop: 14, color: '#6C757D', fontSize: 14, fontWeight: '500' },

  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  filterBtnActive: { backgroundColor: '#212529' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6C757D' },
  filterTextActive: { color: '#F5F6F7' },

  errorBox: { backgroundColor: '#FAEDEB', borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 8 },
  errorText: { color: '#C44A3A', fontSize: 14, fontWeight: '500' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#212529', letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 14, color: '#6C757D', marginTop: 8, textAlign: 'center', fontWeight: '500' },
  ctaBtn: {
    marginTop: 24,
    backgroundColor: '#212529',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
  },
  ctaBtnText: { color: '#F5F6F7', fontWeight: '700', fontSize: 15 },

  listContent: { padding: 16, paddingBottom: 48 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },

  scoreBadge: {
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    minWidth: 64,
    marginRight: 14,
  },
  scoreEmoji: { fontSize: 20 },
  scoreNum: { fontSize: 22, fontWeight: '800', marginTop: 2, letterSpacing: -0.5 },
  scoreRisk: { fontSize: 11, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },

  cardInfo: { flex: 1 },
  callerText: { fontSize: 15, fontWeight: '700', color: '#212529' },
  timeText: { fontSize: 12, color: '#6C757D', marginTop: 3, fontWeight: '500' },
  patternPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EAEFF1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  patternPillText: { fontSize: 11, color: '#6C757D', fontWeight: '600' },

  chevron: { fontSize: 22, color: '#CED4DA', fontWeight: '300', marginLeft: 8 },

  recommendationRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F4F6',
  },
  recommendationText: { fontSize: 13, color: '#6C757D', lineHeight: 18, fontStyle: 'italic' },
});
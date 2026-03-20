import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Easing, TextInput, RefreshControl } from 'react-native';
import { fetchCallHistory } from '../services/supabase';
import patterns from '../data/patterns.json';

const C = {
  bg: '#EEF2EF', surface: '#FFFFFF', dark: '#484F58',
  green: '#006D4B', greenLight: '#E8F5EE', greenAccent: '#4CAF82',
  red: '#D93025', redLight: '#FDECEA',
  amber: '#E8A000', amberLight: '#FFF8E7',
  text: '#1A1F2C', muted: '#6B7280', border: '#E5EAE7',
};

const RISK = {
  low:    { color: C.green, bg: C.greenLight, label: 'VERIFIED',     icon: '✓', darkBg: '#1B4D35' },
  medium: { color: C.amber, bg: C.amberLight, label: 'SUSPICIOUS',   icon: '⚠', darkBg: '#5A3E00' },
  high:   { color: C.red,   bg: C.redLight,   label: 'DANGEROUS',    icon: '!', darkBg: '#5A1A14' },
};

const FILTERS = ['High Risk Only', 'Recent', 'By Score'];

function normalizeItem(item, allPatterns) {
  const riskLevel = item.risk_level ? item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1) : 'Low';
  const detected = item.patterns_detected || [];
  const triggeredNames = detected.map(n => n.toLowerCase().replace(/ /g, '_'));
  const enriched = allPatterns.map(p => {
    const hit = triggeredNames.some(n => n === p.name || n === p.name.replace(/_/g, ' ') || p.name.includes(n));
    return { patternId: p.id, patternName: p.name, weight: p.weight, score: hit ? p.weight : 0, triggered: hit };
  });
  return {
    id: item.id,
    callerNumber: item.caller_number || 'Unknown Caller',
    callStart: item.call_start || item.created_at,
    overallScore: item.overall_score || item.score || 0,
    riskLevel,
    triggeredPatterns: enriched.filter(p => p.triggered),
    patternResults: enriched,
    recommendation: item.recommendation || '',
    reasons: item.reasons || [],
    patterns_detected: item.patterns_detected || [],
  };
}

// ─── Pulsing Active Dot ───────────────────────────────────────────────────────
function PulseDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(pulse, { toValue: 2.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
      <Animated.View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: C.greenAccent, opacity, transform: [{ scale: pulse }] }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.greenAccent }} />
    </View>
  );
}

// ─── Stagger Fade Card ────────────────────────────────────────────────────────
function FadeItem({ children, delay = 0, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>{children}</Animated.View>;
}

// ─── Call Row Icon ────────────────────────────────────────────────────────────
function CallIcon({ riskKey }) {
  const r = RISK[riskKey] || RISK.low;
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (riskKey === 'high') {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])).start();
    }
  }, []);
  return (
    <Animated.View style={[styles.callIcon, { backgroundColor: r.bg, transform: [{ scale: pulse }] }]}>
      <Text style={[styles.callIconTxt, { color: r.color }]}>{r.icon}</Text>
    </Animated.View>
  );
}

export default function HistoryScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Recent');
  const [search, setSearch] = useState('');

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const bannerSlide = useRef(new Animated.Value(30)).current;
  const bannerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(bannerFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(bannerSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, 300);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCallHistory(50);
      setLogs(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  function onRefresh() { setRefreshing(true); loadHistory(); }

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
  }

  let enriched = logs.map(item => normalizeItem(item, patterns));

  if (search.trim()) {
    enriched = enriched.filter(item =>
      item.callerNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.recommendation.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (activeFilter === 'High Risk Only') {
    enriched = enriched.filter(item => item.riskLevel === 'High');
  } else if (activeFilter === 'By Score') {
    enriched = [...enriched].sort((a, b) => b.overallScore - a.overallScore);
  }

  const highCount = logs.filter(l => (l.risk_level || '').toLowerCase() === 'high').length;

  return (
    <View style={styles.container}>

      {/* ── Header ─────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerY }] }]}>
        <Text style={styles.pageTitle}>Call History</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search callers or numbers..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={C.muted}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTERS.map((f, i) => {
            const active = activeFilter === f;
            const isHighRisk = f === 'High Risk Only';
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  active && (isHighRisk ? styles.filterChipHighActive : styles.filterChipActive),
                  !active && styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(active ? 'Recent' : f)}
                activeOpacity={0.75}
              >
                {isHighRisk && <Text style={{ fontSize: 11, marginRight: 4 }}>⚠</Text>}
                <Text style={[styles.filterChipTxt, active && !isHighRisk && { color: C.text }, active && isHighRisk && { color: '#FFF' }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <FlatList
        data={enriched}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.dark} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <>
            {/* AI Shield Banner */}
            <Animated.View style={[styles.aiBanner, { opacity: bannerFade, transform: [{ translateY: bannerSlide }] }]}>
              <View style={styles.aiBannerLeft}>
                <View style={styles.aiShieldIcon}>
                  <Text style={{ fontSize: 18 }}>🛡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiBannerTitle}>AI Fraud Shield Active</Text>
                  <Text style={styles.aiBannerSub}>
                    {highCount > 0
                      ? `Intercepted ${highCount} suspicious call${highCount > 1 ? 's' : ''} in your history.`
                      : 'Real-time engine monitoring all call patterns.'}
                  </Text>
                  <View style={styles.securingRow}>
                    <PulseDot />
                    <Text style={styles.securingTxt}>SECURING LINE...</Text>
                  </View>
                </View>
              </View>
              <View style={styles.aiBannerOrb} />
            </Animated.View>
          </>
        )}
        ListEmptyComponent={() => (
          !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🛡️</Text>
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptySub}>Analyze a call transcript to get started.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Analyze')}>
                <Text style={styles.emptyBtnTxt}>Start Analysis</Text>
              </TouchableOpacity>
            </View>
          )
        )}
        renderItem={({ item, index }) => {
          const riskKey = item.riskLevel.toLowerCase();
          const r = RISK[riskKey] || RISK.low;
          return (
            <FadeItem delay={index * 50} style={styles.callCard}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Detail', { call: item })}
                activeOpacity={0.78}
              >
                <View style={styles.callCardInner}>
                  <CallIcon riskKey={riskKey} />
                  <View style={styles.callInfo}>
                    <Text style={styles.callerName}>{item.callerNumber}</Text>
                    <Text style={[styles.riskLabel, { color: r.color }]}>
                      {item.overallScore}%  {r.label}
                    </Text>
                  </View>
                  <View style={styles.callMeta}>
                    <Text style={styles.callTime}>{formatTime(item.callStart)}</Text>
                    {item.patterns_detected?.length > 0 && (
                      <Text style={styles.callNumber} numberOfLines={1}>
                        {item.patterns_detected[0]?.replace(/_/g, ' ')}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </FadeItem>
          );
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: { backgroundColor: C.bg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 34, fontWeight: '800', color: C.text, letterSpacing: -1, marginBottom: 16 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: C.text },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' },
  filterChipActive: { backgroundColor: C.surface, shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  filterChipHighActive: { backgroundColor: C.red },
  filterChipInactive: { backgroundColor: 'transparent' },
  filterChipTxt: { fontSize: 14, fontWeight: '600', color: C.muted },

  listContent: { padding: 20, paddingTop: 12, paddingBottom: 60 },

  // AI Banner
  aiBanner: { backgroundColor: C.dark, borderRadius: 22, padding: 20, marginBottom: 16, overflow: 'hidden', position: 'relative' },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  aiShieldIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.greenLight, alignItems: 'center', justifyContent: 'center' },
  aiBannerTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', marginBottom: 6, letterSpacing: -0.3 },
  aiBannerSub: { fontSize: 13, color: '#9AA3AF', lineHeight: 19, marginBottom: 12 },
  securingRow: { flexDirection: 'row', alignItems: 'center' },
  securingTxt: { fontSize: 11, fontWeight: '800', color: C.greenAccent, letterSpacing: 1.5 },
  aiBannerOrb: { position: 'absolute', right: -20, top: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Call Cards
  callCard: { backgroundColor: C.surface, borderRadius: 18, marginBottom: 10, shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 1 },
  callCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  callIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  callIconTxt: { fontSize: 18, fontWeight: '800' },
  callInfo: { flex: 1 },
  callerName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  riskLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  callMeta: { alignItems: 'flex-end' },
  callTime: { fontSize: 13, color: C.muted, fontWeight: '600', marginBottom: 3 },
  callNumber: { fontSize: 11, color: C.muted, maxWidth: 90, textAlign: 'right' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: C.muted, marginTop: 6, marginBottom: 24, textAlign: 'center' },
  emptyBtn: { backgroundColor: C.dark, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  emptyBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});